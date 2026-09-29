const express = require('express');
const { body, validationResult } = require('express-validator');
const rateLimit = require('express-rate-limit');
const authMiddleware = require('../middleware/auth');
const { Message } = require('../models');
const { env } = require('../config/env');
const { isEmailConfigured, sendContactNotification } = require('../utils/sendContactNotification');

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
    const message = await Message.create({
      name: req.body.name,
      email: req.body.email,
      subject: req.body.subject,
      message: req.body.message,
      status: 'unread',
      emailDeliveryStatus: isEmailConfigured() ? 'pending' : 'not_configured',
    });

    try {
      if (isEmailConfigured()) {
        message.emailAttemptedAt = new Date();
        const delivery = await sendContactNotification(message);
        message.emailDeliveryStatus = delivery.status;
        message.emailDeliveryError = delivery.error;
        if (delivery.status === 'sent') message.emailSentAt = new Date();
        await message.save();
      }
    } catch (mailError) {
      console.error('Contact notification email failed:', mailError.code || mailError.name || 'mail error');
      message.emailDeliveryStatus = 'failed';
      message.emailDeliveryError = String(mailError.code || mailError.name || 'Mail delivery failed').slice(0, 120);
      await message.save();
    }

    return res.status(201).json({
      success: true,
      message: message.emailDeliveryStatus === 'sent'
        ? 'Message saved and email notification sent.'
        : message.emailDeliveryStatus === 'failed'
          ? 'Message saved, but email delivery failed. The message remains available in the admin inbox.'
          : 'Message saved in the admin inbox. Email notifications are not configured.',
      data: message.toObject(),
    });
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

router.post('/:id/notify', authMiddleware, async (req, res, next) => {
  try {
    const message = await Message.findById(req.params.id);
    if (!message) return res.status(404).json({ success: false, message: 'Message not found', data: {} });
    if (!isEmailConfigured()) {
      message.emailDeliveryStatus = 'not_configured';
      await message.save();
      return res.status(503).json({ success: false, message: 'Configure SMTP credentials before retrying email delivery.', data: message.toObject() });
    }

    message.emailDeliveryStatus = 'pending';
    message.emailDeliveryError = '';
    message.emailAttemptedAt = new Date();
    await message.save();

    try {
      await sendContactNotification(message);
      message.emailDeliveryStatus = 'sent';
      message.emailDeliveryError = '';
      message.emailSentAt = new Date();
      await message.save();
      return res.json({ success: true, message: 'Email notification sent.', data: message.toObject() });
    } catch (mailError) {
      console.error('Contact notification retry failed:', mailError.code || mailError.name || 'mail error');
      message.emailDeliveryStatus = 'failed';
      message.emailDeliveryError = String(mailError.code || mailError.name || 'Mail delivery failed').slice(0, 120);
      await message.save();
      return res.status(502).json({ success: false, message: 'Email delivery failed. The message remains stored in MongoDB.', data: message.toObject() });
    }
  } catch (error) {
    return next(error);
  }
});

router.put('/:id', authMiddleware, async (req, res, next) => {
  if (!['unread', 'read', 'archived'].includes(req.body.status)) {
    return res.status(400).json({ success: false, message: 'Invalid message status', data: {} });
  }
  try {
    const updated = await Message.findByIdAndUpdate(req.params.id, { $set: { status: req.body.status } }, { new: true, runValidators: true });
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
