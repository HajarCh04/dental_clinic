const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const { getAssistants } = require('../controllers/assistantController');

router.get('/', protect, authorize('dentist'), getAssistants);

module.exports = router;
