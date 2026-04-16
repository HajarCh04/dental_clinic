import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { Search, UserPlus, Eye, Edit, Trash2, Download } from 'lucide-react';
import toast from 'react-hot-toast';
import { generatePatientsListPDF } from '../utils/pdfGenerator';

const Patients = () => {
  const [patients, setPatients] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    try {
      const res = await api.get('/patients');
      setPatients(res.data);
    } catch (error) {
      toast.error('Failed to load patients');
    } finally {
      setLoading(false);
    }
  };

  const filteredPatients = patients.filter(p => 
    `${p.first_name} ${p.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.phone?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this patient?')) {
      try {
        await api.delete(`/patients/${id}`);
        toast.success('Patient deleted');
        fetchPatients();
      } catch (error) {
        toast.error('Failed to delete patient');
      }
    }
  };

  const handleDownloadDirectory = () => {
    if (patients.length === 0) {
      toast.error('No patients to export');
      return;
    }
    generatePatientsListPDF(patients);
    toast.success('Patients directory downloaded!');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-slate-800">Patient Management</h1>
        <div className="flex gap-3">
          <button onClick={handleDownloadDirectory} className="btn-secondary flex items-center gap-2">
            <Download size={18} />
            <span>Export PDF</span>
          </button>
          <button 
            onClick={() => navigate('/patients/new')}
            className="btn-primary flex items-center gap-2"
          >
            <UserPlus size={18} />
            <span>Add Patient</span>
          </button>
        </div>
      </div>

      <div className="flex gap-4 items-center bg-white p-4 rounded-xl shadow-soft border border-slate-100">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
          <input 
            type="text" 
            placeholder="Search by name, email or phone..." 
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
                <th className="px-6 py-4 text-sm font-semibold text-slate-600">Patient Name</th>
                <th className="px-6 py-4 text-sm font-semibold text-slate-600">Contact</th>
                <th className="px-6 py-4 text-sm font-semibold text-slate-600">Gender/DOB</th>
                <th className="px-6 py-4 text-sm font-semibold text-slate-600 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr><td colSpan="4" className="px-6 py-10 text-center text-slate-500">Loading patients...</td></tr>
              ) : filteredPatients.length === 0 ? (
                <tr><td colSpan="4" className="px-6 py-10 text-center text-slate-500">No patients found.</td></tr>
              ) : (
                filteredPatients.map((patient) => (
                  <tr key={patient.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center font-bold">
                          {patient.first_name[0]}{patient.last_name[0]}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-800">{patient.first_name} {patient.last_name}</p>
                          <p className="text-xs text-slate-400">ID: #{patient.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      <p>{patient.email || 'No email'}</p>
                      <p>{patient.phone || 'No phone'}</p>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      <p>{patient.gender}</p>
                      <p>{patient.dob ? new Date(patient.dob).toLocaleDateString() : 'N/A'}</p>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button onClick={() => navigate(`/patients/${patient.id}`)} className="p-2 text-slate-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors">
                          <Eye size={18} />
                        </button>
                        <button onClick={() => navigate(`/patients/edit/${patient.id}`)} className="p-2 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors">
                          <Edit size={18} />
                        </button>
                        <button onClick={() => handleDelete(patient.id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                          <Trash2 size={18} />
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
    </div>
  );
};

export default Patients;
