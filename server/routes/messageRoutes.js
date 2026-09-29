const express = require('express');
const { body, validationResult } = require('express-validator');
const rateLimit = require('express-rate-limit');
const authMiddleware = require('../middleware/auth');
const { Message } = require('../models');
const { env } = require('../config/env');

const router = express.Router();

const contactLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: env.messageRateLimitMax,
  message: { success: false, message: 'Too many messages sent. Please try again later.' },
});

router.post('/', contactLimiter, [
  body('name').notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('subject').notEmpty().withMessage('Subject is required'),
  body('message').isLength({ min: 20 }).withMessage('Message must be at least 20 characters long'),
], async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, message: errors.array()[0].msg, data: {} });
  }

  try {
    const message = await Message.create({ ...req.body, status: 'unread' });
    return res.status(201).json({ success: true, message: 'Message sent successfully', data: message.toObject() });
  } catch (error) {
    return next(error);
  }
});

router.get('/', authMiddleware, async (req, res, next) => {
  try {
    const messages = await Message.find().sort({ createdAt: -1 }).lean();
    return res.json({ success: true, message: 'Messages fetched successfully', data: messages });
  } catch (error) {
    return next(error);
  }
});

router.put('/:id', authMiddleware, async (req, res, next) => {
  if (req.body.status && !['unread', 'read', 'archived'].includes(req.body.status)) {
    return res.status(400).json({ success: false, message: 'Invalid message status', data: {} });
  }
  try {
    const updated = await Message.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Message not found', data: {} });
    }
    return res.json({ success: true, message: 'Message updated', data: updated.toObject() });
  } catch (error) {
    return next(error);
  }
});

router.delete('/:id', authMiddleware, async (req, res, next) => {
  try {
    const deleted = await Message.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Message not found', data: {} });
    }
    return res.json({ success: true, message: 'Message deleted', data: {} });
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
