const express = require('express');
const router = express.Router();
const { getInvoices, createInvoice, updateInvoice, deleteInvoice } = require('../controllers/invoiceController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.route('/')
  .get(protect, authorize('assistant', 'dentist', 'admin'), getInvoices)
  .post(protect, authorize('assistant', 'dentist', 'admin'), createInvoice);

router.route('/:id')
  .put(protect, authorize('assistant', 'dentist', 'admin'), updateInvoice)
  .delete(protect, authorize('assistant', 'dentist', 'admin'), deleteInvoice);

module.exports = router;
