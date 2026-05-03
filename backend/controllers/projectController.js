const Project = require('../models/Project');
const Task = require('../models/Task');
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/AppError');

const canAccessProject = async (project, user) => {
  if (user.role === 'admin') return true;
  const uid = user._id.toString();
  if (project.createdBy.toString() === uid) return true;
  return project.members.some((m) => m.toString() === uid);
};

const listProjects = asyncHandler(async (req, res) => {
  let filter = {};
  if (req.user.role !== 'admin') {
    filter = {
      $or: [{ members: req.user._id }, { createdBy: req.user._id }],
    };
  }
  const projects = await Project.find(filter)
    .populate('createdBy', 'name email')
    .populate('members', 'name email role')
    .sort({ updatedAt: -1 });
  res.json({ success: true, projects });
});

const getProject = asyncHandler(async (req, res) => {
  const project = await Project.findById(req.params.id)
    .populate('createdBy', 'name email')
    .populate('members', 'name email role');
  if (!project) throw new AppError('Project not found', 404);
  if (!(await canAccessProject(project, req.user))) {
    throw new AppError('Not authorized to view this project', 403);
  }
  const tasks = await Task.find({ projectId: project._id })
    .populate('assignedTo', 'name email')
    .sort({ dueDate: 1, createdAt: -1 });
  res.json({ success: true, project, tasks });
});

const createProject = asyncHandler(async (req, res) => {
  const { title, description, deadline, status, members } = req.body;
  const memberIds = Array.isArray(members) ? members : [];
  const project = await Project.create({
    title,
    description,
    deadline,
    status,
    members: memberIds,
    createdBy: req.user._id,
  });
  const populated = await Project.findById(project._id)
    .populate('createdBy', 'name email')
    .populate('members', 'name email role');
  res.status(201).json({ success: true, project: populated });
});

const updateProject = asyncHandler(async (req, res) => {
  const project = await Project.findById(req.params.id);
  if (!project) throw new AppError('Project not found', 404);
  if (req.user.role !== 'admin') {
    throw new AppError('Only admins can update projects', 403);
  }
  const { title, description, deadline, status, members } = req.body;
  if (title !== undefined) project.title = title;
  if (description !== undefined) project.description = description;
  if (deadline !== undefined) project.deadline = deadline;
  if (status !== undefined) project.status = status;
  if (members !== undefined) project.members = members;
  await project.save();
  const populated = await Project.findById(project._id)
    .populate('createdBy', 'name email')
    .populate('members', 'name email role');
  res.json({ success: true, project: populated });
});

const deleteProject = asyncHandler(async (req, res) => {
  const project = await Project.findById(req.params.id);
  if (!project) throw new AppError('Project not found', 404);
  if (req.user.role !== 'admin') {
    throw new AppError('Only admins can delete projects', 403);
  }
  await Task.deleteMany({ projectId: project._id });
  await project.deleteOne();
  res.json({ success: true, message: 'Project deleted' });
});

module.exports = {
  listProjects,
  getProject,
  createProject,
  updateProject,
  deleteProject,
};
