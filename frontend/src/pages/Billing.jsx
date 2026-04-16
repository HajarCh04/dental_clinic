import { useState, useEffect } from 'react';
import api from '../services/api';
import { CreditCard, Search, DollarSign, Plus, Trash2, Download } from 'lucide-react';
import toast from 'react-hot-toast';
import Modal from '../components/ui/Modal';
import { generateInvoicePDF } from '../utils/pdfGenerator';

const Billing = () => {
  const [invoices, setInvoices] = useState([]);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [paymentAmount, setPaymentAmount] = useState('');

  const emptyForm = { patient_id: '', amount: '', due_date: '' };
  const [createForm, setCreateForm] = useState(emptyForm);

  useEffect(() => {
    fetchInvoices();
    fetchPatients();
  }, []);

  const fetchInvoices = async () => {
    try {
      const res = await api.get('/invoices');
      setInvoices(res.data);
    } catch (error) {
      toast.error('Failed to load invoices');
    } finally {
      setLoading(false);
    }
  };

  const fetchPatients = async () => {
    try {
      const res = await api.get('/patients');
      setPatients(res.data);
    } catch (e) { /* ignore */ }
  };

  const openPaymentModal = (inv) => {
    setSelectedInvoice(inv);
    setPaymentAmount('');
    setShowPaymentModal(true);
  };

  const handleRecordPayment = async (e) => {
    e.preventDefault();
    if (!selectedInvoice) return;
    const newPaid = Number(selectedInvoice.paid_amount) + Number(paymentAmount);
    const newStatus = newPaid >= Number(selectedInvoice.amount) ? 'paid' : newPaid > 0 ? 'partial' : 'unpaid';
    try {
      await api.put(`/invoices/${selectedInvoice.id}`, {
        paid_amount: Math.min(newPaid, Number(selectedInvoice.amount)),
        status: newStatus
      });
      toast.success('Payment recorded');
      setShowPaymentModal(false);
      fetchInvoices();
    } catch (error) {
      toast.error('Failed to record payment');
    }
  };

  const handleCreateInvoice = async (e) => {
    e.preventDefault();
    try {
      await api.post('/invoices', {
        ...createForm,
        paid_amount: 0,
        status: 'unpaid',
        issued_date: new Date().toISOString().split('T')[0]
      });
      toast.success('Invoice created');
      setShowCreateModal(false);
      setCreateForm(emptyForm);
      fetchInvoices();
    } catch (error) {
      toast.error('Failed to create invoice');
    }
  };

  const handleDeleteInvoice = async (id) => {
    if (window.confirm('Delete this invoice?')) {
      try {
        await api.delete(`/invoices/${id}`);
        toast.success('Invoice deleted');
        fetchInvoices();
      } catch (error) {
        toast.error('Failed to delete invoice');
      }
    }
  };

  const handleDownloadInvoice = (inv) => {
    generateInvoicePDF(inv);
    toast.success('Invoice PDF downloaded!');
  };

  const getStatusBadge = (status) => {
    const base = "px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ";
    switch (status) {
      case 'paid': return base + "bg-emerald-100 text-emerald-700 border border-emerald-200";
      case 'partial': return base + "bg-amber-100 text-amber-700 border border-amber-200";
      case 'unpaid': return base + "bg-red-100 text-red-700 border border-red-200";
      default: return base + "bg-slate-100 text-slate-700 border border-slate-200";
    }
  };

  const filteredInvoices = invoices.filter(inv => 
    inv.patient?.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    inv.patient?.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    inv.status?.includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
          <CreditCard className="text-primary-600" />
          <span>Billing & Invoices</span>
        </h1>
        <div className="flex gap-3">
          <button onClick={() => { setCreateForm(emptyForm); setShowCreateModal(true); }} className="btn-primary flex items-center gap-2">
            <Plus size={18} />
            <span>New Invoice</span>
          </button>
        </div>
      </div>

      <div className="flex gap-4 items-center bg-white p-4 rounded-xl shadow-soft border border-slate-100">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
          <input type="text" placeholder="Search by patient name or status..." className="input-field pl-10" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="px-6 py-4 text-sm font-semibold text-slate-600">Invoice</th>
                <th className="px-6 py-4 text-sm font-semibold text-slate-600">Patient</th>
                <th className="px-6 py-4 text-sm font-semibold text-slate-600">Amount</th>
                <th className="px-6 py-4 text-sm font-semibold text-slate-600">Paid</th>
                <th className="px-6 py-4 text-sm font-semibold text-slate-600">Status</th>
                <th className="px-6 py-4 text-sm font-semibold text-slate-600">Issued</th>
                <th className="px-6 py-4 text-sm font-semibold text-slate-600 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr><td colSpan="7" className="px-6 py-10 text-center text-slate-500">Loading invoices...</td></tr>
              ) : filteredInvoices.length === 0 ? (
                <tr><td colSpan="7" className="px-6 py-10 text-center text-slate-500">No invoices found.</td></tr>
              ) : (
                filteredInvoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 font-mono text-sm text-slate-500">#{inv.id.toString().padStart(5, '0')}</td>
                    <td className="px-6 py-4 font-semibold text-slate-800">{inv.patient?.first_name} {inv.patient?.last_name}</td>
                    <td className="px-6 py-4 font-bold text-slate-800">${Number(inv.amount).toLocaleString()}</td>
                    <td className="px-6 py-4 text-emerald-600 font-semibold">${Number(inv.paid_amount).toLocaleString()}</td>
                    <td className="px-6 py-4"><span className={getStatusBadge(inv.status)}>{inv.status}</span></td>
                    <td className="px-6 py-4 text-sm text-slate-500">{new Date(inv.issued_date).toLocaleDateString()}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button onClick={() => handleDownloadInvoice(inv)} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Download Invoice PDF">
                          <Download size={16} />
                        </button>
                        {inv.status !== 'paid' && (
                          <button onClick={() => openPaymentModal(inv)} className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors" title="Record Payment">
                            <DollarSign size={16} />
                          </button>
                        )}
                        <button onClick={() => handleDeleteInvoice(inv.id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Delete">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Record Payment Modal */}
      <Modal isOpen={showPaymentModal} onClose={() => setShowPaymentModal(false)} title="Record Payment" size="sm">
        {selectedInvoice && (
          <form onSubmit={handleRecordPayment} className="space-y-5">
            <div className="bg-slate-50 p-4 rounded-xl space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Invoice</span>
                <span className="font-mono font-bold">#{selectedInvoice.id.toString().padStart(5, '0')}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Total Amount</span>
                <span className="font-bold text-slate-800">${Number(selectedInvoice.amount).toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Already Paid</span>
                <span className="font-bold text-emerald-600">${Number(selectedInvoice.paid_amount).toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm border-t border-slate-200 pt-2">
                <span className="text-slate-500">Remaining</span>
                <span className="font-bold text-red-600">${(Number(selectedInvoice.amount) - Number(selectedInvoice.paid_amount)).toLocaleString()}</span>
              </div>
            </div>
            <div>
              <label className="label-text">Payment Amount ($) *</label>
              <input type="number" required step="0.01" min="0.01" max={Number(selectedInvoice.amount) - Number(selectedInvoice.paid_amount)} className="input-field" value={paymentAmount} onChange={(e) => setPaymentAmount(e.target.value)} />
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button type="button" onClick={() => setShowPaymentModal(false)} className="btn-secondary">Cancel</button>
              <button type="submit" className="btn-primary px-8">Record Payment</button>
            </div>
          </form>
        )}
      </Modal>

      {/* Create Invoice Modal */}
      <Modal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} title="New Invoice" size="md">
        <form onSubmit={handleCreateInvoice} className="space-y-5">
          <div>
            <label className="label-text">Patient *</label>
            <select required className="input-field" value={createForm.patient_id} onChange={(e) => setCreateForm(prev => ({ ...prev, patient_id: e.target.value }))}>
              <option value="">Select Patient</option>
              {patients.map(p => (
                <option key={p.id} value={p.id}>{p.first_name} {p.last_name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label-text">Amount ($) *</label>
            <input type="number" required step="0.01" min="0.01" className="input-field" value={createForm.amount} onChange={(e) => setCreateForm(prev => ({ ...prev, amount: e.target.value }))} />
          </div>
          <div>
            <label className="label-text">Due Date</label>
            <input type="date" className="input-field" value={createForm.due_date} onChange={(e) => setCreateForm(prev => ({ ...prev, due_date: e.target.value }))} />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setShowCreateModal(false)} className="btn-secondary">Cancel</button>
            <button type="submit" className="btn-primary px-8">Create Invoice</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Billing;
