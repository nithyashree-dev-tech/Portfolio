const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '..', '..', '.env') });

const env = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: Number(process.env.PORT || 5000),
  mongoUri: process.env.MONGODB_URI?.trim() || '',
  mongoDatabase: process.env.MONGODB_DATABASE?.trim() || '',
  mongoDnsServers: (process.env.MONGODB_DNS_SERVERS || '')
    .split(',')
    .map((server) => server.trim())
    .filter(Boolean),
  mongoServerSelectionTimeoutMs: Number(process.env.MONGO_SERVER_SELECTION_TIMEOUT_MS || 10000),
  jwtSecret: process.env.JWT_SECRET || '',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '8h',
  authCookieMaxAgeMs: Number(process.env.AUTH_COOKIE_MAX_AGE_MS || 8 * 60 * 60 * 1000),
  adminEmail: process.env.ADMIN_EMAIL?.trim().toLowerCase() || '',
  adminPassword: process.env.ADMIN_PASSWORD || '',
  contactEmail: process.env.CONTACT_EMAIL?.trim() || process.env.ADMIN_EMAIL?.trim() || '',
  smtpHost: process.env.SMTP_HOST?.trim() || 'smtp.gmail.com',
  smtpPort: Number(process.env.SMTP_PORT || 465),
  smtpSecure: process.env.SMTP_SECURE ? process.env.SMTP_SECURE === 'true' : Number(process.env.SMTP_PORT || 465) === 465,
  smtpUser: process.env.SMTP_USER?.trim() || process.env.ADMIN_EMAIL?.trim() || '',
  smtpPassword: process.env.SMTP_PASSWORD || '',
  smtpFrom: process.env.SMTP_FROM?.trim() || process.env.SMTP_USER?.trim() || process.env.ADMIN_EMAIL?.trim() || '',
  clientOrigins: [...new Set([
    ...(process.env.CLIENT_URL || '').split(','),
    process.env.RENDER_EXTERNAL_URL || '',
    ...(process.env.NODE_ENV === 'production' ? [] : ['http://localhost:5173', 'http://127.0.0.1:5173']),
  ].map((origin) => origin.trim()).filter(Boolean))],
  apiRateLimitWindowMs: Number(process.env.API_RATE_LIMIT_WINDOW_MS || 15 * 60 * 1000),
  apiRateLimitMax: Number(process.env.API_RATE_LIMIT_MAX || 100),
  loginRateLimitMax: Number(process.env.LOGIN_RATE_LIMIT_MAX || 10),
  messageRateLimitMax: Number(process.env.MESSAGE_RATE_LIMIT_MAX || 20),
};

const validateEnv = () => {
  const missing = [];
  if (!env.mongoUri) missing.push('MONGODB_URI');
  if (!env.mongoDatabase) missing.push('MONGODB_DATABASE');
  if (!env.jwtSecret) missing.push('JWT_SECRET');
  if (!env.adminEmail) missing.push('ADMIN_EMAIL');
  if (!env.adminPassword) missing.push('ADMIN_PASSWORD');
  if (!env.clientOrigins.length) missing.push('CLIENT_URL');
  if (missing.length) throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  if (!Number.isInteger(env.port) || env.port < 1 || env.port > 65535) {
    throw new Error('PORT must be an integer between 1 and 65535.');
  }
};

module.exports = { env, validateEnv };