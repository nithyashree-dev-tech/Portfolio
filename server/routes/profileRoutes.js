const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const multer = require('multer');
const { body, validationResult } = require('express-validator');
const authMiddleware = require('../middleware/auth');
const connectDB = require('../config/db');
const { Profile } = require('../models');
const { fallbackData } = require('../utils/mongoFallback');

const router = express.Router();

const resumeUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 8 * 1024 * 1024, files: 1 },
  fileFilter: (req, file, callback) => {
    const isPdf = file.mimetype === 'application/pdf' && path.extname(file.originalname).toLowerCase() === '.pdf';
    callback(isPdf ? null : new Error('Upload a PDF file.'), isPdf);
  },
});

const profileFields = ['name', 'professionalTitle', 'shortBio', 'longBio', 'email', 'location', 'githubUrl', 'linkedinUrl', 'resumeUrl', 'cloudResumeUrl', 'softwareResumeUrl', 'profileImage'];
const pickProfileFields = (body) => Object.fromEntries(profileFields.filter((field) => body[field] !== undefined).map((field) => [field, body[field]]));
const resumeFields = { cloud: 'cloudResumeUrl', software: 'softwareResumeUrl' };
const resumeFileFields = { cloud: 'cloudResumeFileId', software: 'softwareResumeFileId' };
const getResumeBucket = () => new mongoose.mongo.GridFSBucket(mongoose.connection.db, { bucketName: 'resumes' });

router.post('/resumes/:role', authMiddleware, (req, res, next) => {
  if (!resumeFields[req.params.role]) {
    return res.status(400).json({ success: false, message: 'Choose a supported resume role.', data: {} });
  }
  return resumeUpload.single('resume')(req, res, (error) => {
    if (error) {
      const message = error.code === 'LIMIT_FILE_SIZE' ? 'PDF files must be 8 MB or smaller.' : error.message;
      return res.status(400).json({ success: false, message, data: {} });
    }
    return next();
  });
}, async (req, res, next) => {
  if (!req.file) return res.status(400).json({ success: false, message: 'Choose a PDF file to upload.', data: {} });

  if (!connectDB.isDatabaseConnected()) {
    return res.status(503).json({ success: false, message: 'Resume uploads require an active MongoDB connection.', data: {} });
  }

  const field = resumeFileFields[req.params.role];
  const bucket = getResumeBucket();
  let fileId;
  try {
    if (req.file.buffer.subarray(0, 5).toString() !== '%PDF-') {
      return res.status(400).json({ success: false, message: 'The selected file is not a valid PDF.', data: {} });
    }

    const uploadStream = bucket.openUploadStream(`${req.params.role}-resume.pdf`, {
      contentType: 'application/pdf',
      metadata: { role: req.params.role, originalName: path.basename(req.file.originalname) },
    });
    fileId = uploadStream.id;
    await new Promise((resolve, reject) => {
      uploadStream.once('error', reject);
      uploadStream.once('finish', resolve);
      uploadStream.end(req.file.buffer);
    });

    const profile = await Profile.findOne();
    if (!profile) {
      await bucket.delete(fileId);
      return res.status(404).json({ success: false, message: 'Create a profile before uploading resumes.', data: {} });
    }

    profile.set(field, `/api/v1/profile/resumes/${req.params.role}/download`);
    profile.set(resumeFileFields[req.params.role], fileId.toString());
    await profile.save();

    return res.status(201).json({
      success: true,
      message: 'Resume uploaded to MongoDB successfully.',
      data: { url: `/api/v1/profile/resumes/${req.params.role}/download`, fileId: fileId.toString() },
    });
  } catch (error) {
    if (fileId) await bucket.delete(fileId).catch(() => {});
    return next(error);
  }
});

router.get('/resumes/:role/:action', async (req, res, next) => {
  try {
    const fileField = resumeFileFields[req.params.role];
    if (!fileField) return res.status(400).json({ success: false, message: 'Unknown resume role.', data: {} });
    if (!['download', 'preview'].includes(req.params.action)) {
      return res.status(400).json({ success: false, message: 'Unknown resume action.', data: {} });
    }

    if (!connectDB.isDatabaseConnected()) {
      return res.status(503).json({ success: false, message: 'Resume files require an active MongoDB connection.', data: {} });
    }

    const profile = await Profile.findOne().lean();
    const id = profile?.[fileField];
    if (!id || !mongoose.isValidObjectId(id)) {
      return res.status(404).json({ success: false, message: 'No resume has been uploaded for this role yet.', data: {} });
    }

    const bucket = getResumeBucket();
    const file = await bucket.find({ _id: new mongoose.Types.ObjectId(id) }).next();
    if (!file) return res.status(404).json({ success: false, message: 'The stored resume file was not found.', data: {} });

    const filename = `${req.params.role}-resume.pdf`;
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `${req.params.action === 'download' ? 'attachment' : 'inline'}; filename="${filename}"`);
    res.setHeader('Content-Length', file.length);
    bucket.openDownloadStream(new mongoose.Types.ObjectId(id))
      .on('error', next)
      .pipe(res);
  } catch (error) {
    return next(error);
  }
});

router.get('/', async (req, res, next) => {
  try {
    if (!connectDB.isDatabaseConnected()) {
      return res.json({ success: true, message: 'Profile fetched from fallback data', data: fallbackData.profile });
    }
    const profile = await Profile.findOne().lean();
    return res.json({ success: true, message: 'Profile fetched successfully', data: profile || {} });
  } catch (error) {
    return next(error);
  }
});

router.put('/', authMiddleware, [body('name').optional().notEmpty(), body('email').optional().isEmail(), body('githubUrl').optional().isURL(), body('linkedinUrl').optional().isURL(), body('resumeUrl').optional().custom((value) => !value || value.startsWith('/') || /^https?:\/\//.test(value))], async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ success: false, message: errors.array()[0].msg, data: {} });

  try {
    if (!connectDB.isDatabaseConnected()) {
      fallbackData.profile = { ...fallbackData.profile, ...pickProfileFields(req.body) };
      return res.json({ success: true, message: 'Profile updated in fallback data', data: fallbackData.profile });
    }
    const profile = await Profile.findOneAndUpdate({}, pickProfileFields(req.body), { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }).lean();
    return res.json({ success: true, message: 'Profile updated successfully', data: profile });
  } catch (error) {
    return next(error);
  }
});

module.exports = router;