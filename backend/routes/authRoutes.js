const express = require('express');
const { register, login, me } = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const {
  registerRules,
  loginRules,
  validate,
} = require('../middleware/validators');

const router = express.Router();

router.post('/register', registerRules, validate, register);
router.post('/login', loginRules, validate, login);
router.get('/me', protect, me);

module.exports = router;
