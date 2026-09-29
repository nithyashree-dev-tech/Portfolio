const mongoose = require('mongoose');

const adminSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ['admin'], default: 'admin' },
  },
  { timestamps: true },
);

const projectSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, trim: true },
    description: { type: String, required: true, trim: true },
    longDescription: { type: String, required: true, trim: true },
    technologies: [{ type: String }],
    features: [{ type: String }],
    githubUrl: { type: String, default: '' },
    liveUrl: { type: String, default: '' },
    image: { type: String, default: '' },
    featured: { type: Boolean, default: false },
    problem: { type: String, default: '' },
    solution: { type: String, default: '' },
    architecture: { type: String, default: '' },
    auth: { type: String, default: '' },
    database: { type: String, default: '' },
    aiIntegration: { type: String, default: '' },
    challenges: [{ type: String }],
    futureImprovements: [{ type: String }],
    startDate: { type: String, default: '' },
    endDate: { type: String, default: '' },
  },
  { timestamps: true },
);

const certificationSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    issuer: { type: String, required: true, trim: true },
    issueDate: { type: String, default: '' },
    credentialId: { type: String, default: '' },
    credentialUrl: { type: String, default: '' },
    certificateImage: { type: String, default: '' },
    skills: [{ type: String }],
  },
  { timestamps: true },
);

const skillSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    category: { type: String, required: true, trim: true },
    level: {
      type: String,
      enum: ['Hands-on', 'Working Knowledge', 'Familiar', 'Currently Learning'],
      default: 'Working Knowledge',
    },
    icon: { type: String, default: '' },
    order: { type: Number, default: 0 },
  },
  { timestamps: true },
);

const experienceSchema = new mongoose.Schema(
  {
    organization: { type: String, required: true, trim: true },
    role: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    startDate: { type: String, default: '' },
    endDate: { type: String, default: '' },
    technologies: [{ type: String }],
    achievements: [{ type: String }],
  },
  { timestamps: true },
);

const achievementSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    organization: { type: String, required: true, trim: true },
    date: { type: String, default: '' },
    link: { type: String, default: '' },
    image: { type: String, default: '' },
  },
  { timestamps: true },
);

const messageSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true },
    subject: { type: String, required: true, trim: true },
    message: { type: String, required: true, trim: true },
    status: { type: String, enum: ['unread', 'read', 'archived'], default: 'unread' },
    emailDeliveryStatus: { type: String, enum: ['not_configured', 'pending', 'sent', 'failed'], default: 'pending' },
    emailDeliveryError: { type: String, default: '' },
    emailAttemptedAt: { type: Date, default: null },
    emailSentAt: { type: Date, default: null },
  },
  { timestamps: true },
);

const profileSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    professionalTitle: { type: String, default: '', trim: true },
    shortBio: { type: String, default: '', trim: true },
    longBio: { type: String, default: '', trim: true },
    email: { type: String, default: '', trim: true },
    location: { type: String, default: '', trim: true },
    githubUrl: { type: String, default: '', trim: true },
    linkedinUrl: { type: String, default: '', trim: true },
    resumeUrl: { type: String, default: '', trim: true },
    cloudResumeUrl: { type: String, default: '', trim: true },
    softwareResumeUrl: { type: String, default: '', trim: true },
    cloudResumeFileId: { type: String, default: '' },
    softwareResumeFileId: { type: String, default: '' },
    profileImage: { type: String, default: '', trim: true },
    profileImageFileId: { type: String, default: '' },
  },
  { timestamps: true },
);

const galleryPhotoSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 120 },
    caption: { type: String, default: '', trim: true, maxlength: 500 },
    contentType: { type: String, enum: ['image/jpeg', 'image/png', 'image/webp'], required: true },
    gridFsId: { type: String, required: true },
  },
  { timestamps: true },
);

const Admin = mongoose.model('Admin', adminSchema);
const Project = mongoose.model('Project', projectSchema);
const Certification = mongoose.model('Certification', certificationSchema);
const Skill = mongoose.model('Skill', skillSchema);
const Experience = mongoose.model('Experience', experienceSchema);
const Achievement = mongoose.model('Achievement', achievementSchema);
const Message = mongoose.model('Message', messageSchema);
const Profile = mongoose.model('Profile', profileSchema);
const GalleryPhoto = mongoose.model('GalleryPhoto', galleryPhotoSchema);

module.exports = {
  Admin,
  Project,
  Certification,
  Skill,
  Experience,
  Achievement,
  Message,
  Profile,
  GalleryPhoto,
};
