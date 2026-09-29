const express = require('express');
const { body, validationResult } = require('express-validator');
const authMiddleware = require('../middleware/auth');
const { Project } = require('../models');
const connectDB = require('../config/db');
const { fallbackData } = require('../utils/mongoFallback');

const router = express.Router();

router.get('/', async (req, res, next) => {
  try {
    if (!connectDB.isDatabaseConnected()) {
      return res.json({ success: true, message: 'Projects fetched from fallback data', data: fallbackData.projects });
    }
    const projects = await Project.find().sort({ createdAt: -1 }).lean();
    return res.json({ success: true, message: 'Projects fetched successfully', data: projects });
  } catch (error) {
    return next(error);
  }
});

router.get('/:slug', async (req, res, next) => {
  try {
    if (!connectDB.isDatabaseConnected()) {
      const project = fallbackData.projects.find((item) => item.slug === req.params.slug);
      if (!project) {
        return res.status(404).json({ success: false, message: 'Project not found', data: {} });
      }
      return res.json({ success: true, message: 'Project fetched from fallback data', data: project });
    }
    const project = await Project.findOne({ slug: req.params.slug }).lean();
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found', data: {} });
    }
    return res.json({ success: true, message: 'Project fetched successfully', data: project });
  } catch (error) {
    return next(error);
  }
});

router.post('/', authMiddleware, [
  body('title').notEmpty(),
  body('slug').notEmpty(),
  body('description').notEmpty(),
], async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, message: errors.array()[0].msg, data: {} });
  }

  try {
    const created = await Project.create(req.body);
    return res.status(201).json({ success: true, message: 'Project created', data: created.toObject() });
  } catch (error) {
    return next(error);
  }
});

router.put('/:id', authMiddleware, async (req, res, next) => {
  try {
    const updated = await Project.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Project not found', data: {} });
    }
    return res.json({ success: true, message: 'Project updated', data: updated.toObject() });
  } catch (error) {
    return next(error);
  }
});

router.delete('/:id', authMiddleware, async (req, res, next) => {
  try {
    const deleted = await Project.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Project not found', data: {} });
    }
    return res.json({ success: true, message: 'Project deleted', data: {} });
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
