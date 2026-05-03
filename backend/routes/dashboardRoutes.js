const express = require('express');
const { dashboardStats } = require('../controllers/dashboardController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.get('/stats', protect, dashboardStats);

module.exports = router;
