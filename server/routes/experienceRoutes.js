const express = require('express');
const { body, validationResult } = require('express-validator');
const authMiddleware = require('../middleware/auth');
const { Experience } = require('../models');
const connectDB = require('../config/db');
const { fallbackData } = require('../utils/mongoFallback');

const router = express.Router();

router.get('/', async (req, res, next) => {
  try {
    if (!connectDB.isDatabaseConnected()) {
      return res.json({ success: true, message: 'Experience fetched from fallback data', data: fallbackData.experiences });
    }
    const experience = await Experience.find().sort({ createdAt: -1 }).lean();
    return res.json({ success: true, message: 'Experience fetched successfully', data: experience });
  } catch (error) {
    return next(error);
  }
});

router.post('/', authMiddleware, [body('organization').notEmpty(), body('role').notEmpty()], async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, message: errors.array()[0].msg, data: {} });
  }

  try {
    const item = await Experience.create(req.body);
    return res.status(201).json({ success: true, message: 'Experience created', data: item.toObject() });
  } catch (error) {
    return next(error);
  }
});

router.put('/:id', authMiddleware, async (req, res, next) => {
  try {
    const updated = await Experience.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Experience not found', data: {} });
    }
    return res.json({ success: true, message: 'Experience updated', data: updated.toObject() });
  } catch (error) {
    return next(error);
  }
});

router.delete('/:id', authMiddleware, async (req, res, next) => {
  try {
    const deleted = await Experience.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Experience not found', data: {} });
    }
    return res.json({ success: true, message: 'Experience deleted', data: {} });
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
