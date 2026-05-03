const Task = require('../models/Task');
const Project = require('../models/Project');
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/AppError');

const projectAccess = async (projectId, user) => {
  const project = await Project.findById(projectId);
  if (!project) throw new AppError('Project not found', 404);
  if (user.role === 'admin') return project;
  const uid = user._id.toString();
  if (project.createdBy.toString() === uid) return project;
  const isMember = project.members.some((m) => m.toString() === uid);
  if (!isMember) throw new AppError('Not a member of this project', 403);
  return project;
};

const listTasks = asyncHandler(async (req, res) => {
  const { projectId } = req.query;
  let filter = {};
  if (projectId) {
    await projectAccess(projectId, req.user);
    filter.projectId = projectId;
  } else if (req.user.role !== 'admin') {
    const projects = await Project.find({
      $or: [{ members: req.user._id }, { createdBy: req.user._id }],
    }).select('_id');
    const pids = projects.map((p) => p._id);
    filter = {
      $or: [{ projectId: { $in: pids } }, { assignedTo: req.user._id }],
    };
  }
  const tasks = await Task.find(filter)
    .populate('projectId', 'title status')
    .populate('assignedTo', 'name email')
    .sort({ dueDate: 1, createdAt: -1 });
  res.json({ success: true, tasks });
});

const createTask = asyncHandler(async (req, res) => {
  const { projectId } = req.params;
  if (req.user.role !== 'admin') {
    throw new AppError('Only admins can create tasks', 403);
  }
  await projectAccess(projectId, req.user);
  const { title, description, assignedTo, priority, status, dueDate } =
    req.body;
  const task = await Task.create({
    title,
    description,
    assignedTo,
    projectId,
    priority,
    status,
    dueDate,
  });
  const populated = await Task.findById(task._id)
    .populate('projectId', 'title')
    .populate('assignedTo', 'name email');
  res.status(201).json({ success: true, task: populated });
});

const updateTask = asyncHandler(async (req, res) => {
  const task = await Task.findById(req.params.id).populate('projectId');
  if (!task) throw new AppError('Task not found', 404);
  const projectRef = task.projectId?._id || task.projectId;
  await projectAccess(projectRef, req.user);

  if (req.user.role === 'admin') {
    const { title, description, assignedTo, priority, status, dueDate } =
      req.body;
    if (title !== undefined) task.title = title;
    if (description !== undefined) task.description = description;
    if (assignedTo !== undefined) task.assignedTo = assignedTo;
    if (priority !== undefined) task.priority = priority;
    if (status !== undefined) task.status = status;
    if (dueDate !== undefined) task.dueDate = dueDate;
  } else {
    if (task.assignedTo.toString() !== req.user._id.toString()) {
      throw new AppError('You can only update tasks assigned to you', 403);
    }
    const { status } = req.body;
    if (status === undefined) {
      throw new AppError('Members may only update task status', 400);
    }
    task.status = status;
  }
  await task.save();
  const populated = await Task.findById(task._id)
    .populate('projectId', 'title status')
    .populate('assignedTo', 'name email');
  res.json({ success: true, task: populated });
});

const deleteTask = asyncHandler(async (req, res) => {
  if (req.user.role !== 'admin') {
    throw new AppError('Only admins can delete tasks', 403);
  }
  const task = await Task.findById(req.params.id);
  if (!task) throw new AppError('Task not found', 404);
  await projectAccess(task.projectId, req.user);
  await task.deleteOne();
  res.json({ success: true, message: 'Task deleted' });
});

module.exports = { listTasks, createTask, updateTask, deleteTask };
