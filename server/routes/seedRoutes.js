const express = require('express');
const { Project, Certification, Skill, Experience, Achievement, Message } = require('../models');
const { projectSeed, certificationSeed, skillSeed, experienceSeed, achievementSeed, messageSeed, adminSeed } = require('../seed/seedData');

const router = express.Router();

router.post('/all', async (req, res) => {
  try {
    await Promise.all([
      Project.deleteMany({}),
      Certification.deleteMany({}),
      Skill.deleteMany({}),
      Experience.deleteMany({}),
      Achievement.deleteMany({}),
      Message.deleteMany({}),
    ]);

    const [projects, certifications, skills, experiences, achievements, messages] = await Promise.all([
      Project.insertMany(projectSeed),
      Certification.insertMany(certificationSeed),
      Skill.insertMany(skillSeed),
      Experience.insertMany(experienceSeed),
      Achievement.insertMany(achievementSeed),
      Message.insertMany(messageSeed),
    ]);

    res.json({
      success: true,
      message: 'Seed data inserted successfully',
      data: {
        projects: projects.length,
        certifications: certifications.length,
        skills: skills.length,
        experiences: experiences.length,
        achievements: achievements.length,
        messages: messages.length,
        admin: adminSeed.email,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message, data: {} });
  }
});

module.exports = router;
