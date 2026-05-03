const express = require('express');
const {
  listProjects,
  getProject,
  createProject,
  updateProject,
  deleteProject,
} = require('../controllers/projectController');
const { protect, requireAdmin } = require('../middleware/auth');
const {
  projectCreateRules,
  projectUpdateRules,
  mongoIdParam,
  validate,
} = require('../middleware/validators');

const router = express.Router();

router.use(protect);

router.get('/', listProjects);
router.get('/:id', mongoIdParam('id'), validate, getProject);
router.post('/', requireAdmin, projectCreateRules, validate, createProject);
router.put(
  '/:id',
  requireAdmin,
  mongoIdParam('id'),
  validate,
  projectUpdateRules,
  validate,
  updateProject
);
router.delete(
  '/:id',
  requireAdmin,
  mongoIdParam('id'),
  validate,
  deleteProject
);

module.exports = router;
