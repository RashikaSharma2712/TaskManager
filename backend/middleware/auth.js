const jwt = require('jsonwebtoken');
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/AppError');
const User = require('../models/User');

const protect = asyncHandler(async (req, res, next) => {
  let token;
  const header = req.headers.authorization;
  if (header && header.startsWith('Bearer ')) {
    token = header.split(' ')[1];
  }
  if (!token) {
    throw new AppError('Not authorized. No token provided.', 401);
  }
  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    throw new AppError('Not authorized. Invalid token.', 401);
  }
  const user = await User.findById(decoded.id).select('-password');
  if (!user) {
    throw new AppError('User not found.', 401);
  }
  req.user = user;
  next();
});

const requireAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return next(new AppError('Admin access required', 403));
  }
  next();
};

module.exports = { protect, requireAdmin };
