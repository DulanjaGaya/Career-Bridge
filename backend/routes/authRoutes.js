const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const router = express.Router();

const signToken = (user) => jwt.sign(
  {
    userId: user._id,
    role: user.role,
    email: user.email,
  },
  process.env.JWT_SECRET,
  { expiresIn: '7d' }
);

const sendAuthResponse = (res, user, message, statusCode = 200) => {
  res.status(statusCode).json({
    success: true,
    message,
    token: signToken(user),
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      company: user.company,
      studentProfile: user.studentProfile,
    },
  });
};

const registerUser = async (req, res, role, extraFields = {}) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({
      success: false,
      message: 'Name, email and password are required',
    });
  }

  const existing = await User.findOne({ email });
  if (existing) {
    return res.status(400).json({
      success: false,
      message: 'User with this email already exists',
    });
  }

  const user = await User.create({
    name,
    email,
    password: await bcrypt.hash(password, 10),
    role,
    ...extraFields,
  });

  sendAuthResponse(res, user, `${role} registered successfully`, 201);
};

const loginUser = async (req, res, role) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: 'Email and password are required',
    });
  }

  const user = await User.findOne(role ? { email, role } : { email }).select('+password');
  if (!user) {
    return res.status(401).json({
      success: false,
      message: 'Invalid credentials',
    });
  }

  const isMatch = await user.matchPassword(password);
  if (!isMatch) {
    return res.status(401).json({
      success: false,
      message: 'Invalid credentials',
    });
  }

  sendAuthResponse(res, user, 'Login successful');
};

router.post('/signup', async (req, res) => {
  try {
    await registerUser(req, res, req.body.role || 'student');
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to register user', error: error.message });
  }
});

router.post('/login', async (req, res) => {
  try {
    await loginUser(req, res);
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to log in', error: error.message });
  }
});

router.post('/student/register', async (req, res) => {
  try {
    const { university, degree, graduationYear, skills, phone, location, portfolio, bio } = req.body;
    await registerUser(req, res, 'student', {
      studentProfile: {
        university,
        degree,
        graduationYear: graduationYear ? Number(graduationYear) : undefined,
        skills: Array.isArray(skills)
          ? skills
          : (skills ? String(skills).split(',').map((item) => item.trim()).filter(Boolean) : []),
        phone,
        location,
        portfolio,
        bio,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to register student', error: error.message });
  }
});

router.post('/student/login', async (req, res) => {
  try {
    await loginUser(req, res, 'student');
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to log in', error: error.message });
  }
});

router.post('/employer/register', async (req, res) => {
  try {
    const { company } = req.body;
    await registerUser(req, res, 'employer', { company });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to register employer', error: error.message });
  }
});

router.post('/employer/login', async (req, res) => {
  try {
    await loginUser(req, res, 'employer');
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to log in', error: error.message });
  }
});

module.exports = router;