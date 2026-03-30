const express = require('express');
const router = express.Router();
const { getInvoices, createInvoice, updateInvoice, deleteInvoice } = require('../controllers/invoiceController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.route('/')
  .get(protect, authorize('admin', 'assistant'), getInvoices)
  .post(protect, authorize('admin', 'assistant'), createInvoice);

router.route('/:id')
  .put(protect, authorize('admin', 'assistant'), updateInvoice)
  .delete(protect, authorize('admin'), deleteInvoice);

module.exports = router;
