require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

const [email, newPassword] = process.argv.slice(2);

if (!email || !newPassword) {
  console.error('Usage: node scripts/reset-password.js <email> <newPassword>');
  process.exit(1);
}

(async () => {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI is not set');
    }

    await mongoose.connect(process.env.MONGODB_URI);

    const user = await User.findOne({ email }).select('_id email role');
    if (!user) {
      console.error(`User not found for email: ${email}`);
      process.exitCode = 2;
      return;
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await User.updateOne({ _id: user._id }, { $set: { password: hashedPassword } });

    console.log('Password updated', { email: user.email, role: user.role });
  } catch (err) {
    console.error('Failed to reset password:', err.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect().catch(() => {});
  }
})();
