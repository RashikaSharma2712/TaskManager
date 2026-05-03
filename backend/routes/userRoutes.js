const express = require('express');
const { body } = require('express-validator');
const { listUsers, updateProfile } = require('../controllers/userController');
const { protect } = require('../middleware/auth');
const { validate } = require('../middleware/validators');

const router = express.Router();

router.use(protect);

router.get('/', listUsers);

const profileRules = [
  body('name').optional().trim().notEmpty(),
  body('email').optional().isEmail().normalizeEmail(),
];

router.patch('/profile', profileRules, validate, updateProfile);

module.exports = router;
