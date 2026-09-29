const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '..', '.env') });
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
const { Admin, Profile } = require('./models');
const bcrypt = require('bcryptjs');
const { profileSeed } = require('./seed/seedData');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(
  cors({
    origin: (origin, callback) => {
      const configuredOrigins = (process.env.CLIENT_URL || 'http://localhost:5173')
        .split(',')
        .map((value) => value.trim())
        .filter(Boolean);
      const localDevelopmentOrigin = /^https?:\/\/(localhost|127\.0\.0\.1):(5173|5174)$/.test(origin || '');
      if (!origin || configuredOrigins.includes(origin) || (process.env.NODE_ENV !== 'production' && localDevelopmentOrigin)) {
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
app.use('/uploads/resumes', express.static(process.env.RESUME_UPLOAD_DIR || path.resolve(__dirname, 'uploads', 'resumes')));
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
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

app.use(errorHandler);

connectDB()
  .then(async () => {
    try {
      await ensureData();
      if (connectDB.isDatabaseConnected() && process.env.ADMIN_EMAIL && process.env.ADMIN_PASSWORD) {
        await Admin.findOneAndUpdate(
          { email: process.env.ADMIN_EMAIL.toLowerCase() },
          {
            email: process.env.ADMIN_EMAIL.toLowerCase(),
            passwordHash: await bcrypt.hash(process.env.ADMIN_PASSWORD, 12),
            role: 'admin',
          },
          { upsert: true, new: true, setDefaultsOnInsert: true },
        );
      }
      if (connectDB.isDatabaseConnected()) {
        const existingProfile = await Profile.findOne().select('_id').lean();
        if (!existingProfile) await Profile.create(profileSeed);
      }
    } catch (error) {
      console.warn('Seed check failed:', error.message);
    }

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error('Failed to start server', error);
    process.exit(1);
  });
