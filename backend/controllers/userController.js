const User = require('../models/User');
const Project = require('../models/Project');
const asyncHandler = require('../utils/asyncHandler');

const listUsers = asyncHandler(async (req, res) => {
  if (req.user.role === 'admin') {
    const users = await User.find().select('name email role').sort({ name: 1 });
    return res.json({ success: true, users });
  }
  const projects = await Project.find({
    $or: [{ members: req.user._id }, { createdBy: req.user._id }],
  }).select('members createdBy');
  const ids = new Set([req.user._id.toString()]);
  projects.forEach((p) => {
    ids.add(p.createdBy.toString());
    p.members.forEach((m) => ids.add(m.toString()));
  });
  const users = await User.find({ _id: { $in: [...ids] } })
    .select('name email role')
    .sort({ name: 1 });
  res.json({ success: true, users });
});

const updateProfile = asyncHandler(async (req, res) => {
  const { name, email } = req.body;
  const updates = {};
  if (name !== undefined) updates.name = name;
  if (email !== undefined) updates.email = email;
  if (Object.keys(updates).length === 0) {
    const user = await User.findById(req.user._id).select('-password');
    return res.json({ success: true, user });
  }
  const user = await User.findByIdAndUpdate(req.user._id, updates, {
    new: true,
    runValidators: true,
  }).select('-password');
  res.json({ success: true, user });
});

module.exports = { listUsers, updateProfile };
