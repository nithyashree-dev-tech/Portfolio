const mongoose = require('mongoose');
const { env } = require('./env');
let databaseConnected = false;

const connectDB = async () => {
  const mongoUri = env.mongoUri;
  if (!mongoUri) {
    throw new Error('MONGODB_URI is required. Configure your MongoDB Atlas connection string.');
  }

  const schemeEnd = mongoUri.indexOf('://') + 3;
  const authorityEnd = mongoUri.slice(schemeEnd).search(/[/?#]/);
  const authority = mongoUri.slice(schemeEnd, authorityEnd < 0 ? undefined : schemeEnd + authorityEnd);
  if ((authority.match(/@/g) || []).length > 1) {
    throw new Error('MONGODB_URI contains an unescaped @ in its credentials. URL-encode special characters in the database password, for example @ as %40.');
  }

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
    await mongoose.connect(mongoUri, {
      dbName: env.mongoDatabase,
      serverSelectionTimeoutMS: env.mongoServerSelectionTimeoutMs,
    });
    databaseConnected = true;
    console.log('MongoDB Atlas connected successfully');
    return true;
  } catch (error) {
    databaseConnected = false;
    throw new Error('MongoDB Atlas connection failed. Check MONGODB_URI, Atlas Network Access, and database-user permissions.');
  }
};

module.exports = connectDB;
module.exports.isDatabaseConnected = () => databaseConnected;
