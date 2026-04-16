const express = require('express');
const router = express.Router();
const { getDashboardStats, getDentistStats, getAnalytics } = require('../controllers/dashboardController');
const { protect } = require('../middleware/authMiddleware');

router.get('/stats', protect, getDashboardStats);
router.get('/dentist-stats', protect, getDentistStats);

router.get('/analytics', protect, getAnalytics);

module.exports = router;
