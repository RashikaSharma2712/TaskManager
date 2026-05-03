/**
 * Create an admin user (run once after MongoDB is up):
 *   node scripts/seedAdmin.js
 * Env: MONGODB_URI, optional SEED_ADMIN_EMAIL, SEED_ADMIN_PASSWORD, SEED_ADMIN_NAME
 */
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const mongoose = require('mongoose');
const User = require('../models/User');

const run = async () => {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('MONGODB_URI missing');
    process.exit(1);
  }
  await mongoose.connect(uri);
  const email =
    process.env.SEED_ADMIN_EMAIL || 'admin@example.com';
  const password = process.env.SEED_ADMIN_PASSWORD || 'admin123';
  const name = process.env.SEED_ADMIN_NAME || 'Admin User';
  const existing = await User.findOne({ email });
  if (existing) {
    console.log('User already exists:', email);
    process.exit(0);
  }
  await User.create({ name, email, password, role: 'admin' });
  console.log('Admin created:', email, '/', password);
  process.exit(0);
};

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
