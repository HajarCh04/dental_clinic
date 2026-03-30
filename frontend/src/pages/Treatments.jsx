import { useState, useEffect } from 'react';
import api from '../services/api';
import { Activity, Plus, Search, Calendar } from 'lucide-react';
import toast from 'react-hot-toast';

const Treatments = () => {
  const [treatments, setTreatments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchTreatments();
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

  const filteredTreatments = treatments.filter(t => 
    t.patient?.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.patient?.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.procedure_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Activity className="text-primary-600" />
            <span>Treatments Tracker</span>
        </h1>
        <button className="btn-primary flex items-center gap-2">
          <Plus size={18} />
          <span>New Treatment</span>
        </button>
      </div>

      <div className="flex gap-4 items-center bg-white p-4 rounded-xl shadow-soft border border-slate-100">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
          <input 
            type="text" 
            placeholder="Search treatments by procedure or patient..." 
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
                <th className="px-6 py-4 text-sm font-semibold text-slate-600">Patient</th>
                <th className="px-6 py-4 text-sm font-semibold text-slate-600">Procedure</th>
                <th className="px-6 py-4 text-sm font-semibold text-slate-600">Date</th>
                <th className="px-6 py-4 text-sm font-semibold text-slate-600">Cost</th>
                <th className="px-6 py-4 text-sm font-semibold text-slate-600">Perform by</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr><td colSpan="5" className="px-6 py-10 text-center text-slate-500">Loading treatments...</td></tr>
              ) : filteredTreatments.length === 0 ? (
                <tr><td colSpan="5" className="px-6 py-10 text-center text-slate-500">No treatments found.</td></tr>
              ) : (
                filteredTreatments.map((treatment) => (
                  <tr key={treatment.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                        <p className="font-semibold text-slate-800">{treatment.patient.first_name} {treatment.patient.last_name}</p>
                    </td>
                    <td className="px-6 py-4">
                        <p className="text-sm font-medium text-slate-700">{treatment.procedure_name}</p>
                        <p className="text-xs text-slate-400 truncate max-w-xs">{treatment.description}</p>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                        {new Date(treatment.date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 font-bold text-primary-600">
                        ${Number(treatment.cost).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                        {treatment.dentist.name}
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

export default Treatments;
