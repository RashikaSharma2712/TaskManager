

const User = require('../models/User');
const generateToken = require('../utils/generateToken');
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/AppError');

const register = asyncHandler(async (req, res) => {
  const { name, email, password, adminSecret } = req.body;
  const existing = await User.findOne({ email });
  if (existing) {
    throw new AppError('Email already registered', 400);
  }
  let role = 'member';
  if (
    adminSecret &&
    process.env.ADMIN_REGISTRATION_SECRET &&
    adminSecret === process.env.ADMIN_REGISTRATION_SECRET
  ) {
    role = 'admin';
  }
  const user = await User.create({ name, email, password, role });
  const token = generateToken(user._id);
  res.status(201).json({
    success: true,
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  });
});

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.comparePassword(password))) {
    throw new AppError('Invalid email or password', 401);
  }
  const token = generateToken(user._id);
  res.json({
    success: true,
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  });
});

const me = asyncHandler(async (req, res) => {
  res.json({
    success: true,
    user: {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role,
      createdAt: req.user.createdAt,
    },
  });
});

module.exports = { register, login, me };
