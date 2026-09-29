const express = require('express');
const { body, validationResult } = require('express-validator');
const authMiddleware = require('../middleware/auth');
const { Certification } = require('../models');
const connectDB = require('../config/db');
const { fallbackData } = require('../utils/mongoFallback');

const router = express.Router();

router.get('/', async (req, res, next) => {
  try {
    if (!connectDB.isDatabaseConnected()) {
      return res.json({ success: true, message: 'Certifications fetched from fallback data', data: fallbackData.certifications });
    }
    const certifications = await Certification.find().sort({ createdAt: -1 }).lean();
    return res.json({ success: true, message: 'Certifications fetched successfully', data: certifications });
  } catch (error) {
    return next(error);
  }
});

router.post('/', authMiddleware, [body('title').notEmpty(), body('issuer').notEmpty()], async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, message: errors.array()[0].msg, data: {} });
  }

  try {
    const cert = await Certification.create(req.body);
    return res.status(201).json({ success: true, message: 'Certification created', data: cert.toObject() });
  } catch (error) {
    return next(error);
  }
});

router.put('/:id', authMiddleware, async (req, res, next) => {
  try {
    const updated = await Certification.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Certification not found', data: {} });
    }
    return res.json({ success: true, message: 'Certification updated', data: updated.toObject() });
  } catch (error) {
    return next(error);
  }
});

router.delete('/:id', authMiddleware, async (req, res, next) => {
  try {
    const deleted = await Certification.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Certification not found', data: {} });
    }
    return res.json({ success: true, message: 'Certification deleted', data: {} });
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
