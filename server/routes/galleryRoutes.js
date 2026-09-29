const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const authMiddleware = require('../middleware/auth');
const connectDB = require('../config/db');
const { GalleryPhoto } = require('../models');

const router = express.Router();
const maxPhotoBytes = 12 * 1024 * 1024;
const imageTypes = new Set(['image/jpeg', 'image/png', 'image/webp']);
const imageUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: maxPhotoBytes, files: 1 },
  fileFilter: (req, file, callback) => {
    const accepted = imageTypes.has(file.mimetype);
    callback(accepted ? null : new Error('Upload a JPG, PNG, or WebP image.'), accepted);
  },
});

const getGalleryBucket = () => new mongoose.mongo.GridFSBucket(mongoose.connection.db, { bucketName: 'gallery' });

const matchesImageSignature = (buffer, contentType) => {
  if (contentType === 'image/jpeg') return buffer.subarray(0, 3).equals(Buffer.from([0xff, 0xd8, 0xff]));
  if (contentType === 'image/png') return buffer.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]));
  if (contentType === 'image/webp') return buffer.toString('ascii', 0, 4) === 'RIFF' && buffer.toString('ascii', 8, 12) === 'WEBP';
  return false;
};

const toPublicPhoto = (photo) => ({
  _id: photo._id,
  title: photo.title,
  caption: photo.caption,
  contentType: photo.contentType,
  createdAt: photo.createdAt,
  imageUrl: `/api/v1/gallery/${photo._id}/image`,
});

router.get('/', async (req, res, next) => {
  try {
    if (!connectDB.isDatabaseConnected()) {
      return res.status(503).json({ success: false, message: 'Gallery requires an active MongoDB connection.', data: [] });
    }
    const photos = await GalleryPhoto.find().sort({ createdAt: -1 }).lean();
    return res.json({ success: true, message: 'Gallery fetched successfully.', data: photos.map(toPublicPhoto) });
  } catch (error) {
    return next(error);
  }
});

router.get('/:id/image', async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(404).json({ success: false, message: 'Photo not found.', data: {} });
    }
    if (!connectDB.isDatabaseConnected()) {
      return res.status(503).json({ success: false, message: 'Gallery requires an active MongoDB connection.', data: {} });
    }

    const photo = await GalleryPhoto.findById(req.params.id).lean();
    if (!photo || !mongoose.isValidObjectId(photo.gridFsId)) {
      return res.status(404).json({ success: false, message: 'Photo not found.', data: {} });
    }
    const bucket = getGalleryBucket();
    const fileId = new mongoose.Types.ObjectId(photo.gridFsId);
    const file = await bucket.find({ _id: fileId }).next();
    if (!file) return res.status(404).json({ success: false, message: 'Photo file not found.', data: {} });

    res.setHeader('Content-Type', photo.contentType);
    res.setHeader('Content-Length', file.length);
    res.setHeader('Content-Disposition', 'inline');
    res.setHeader('Cache-Control', 'public, max-age=3600');
    return bucket.openDownloadStream(fileId).on('error', next).pipe(res);
  } catch (error) {
    return next(error);
  }
});

router.post('/', authMiddleware, (req, res, next) => imageUpload.single('photo')(req, res, (error) => {
  if (error) {
    const message = error.code === 'LIMIT_FILE_SIZE' ? 'Images must be 12 MB or smaller.' : error.message;
    return res.status(400).json({ success: false, message, data: {} });
  }
  return next();
}), async (req, res, next) => {
  const title = String(req.body.title || '').trim();
  const caption = String(req.body.caption || '').trim();
  if (!req.file) return res.status(400).json({ success: false, message: 'Choose an image to upload.', data: {} });
  if (!title || title.length > 120 || caption.length > 500) {
    return res.status(400).json({ success: false, message: 'Add a title (up to 120 characters) and a caption no longer than 500 characters.', data: {} });
  }
  if (!matchesImageSignature(req.file.buffer, req.file.mimetype)) {
    return res.status(400).json({ success: false, message: 'The selected file does not match a supported image format.', data: {} });
  }
  if (!connectDB.isDatabaseConnected()) {
    return res.status(503).json({ success: false, message: 'Photo uploads require an active MongoDB connection.', data: {} });
  }

  const bucket = getGalleryBucket();
  let fileId;
  try {
    const uploadStream = bucket.openUploadStream(req.file.originalname, {
      contentType: req.file.mimetype,
      metadata: { title },
    });
    fileId = uploadStream.id;
    await new Promise((resolve, reject) => {
      uploadStream.once('error', reject);
      uploadStream.once('finish', resolve);
      uploadStream.end(req.file.buffer);
    });

    const photo = await GalleryPhoto.create({ title, caption, contentType: req.file.mimetype, gridFsId: fileId.toString() });
    return res.status(201).json({ success: true, message: 'Photo uploaded.', data: toPublicPhoto(photo.toObject()) });
  } catch (error) {
    if (fileId) await bucket.delete(fileId).catch(() => {});
    return next(error);
  }
});

router.delete('/:id', authMiddleware, async (req, res, next) => {
  try {
    if (!connectDB.isDatabaseConnected()) {
      return res.status(503).json({ success: false, message: 'Photo deletion requires an active MongoDB connection.', data: {} });
    }
    const photo = await GalleryPhoto.findById(req.params.id);
    if (!photo) return res.status(404).json({ success: false, message: 'Photo not found.', data: {} });

    await getGalleryBucket().delete(new mongoose.Types.ObjectId(photo.gridFsId));
    await photo.deleteOne();
    return res.json({ success: true, message: 'Photo deleted.', data: {} });
  } catch (error) {
    return next(error);
  }
});

module.exports = router;