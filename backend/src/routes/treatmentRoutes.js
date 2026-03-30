const express = require('express');
const router = express.Router();
const { getTreatments, createTreatment, updateTreatment, deleteTreatment } = require('../controllers/treatmentController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.route('/')
  .get(protect, getTreatments)
  .post(protect, authorize('admin', 'dentist'), createTreatment);

router.route('/:id')
  .put(protect, authorize('admin', 'dentist'), updateTreatment)
  .delete(protect, authorize('admin', 'dentist'), deleteTreatment);

module.exports = router;
