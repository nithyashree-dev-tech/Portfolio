const mongoose = require('mongoose');
let databaseConnected = false;

const connectDB = async () => {
  const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/portfolio';

  try {
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 5000,
    });
    databaseConnected = true;
    console.log('MongoDB connected successfully');
    return true;
  } catch (error) {
    databaseConnected = false;
    console.warn('MongoDB connection failed. Continuing with in-memory fallback data.');
    console.warn(error.message);
    return false;
  }
};

module.exports = connectDB;
module.exports.isDatabaseConnected = () => databaseConnected;
