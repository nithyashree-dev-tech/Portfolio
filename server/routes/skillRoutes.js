const express = require('express');
const { body, validationResult } = require('express-validator');
const authMiddleware = require('../middleware/auth');
const { Skill } = require('../models');
const connectDB = require('../config/db');
const { fallbackData } = require('../utils/mongoFallback');

const router = express.Router();

router.get('/', async (req, res, next) => {
  try {
    if (!connectDB.isDatabaseConnected()) {
      return res.json({ success: true, message: 'Skills fetched from fallback data', data: fallbackData.skills });
    }
    const skills = await Skill.find().sort({ order: 1, createdAt: -1 }).lean();
    return res.json({ success: true, message: 'Skills fetched successfully', data: skills });
  } catch (error) {
    return next(error);
  }
});

router.post('/', authMiddleware, [body('name').notEmpty(), body('category').notEmpty()], async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, message: errors.array()[0].msg, data: {} });
  }

  try {
    const skill = await Skill.create(req.body);
    return res.status(201).json({ success: true, message: 'Skill created', data: skill.toObject() });
  } catch (error) {
    return next(error);
  }
});

router.put('/:id', authMiddleware, async (req, res, next) => {
  try {
    const updated = await Skill.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Skill not found', data: {} });
    }
    return res.json({ success: true, message: 'Skill updated', data: updated.toObject() });
  } catch (error) {
    return next(error);
  }
});

router.delete('/:id', authMiddleware, async (req, res, next) => {
  try {
    const deleted = await Skill.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Skill not found', data: {} });
    }
    return res.json({ success: true, message: 'Skill deleted', data: {} });
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
