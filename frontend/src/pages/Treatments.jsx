import { useState, useEffect, useContext } from 'react';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import { Activity, Plus, Search, Edit, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import Modal from '../components/ui/Modal';

const Treatments = () => {
  const [treatments, setTreatments] = useState([]);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const { user } = useContext(AuthContext);

  const emptyForm = { patient_id: '', dentist_id: '', procedure_name: '', description: '', cost: '', date: '', notes: '' };
  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    fetchTreatments();
    fetchPatients();
  }, []);

  const fetchTreatments = async () => {
    try {
      const res = await api.get('/treatments');
      setTreatments(res.data);
    } catch (error) {
      toast.error('Failed to load treatments');
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

  const openCreate = () => {
    setEditing(null);
    setForm({ ...emptyForm, dentist_id: user?.id || '', date: new Date().toISOString().split('T')[0] });
    setShowModal(true);
  };

  const openEdit = (t) => {
    setEditing(t);
    setForm({
      patient_id: t.patient_id,
      dentist_id: t.dentist_id,
      procedure_name: t.procedure_name,
      description: t.description || '',
      cost: t.cost,
      date: t.date?.split('T')[0] || '',
      notes: t.notes || ''
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editing) {
        await api.put(`/treatments/${editing.id}`, form);
        toast.success('Treatment updated');
      } else {
        await api.post('/treatments', form);
        toast.success('Treatment created');
      }
      setShowModal(false);
      fetchTreatments();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error saving treatment');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this treatment record?')) {
      try {
        await api.delete(`/treatments/${id}`);
        toast.success('Treatment deleted');
        fetchTreatments();
      } catch (error) {
        toast.error('Failed to delete treatment');
      }
    }
  };

  const handleChange = (e) => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const filteredTreatments = treatments.filter(t => 
    t.patient?.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.patient?.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.procedure_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
          <Activity className="text-primary-600" />
          <span>Treatments Tracker</span>
        </h1>
        <button onClick={openCreate} className="btn-primary flex items-center gap-2">
          <Plus size={18} />
          <span>New Treatment</span>
        </button>
      </div>

      <div className="flex gap-4 items-center bg-white p-4 rounded-xl shadow-soft border border-slate-100">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
          <input type="text" placeholder="Search treatments by procedure or patient..." className="input-field pl-10" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="px-6 py-4 text-sm font-semibold text-slate-600">Patient</th>
                <th className="px-6 py-4 text-sm font-semibold text-slate-600">Procedure</th>
                <th className="px-6 py-4 text-sm font-semibold text-slate-600">Date</th>
                <th className="px-6 py-4 text-sm font-semibold text-slate-600">Cost</th>
                <th className="px-6 py-4 text-sm font-semibold text-slate-600">Dentist</th>
                <th className="px-6 py-4 text-sm font-semibold text-slate-600 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr><td colSpan="6" className="px-6 py-10 text-center text-slate-500">Loading treatments...</td></tr>
              ) : filteredTreatments.length === 0 ? (
                <tr><td colSpan="6" className="px-6 py-10 text-center text-slate-500">No treatments found.</td></tr>
              ) : (
                filteredTreatments.map((treatment) => (
                  <tr key={treatment.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-semibold text-slate-800">{treatment.patient?.first_name} {treatment.patient?.last_name}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-medium text-slate-700">{treatment.procedure_name}</p>
                      <p className="text-xs text-slate-400 truncate max-w-xs">{treatment.description}</p>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">{new Date(treatment.date).toLocaleDateString()}</td>
                    <td className="px-6 py-4 font-bold text-primary-600">${Number(treatment.cost).toLocaleString()}</td>
                    <td className="px-6 py-4 text-sm text-slate-600">{treatment.dentist?.name}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button onClick={() => openEdit(treatment)} className="p-2 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors">
                          <Edit size={16} />
                        </button>
                        <button onClick={() => handleDelete(treatment.id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
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

      {/* Create/Edit Modal */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editing ? 'Edit Treatment' : 'New Treatment'} size="lg">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="label-text">Patient *</label>
              <select name="patient_id" required className="input-field" value={form.patient_id} onChange={handleChange}>
                <option value="">Select Patient</option>
                {patients.map(p => (
                  <option key={p.id} value={p.id}>{p.first_name} {p.last_name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label-text">Procedure Name *</label>
              <input type="text" name="procedure_name" required className="input-field" value={form.procedure_name} onChange={handleChange} placeholder="e.g. Root Canal, Filling" />
            </div>
            <div>
              <label className="label-text">Cost ($) *</label>
              <input type="number" name="cost" required step="0.01" min="0" className="input-field" value={form.cost} onChange={handleChange} />
            </div>
            <div>
              <label className="label-text">Date *</label>
              <input type="date" name="date" required className="input-field" value={form.date} onChange={handleChange} />
            </div>
          </div>
          <div>
            <label className="label-text">Description</label>
            <textarea name="description" rows="2" className="input-field" value={form.description} onChange={handleChange} placeholder="Procedure details..." />
          </div>
          <div>
            <label className="label-text">Notes</label>
            <textarea name="notes" rows="2" className="input-field" value={form.notes} onChange={handleChange} placeholder="Additional notes..." />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setShowModal(false)} className="btn-secondary">Cancel</button>
            <button type="submit" className="btn-primary px-8">{editing ? 'Update' : 'Create'}</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Treatments;
