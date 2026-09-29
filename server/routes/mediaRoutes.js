const express = require('express');
const { randomUUID } = require('crypto');
const mongoose = require('mongoose');
const multer = require('multer');
const authMiddleware = require('../middleware/auth');
const connectDB = require('../config/db');

const router = express.Router();
const maxImageBytes = 12 * 1024 * 1024;
const imageTypes = new Set(['image/jpeg', 'image/png', 'image/webp']);
const imageUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: maxImageBytes, files: 1 },
  fileFilter: (req, file, callback) => {
    const accepted = imageTypes.has(file.mimetype);
    callback(accepted ? null : new Error('Upload a JPG, PNG, or WebP image.'), accepted);
  },
});

const getBucket = () => new mongoose.mongo.GridFSBucket(mongoose.connection.db, { bucketName: 'siteImages' });
const hasValidSignature = (buffer, contentType) => {
  if (contentType === 'image/jpeg') return buffer.subarray(0, 3).equals(Buffer.from([0xff, 0xd8, 0xff]));
  if (contentType === 'image/png') return buffer.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]));
  return contentType === 'image/webp' && buffer.toString('ascii', 0, 4) === 'RIFF' && buffer.toString('ascii', 8, 12) === 'WEBP';
};

router.post('/images', authMiddleware, (req, res, next) => imageUpload.single('image')(req, res, (error) => {
  if (error) {
    const message = error.code === 'LIMIT_FILE_SIZE' ? 'Images must be 12 MB or smaller.' : error.message;
    return res.status(400).json({ success: false, message, data: {} });
  }
  return next();
}), async (req, res, next) => {
  if (!req.file) return res.status(400).json({ success: false, message: 'Choose an image to upload.', data: {} });
  if (!hasValidSignature(req.file.buffer, req.file.mimetype)) {
    return res.status(400).json({ success: false, message: 'The file contents do not match the selected image type.', data: {} });
  }
  if (!connectDB.isDatabaseConnected()) {
    return res.status(503).json({ success: false, message: 'Image uploads require an active MongoDB connection.', data: {} });
  }

  const bucket = getBucket();
  let fileId;
  try {
    const extension = req.file.mimetype === 'image/jpeg' ? '.jpg' : req.file.mimetype === 'image/png' ? '.png' : '.webp';
    const upload = bucket.openUploadStream(`${randomUUID()}${extension}`, {
      contentType: req.file.mimetype,
      metadata: { originalName: req.file.originalname },
    });
    fileId = upload.id;
    await new Promise((resolve, reject) => {
      upload.once('error', reject);
      upload.once('finish', resolve);
      upload.end(req.file.buffer);
    });
    return res.status(201).json({
      success: true,
      message: 'Image uploaded to MongoDB.',
      data: { imageUrl: `/api/v1/media/images/${fileId}`, fileId: fileId.toString() },
    });
  } catch (error) {
    if (fileId) await bucket.delete(fileId).catch(() => {});
    return next(error);
  }
});

router.get('/images/:id', async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(404).json({ success: false, message: 'Image not found.', data: {} });
    if (!connectDB.isDatabaseConnected()) return res.status(503).json({ success: false, message: 'Images require an active MongoDB connection.', data: {} });
    const bucket = getBucket();
    const fileId = new mongoose.Types.ObjectId(req.params.id);
    const file = await bucket.find({ _id: fileId }).next();
    if (!file) return res.status(404).json({ success: false, message: 'Image not found.', data: {} });
    res.setHeader('Content-Type', file.contentType || 'application/octet-stream');
    res.setHeader('Content-Length', file.length);
    res.setHeader('Content-Disposition', 'inline');
    res.setHeader('Cache-Control', 'public, max-age=3600');
    return bucket.openDownloadStream(fileId).on('error', next).pipe(res);
  } catch (error) {
    return next(error);
  }
});

router.delete('/images/:id', authMiddleware, async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ success: false, message: 'Invalid image identifier.', data: {} });
    }
    if (!connectDB.isDatabaseConnected()) {
      return res.status(503).json({ success: false, message: 'Image deletion requires an active MongoDB connection.', data: {} });
    }
    await getBucket().delete(new mongoose.Types.ObjectId(req.params.id));
    return res.json({ success: true, message: 'Image deleted.', data: {} });
  } catch (error) {
    if (error.code === 'ENOENT') return res.status(404).json({ success: false, message: 'Image not found.', data: {} });
    return next(error);
  }
});

module.exports = router;