import { useState, useEffect } from 'react';
import api from '../services/api';
import { CreditCard, Search, DollarSign, Clock, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const Billing = () => {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchInvoices();
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
    inv.patient?.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    inv.patient?.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    inv.status.includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <CreditCard className="text-primary-600" />
            <span>Billing & Invoices</span>
        </h1>
        <div className="flex gap-3">
          <button className="btn-secondary">Export Revenue Report</button>
          <button className="btn-primary flex items-center gap-2">
            <DollarSign size={18} />
            <span>Record Payment</span>
          </button>
        </div>
      </div>

      <div className="flex gap-4 items-center bg-white p-4 rounded-xl shadow-soft border border-slate-100">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
          <input 
            type="text" 
            placeholder="Search by patient name or status (paid, partial, unpaid)..." 
            className="input-field pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="px-6 py-4 text-sm font-semibold text-slate-600">Invoice ID</th>
                <th className="px-6 py-4 text-sm font-semibold text-slate-600">Patient</th>
                <th className="px-6 py-4 text-sm font-semibold text-slate-600">Amount</th>
                <th className="px-6 py-4 text-sm font-semibold text-slate-600">Paid</th>
                <th className="px-6 py-4 text-sm font-semibold text-slate-600">Status</th>
                <th className="px-6 py-4 text-sm font-semibold text-slate-600">Issued On</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr><td colSpan="6" className="px-6 py-10 text-center text-slate-500">Loading invoices...</td></tr>
              ) : filteredInvoices.length === 0 ? (
                <tr><td colSpan="6" className="px-6 py-10 text-center text-slate-500">No invoices found.</td></tr>
              ) : (
                filteredInvoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 font-mono text-sm text-slate-500">#{inv.id.toString().padStart(5, '0')}</td>
                    <td className="px-6 py-4 font-semibold text-slate-800">
                        {inv.patient.first_name} {inv.patient.last_name}
                    </td>
                    <td className="px-6 py-4 font-bold text-slate-800">
                        ${Number(inv.amount).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-emerald-600 font-semibold">
                        ${Number(inv.paid_amount).toLocaleString()}
                    </td>
                    <td className="px-6 py-4">
                        <span className={getStatusBadge(inv.status)}>{inv.status}</span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-500">
                        {new Date(inv.issued_date).toLocaleDateString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Billing;
