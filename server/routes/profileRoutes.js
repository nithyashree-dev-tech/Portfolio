const express = require('express');
const fs = require('fs');
const path = require('path');
const { randomUUID } = require('crypto');
const multer = require('multer');
const { body, validationResult } = require('express-validator');
const authMiddleware = require('../middleware/auth');
const connectDB = require('../config/db');
const { Profile } = require('../models');
const { fallbackData } = require('../utils/mongoFallback');

const router = express.Router();
const resumeDirectory = process.env.RESUME_UPLOAD_DIR || path.resolve(__dirname, '..', 'uploads', 'resumes');
fs.mkdirSync(resumeDirectory, { recursive: true });

const resumeUpload = multer({
  storage: multer.diskStorage({
    destination: resumeDirectory,
    filename: (req, file, callback) => callback(null, `${randomUUID()}.pdf`),
  }),
  limits: { fileSize: 8 * 1024 * 1024, files: 1 },
  fileFilter: (req, file, callback) => {
    const isPdf = file.mimetype === 'application/pdf' && path.extname(file.originalname).toLowerCase() === '.pdf';
    callback(isPdf ? null : new Error('Upload a PDF file.'), isPdf);
  },
});

const profileFields = ['name', 'professionalTitle', 'shortBio', 'longBio', 'email', 'location', 'githubUrl', 'linkedinUrl', 'resumeUrl', 'cloudResumeUrl', 'softwareResumeUrl', 'profileImage'];
const pickProfileFields = (body) => Object.fromEntries(profileFields.filter((field) => body[field] !== undefined).map((field) => [field, body[field]]));
const resumeFields = { cloud: 'cloudResumeUrl', software: 'softwareResumeUrl' };

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

  try {
    const fileHandle = await fs.promises.open(req.file.path, 'r');
    const signature = Buffer.alloc(5);
    await fileHandle.read(signature, 0, signature.length, 0);
    await fileHandle.close();

    if (signature.toString() !== '%PDF-') {
      await fs.promises.unlink(req.file.path);
      return res.status(400).json({ success: false, message: 'The selected file is not a valid PDF.', data: {} });
    }

    const url = `/uploads/resumes/${req.file.filename}`;
    const field = resumeFields[req.params.role];
    if (!connectDB.isDatabaseConnected()) {
      fallbackData.profile = { ...fallbackData.profile, [field]: url };
    } else {
      const profile = await Profile.findOne();
      if (!profile) {
        await fs.promises.unlink(req.file.path);
        return res.status(404).json({ success: false, message: 'Create a profile before uploading resumes.', data: {} });
      }
      profile.set(field, url);
      await profile.save();
    }

    return res.status(201).json({ success: true, message: 'Resume uploaded successfully.', data: { url } });
  } catch (error) {
    return next(error);
  }
});

router.get('/resumes/:role/download', async (req, res, next) => {
  try {
    const field = resumeFields[req.params.role];
    if (!field) return res.status(400).json({ success: false, message: 'Unknown resume role.', data: {} });

    const profile = connectDB.isDatabaseConnected() ? await Profile.findOne().lean() : fallbackData.profile;
    const resumeUrl = profile?.[field];
    if (!resumeUrl || !resumeUrl.startsWith('/uploads/resumes/')) {
      return res.status(404).json({ success: false, message: 'No resume has been uploaded for this role yet.', data: {} });
    }

    const filePath = path.join(resumeDirectory, path.basename(resumeUrl));
    return res.download(filePath, `${req.params.role}-resume.pdf`, (error) => {
      if (error && !res.headersSent) next(error);
    });
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