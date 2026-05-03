const express = require('express');
const {
  listTasks,
  createTask,
  updateTask,
  deleteTask,
} = require('../controllers/taskController');
const { protect, requireAdmin } = require('../middleware/auth');
const {
  taskCreateRules,
  taskUpdateRules,
  mongoIdParam,
  validate,
} = require('../middleware/validators');

const router = express.Router();

router.use(protect);

router.get('/', listTasks);
router.post(
  '/project/:projectId',
  requireAdmin,
  mongoIdParam('projectId'),
  validate,
  taskCreateRules,
  validate,
  createTask
);
router.patch(
  '/:id',
  mongoIdParam('id'),
  validate,
  taskUpdateRules,
  validate,
  updateTask
);
router.delete(
  '/:id',
  requireAdmin,
  mongoIdParam('id'),
  validate,
  deleteTask
);

module.exports = router;
