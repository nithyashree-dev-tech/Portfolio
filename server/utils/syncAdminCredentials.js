const bcrypt = require('bcryptjs');
const { Admin } = require('../models');
const { env } = require('../config/env');

const syncAdminCredentials = async () => {
  let admin = await Admin.findOne({ email: env.adminEmail });
  if (!admin) admin = await Admin.findOne({ role: 'admin' });
  if (!admin) admin = new Admin({ role: 'admin' });

  const passwordMatches = admin.passwordHash
    ? bcrypt.compareSync(env.adminPassword, admin.passwordHash)
    : false;

  admin.email = env.adminEmail;
  admin.role = 'admin';
  if (!passwordMatches) admin.passwordHash = await bcrypt.hash(env.adminPassword, 12);
  await admin.save();

  return admin;
};

module.exports = syncAdminCredentials;