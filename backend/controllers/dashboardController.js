const Project = require('../models/Project');
const Task = require('../models/Task');
const asyncHandler = require('../utils/asyncHandler');

const startOfToday = () => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
};

const dashboardStats = asyncHandler(async (req, res) => {
  let projectFilter = {};
  let taskFilter = {};
  if (req.user.role !== 'admin') {
    projectFilter = {
      $or: [{ members: req.user._id }, { createdBy: req.user._id }],
    };
    const projects = await Project.find(projectFilter).select('_id');
    const pids = projects.map((p) => p._id);
    taskFilter = {
      $or: [{ projectId: { $in: pids } }, { assignedTo: req.user._id }],
    };
  }

  const [projects, tasks] = await Promise.all([
    Project.find(projectFilter).select('_id'),
    Task.find(taskFilter)
      .populate('assignedTo', 'name')
      .populate('projectId', 'title'),
  ]);

  const totalProjects = projects.length;
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.status === 'completed').length;
  const pendingTasks = tasks.filter((t) => t.status === 'pending').length;
  const inProgressTasks = tasks.filter(
    (t) => t.status === 'in_progress'
  ).length;
  const today = startOfToday();
  const overdueTasks = tasks.filter((t) => {
    if (t.status === 'completed' || !t.dueDate) return false;
    return new Date(t.dueDate) < today;
  }).length;

  const userTaskMap = {};
  tasks.forEach((t) => {
    const name = t.assignedTo?.name || 'Unassigned';
    if (!userTaskMap[name]) userTaskMap[name] = { total: 0, completed: 0 };
    userTaskMap[name].total += 1;
    if (t.status === 'completed') userTaskMap[name].completed += 1;
  });
  const userWiseTasks = Object.entries(userTaskMap).map(([name, v]) => ({
    name,
    total: v.total,
    completed: v.completed,
    pending: v.total - v.completed,
  }));

  const projectProgress = [];
  const projectIds = [...new Set(tasks.map((t) => t.projectId?._id?.toString()).filter(Boolean))];
  for (const pid of projectIds) {
    const pTasks = tasks.filter((t) => t.projectId?._id?.toString() === pid);
    const title = pTasks[0]?.projectId?.title || 'Project';
    const done = pTasks.filter((t) => t.status === 'completed').length;
    projectProgress.push({
      projectId: pid,
      title,
      total: pTasks.length,
      completed: done,
      percent: pTasks.length ? Math.round((done / pTasks.length) * 100) : 0,
    });
  }

  res.json({
    success: true,
    stats: {
      totalProjects,
      totalTasks,
      completedTasks,
      pendingTasks,
      inProgressTasks,
      overdueTasks,
    },
    userWiseTasks,
    projectProgress,
  });
});

module.exports = { dashboardStats };
