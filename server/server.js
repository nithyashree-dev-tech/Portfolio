const { env, validateEnv } = require('./config/env');
const path = require('path');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const connectDB = require('./config/db');
const adminAuthRoutes = require('./routes/authRoutes');
const projectRoutes = require('./routes/projectRoutes');
const certificationRoutes = require('./routes/certificationRoutes');
const skillRoutes = require('./routes/skillRoutes');
const experienceRoutes = require('./routes/experienceRoutes');
const achievementRoutes = require('./routes/achievementRoutes');
const messageRoutes = require('./routes/messageRoutes');
const seedRoutes = require('./routes/seedRoutes');
const profileRoutes = require('./routes/profileRoutes');
const { ensureData } = require('./utils/mongoFallback');
const errorHandler = require('./middleware/errorHandler');
const { Profile } = require('./models');
const syncAdminCredentials = require('./utils/syncAdminCredentials');
const { profileSeed } = require('./seed/seedData');

const app = express();
const PORT = env.port;

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || env.clientOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error('Origin is not allowed by CORS'));
    },
    credentials: true,
  }),
);
app.use(helmet());
app.use(express.json({ limit: '1mb' }));
app.use(morgan('dev'));
app.use(
  rateLimit({
    windowMs: env.apiRateLimitWindowMs,
    max: env.apiRateLimitMax,
    standardHeaders: true,
    legacyHeaders: false,
  }),
);

app.get('/api/v1/health', (req, res) => {
  res.json({ success: true, message: 'Server is healthy', data: {} });
});

app.use('/api/v1/auth', adminAuthRoutes);
app.use('/api/v1/projects', projectRoutes);
app.use('/api/v1/certifications', certificationRoutes);
app.use('/api/v1/skills', skillRoutes);
app.use('/api/v1/experience', experienceRoutes);
app.use('/api/v1/achievements', achievementRoutes);
app.use('/api/v1/messages', messageRoutes);
app.use('/api/v1/seed', seedRoutes);
app.use('/api/v1/profile', profileRoutes);

const clientBuildPath = path.resolve(__dirname, '..', 'client', 'dist');
app.use(express.static(clientBuildPath));
app.get('/{*path}', (req, res, next) => {
  if (req.path.startsWith('/api/')) return next();
  return res.sendFile(path.join(clientBuildPath, 'index.html'), (error) => {
    if (error) next(error);
  });
});

app.use(errorHandler);

validateEnv();
connectDB()
  .then(async () => {
    try {
      await ensureData();
      if (connectDB.isDatabaseConnected()) {
        await syncAdminCredentials();
        console.log('Admin credentials synchronized from environment.');
      }
      const existingProfile = await Profile.findOne().select('_id').lean();
      if (!existingProfile) await Profile.create(profileSeed);
    } catch (error) {
      console.error('Database initialization failed:', error.message);
      process.exit(1);
    }

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error('Failed to start server', error);
    process.exit(1);
  });
