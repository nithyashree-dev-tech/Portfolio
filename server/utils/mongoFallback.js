const { Project, Certification, Skill, Experience, Achievement, Message } = require('../models');
const connectDB = require('../config/db');
const { projectSeed, certificationSeed, skillSeed, experienceSeed, achievementSeed, messageSeed, profileSeed } = require('../seed/seedData');

const fallbackData = {
  projects: [],
  certifications: [],
  skills: [],
  experiences: [],
  achievements: [],
  messages: [],
  profile: { ...profileSeed, _id: 'fallback-profile' },
};

const ensureData = async () => {
  if (!connectDB.isDatabaseConnected()) {
    fallbackData.projects = projectSeed.map((item, index) => ({ ...item, _id: `fallback-project-${index + 1}` }));
    fallbackData.certifications = certificationSeed.map((item, index) => ({ ...item, _id: `fallback-certification-${index + 1}` }));
    fallbackData.skills = skillSeed.map((item, index) => ({ ...item, _id: `fallback-skill-${index + 1}` }));
    fallbackData.experiences = experienceSeed.map((item, index) => ({ ...item, _id: `fallback-experience-${index + 1}` }));
    fallbackData.achievements = achievementSeed.map((item, index) => ({ ...item, _id: `fallback-achievement-${index + 1}` }));
    fallbackData.messages = messageSeed.map((item, index) => ({ ...item, _id: `fallback-message-${index + 1}` }));
    fallbackData.profile = { ...profileSeed, _id: 'fallback-profile' };
    return fallbackData;
  }

  const counts = await Promise.all([
    Project.countDocuments(),
    Certification.countDocuments(),
    Skill.countDocuments(),
    Experience.countDocuments(),
    Achievement.countDocuments(),
    Message.countDocuments(),
  ]);

  const empty = counts.every((count) => count === 0);
  if (empty) {
    await Promise.all([
      Project.insertMany(projectSeed),
      Certification.insertMany(certificationSeed),
      Skill.insertMany(skillSeed),
      Experience.insertMany(experienceSeed),
      Achievement.insertMany(achievementSeed),
      Message.insertMany(messageSeed),
    ]);
  }

  fallbackData.projects = await Project.find().lean();
  fallbackData.certifications = await Certification.find().lean();
  fallbackData.skills = await Skill.find().sort({ order: 1 }).lean();
  fallbackData.experiences = await Experience.find().lean();
  fallbackData.achievements = await Achievement.find().lean();
  fallbackData.messages = await Message.find().sort({ createdAt: -1 }).lean();
  fallbackData.profile = await require('../models').Profile.findOne().lean() || { ...profileSeed, _id: 'fallback-profile' };
  if (!fallbackData.profile._id) fallbackData.profile = { ...fallbackData.profile, _id: 'fallback-profile' };

  return fallbackData;
};

module.exports = { ensureData, fallbackData };
