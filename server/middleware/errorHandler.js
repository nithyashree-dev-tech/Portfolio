const { env } = require('../config/env');

const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Something went wrong';

  res.status(statusCode).json({
    success: false,
    message: env.nodeEnv === 'production' ? 'Something went wrong' : message,
    data: {},
  });
};

module.exports = errorHandler;
