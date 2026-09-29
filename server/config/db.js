const mongoose = require('mongoose');
const dns = require('node:dns');
const { env } = require('./env');
let databaseConnected = false;

const normalizeMongoUri = (uri) => {
  const schemeEnd = uri.indexOf('://') + 3;
  const authorityEnd = uri.slice(schemeEnd).search(/[/?#]/);
  const end = authorityEnd < 0 ? uri.length : schemeEnd + authorityEnd;
  const authority = uri.slice(schemeEnd, end);
  const atSigns = [...authority.matchAll(/@/g)].map((match) => match.index);

  if (atSigns.length <= 1) return uri;

  let normalizedAuthority = '';
  let cursor = 0;
  for (const index of atSigns.slice(0, -1)) {
    normalizedAuthority += `${authority.slice(cursor, index)}%40`;
    cursor = index + 1;
  }
  normalizedAuthority += authority.slice(cursor);

  return `${uri.slice(0, schemeEnd)}${normalizedAuthority}${uri.slice(end)}`;
};

const connectDB = async () => {
  if (!env.mongoUri) {
    throw new Error('MONGODB_URI is required. Configure your MongoDB Atlas connection string.');
  }

  const mongoUri = normalizeMongoUri(env.mongoUri);

  let mongoHost;
  try {
    const parsedUri = new URL(mongoUri);
    if (!['mongodb:', 'mongodb+srv:'].includes(parsedUri.protocol)) {
      throw new Error('Unsupported protocol');
    }
    mongoHost = parsedUri.hostname.toLowerCase();
  } catch {
    throw new Error('MONGODB_URI must be a valid MongoDB Atlas connection string.');
  }

  if (['localhost', '127.0.0.1', '::1'].includes(mongoHost)) {
    throw new Error('Local MongoDB connections are disabled. Configure MongoDB Atlas in MONGODB_URI.');
  }

  try {
    if (env.mongoDnsServers.length) dns.setServers(env.mongoDnsServers);
    await mongoose.connect(mongoUri, {
      dbName: env.mongoDatabase,
      serverSelectionTimeoutMS: env.mongoServerSelectionTimeoutMs,
    });
    databaseConnected = true;
    console.log('MongoDB Atlas connected successfully');
    return true;
  } catch (error) {
    databaseConnected = false;
    const connectionError = new Error('MongoDB Atlas connection failed. Check MONGODB_URI, Atlas Network Access, and database-user permissions.');
    connectionError.cause = error;
    throw connectionError;
  }
};

module.exports = connectDB;
module.exports.isDatabaseConnected = () => databaseConnected;
module.exports.normalizeMongoUri = normalizeMongoUri;
