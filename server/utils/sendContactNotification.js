const nodemailer = require('nodemailer');
const { env } = require('../config/env');

const isEmailConfigured = () => Boolean(env.smtpUser && env.smtpPassword && env.smtpFrom && env.contactEmail);

const sendContactNotification = async (message) => {
  if (!isEmailConfigured()) return { status: 'not_configured', error: '' };

  const transporter = nodemailer.createTransport({
    host: env.smtpHost,
    port: env.smtpPort,
    secure: env.smtpSecure,
    auth: { user: env.smtpUser, pass: env.smtpPassword },
  });
  const safeSubject = message.subject.replace(/[\r\n]+/g, ' ').trim();

  try {
    await transporter.sendMail({
      from: env.smtpFrom,
      to: env.contactEmail,
      replyTo: message.email,
      subject: `New portfolio message: ${safeSubject}`,
      text: [
        `From: ${message.name}`,
        `Email: ${message.email}`,
        `Subject: ${message.subject}`,
        '',
        message.message,
      ].join('\n'),
    });
    return { status: 'sent', error: '' };
  } finally {
    transporter.close();
  }
};

module.exports = { isEmailConfigured, sendContactNotification };