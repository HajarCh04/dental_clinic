const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const { getAssistants, createAssistant, updateAssistant, deleteAssistant } = require('../controllers/assistantController');

router.get('/', protect, authorize('dentist'), getAssistants);
router.post('/', protect, authorize('dentist'), createAssistant);
router.put('/:id', protect, authorize('dentist'), updateAssistant);
router.delete('/:id', protect, authorize('dentist'), deleteAssistant);

module.exports = router;
