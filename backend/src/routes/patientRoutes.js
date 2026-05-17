const express = require('express');
const router = express.Router();
const { getPatients, getPatientById, createPatient, updatePatient, deletePatient } = require('../controllers/patientController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.route('/')
  .get(protect, getPatients)
  .post(protect, authorize('assistant', 'dentist', 'admin'), createPatient);

router.route('/:id')
  .get(protect, getPatientById)
  .put(protect, authorize('assistant', 'dentist', 'admin'), updatePatient)
  .delete(protect, authorize('assistant', 'dentist', 'admin'), deletePatient);

module.exports = router;
