const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '..', '..', '.env') });

const env = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: Number(process.env.PORT || 5000),
  mongoUri: process.env.MONGODB_URI?.trim() || '',
  mongoDatabase: process.env.MONGODB_DATABASE?.trim() || '',
  mongoServerSelectionTimeoutMs: Number(process.env.MONGO_SERVER_SELECTION_TIMEOUT_MS || 10000),
  jwtSecret: process.env.JWT_SECRET || '',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '8h',
  authCookieMaxAgeMs: Number(process.env.AUTH_COOKIE_MAX_AGE_MS || 8 * 60 * 60 * 1000),
  adminEmail: process.env.ADMIN_EMAIL?.trim().toLowerCase() || '',
  adminPassword: process.env.ADMIN_PASSWORD || '',
  clientOrigins: (process.env.CLIENT_URL || '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean),
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