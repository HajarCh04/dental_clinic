const express = require('express');
const router = express.Router();
const { getDashboardStats, getDentistStats } = require('../controllers/dashboardController');
const { protect } = require('../middleware/authMiddleware');

router.get('/stats', protect, getDashboardStats);
router.get('/dentist-stats', protect, getDentistStats);

module.exports = router;
