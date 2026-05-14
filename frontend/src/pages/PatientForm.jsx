import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../services/api';
import { ArrowLeft, Save } from 'lucide-react';
import toast from 'react-hot-toast';

const PatientForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    dob: '',
    gender: 'Male',
    address: '',
    medical_notes: '',
    insurance_type: 'Aucune',
    insurance_id: ''
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isEdit) {
      const fetchPatient = async () => {
        try {
          const res = await api.get(`/patients/${id}`);
          // Format date for input type="date"
          const data = res.data;
          if (data.dob) data.dob = data.dob.split('T')[0];
          setFormData(data);
        } catch (error) {
          toast.error('Échec du chargement des données du patient');
          navigate('/patients');
        }
      };
      fetchPatient();
    }
  }, [id, isEdit, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isEdit) {
        await api.put(`/patients/${id}`, formData);
        toast.success('Patient mis à jour avec succès');
      } else {
        await api.post('/patients', formData);
        toast.success('Patient créé avec succès');
      }
      navigate('/patients');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Erreur lors de l\'enregistrement du patient');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate('/patients')} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
          <ArrowLeft className="w-6 h-6 text-slate-600" />
        </button>
        <h1 className="text-2xl font-bold text-slate-800">{isEdit ? 'Modifier le Patient' : 'Nouveau Patient'}</h1>
      </div>

      <div className="card p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="label-text">Prénom *</label>
              <input 
                type="text" name="first_name" required className="input-field" 
                value={formData.first_name} onChange={handleChange}
              />
            </div>
            <div>
              <label className="label-text">Nom *</label>
              <input 
                type="text" name="last_name" required className="input-field" 
                value={formData.last_name} onChange={handleChange}
              />
            </div>
            <div>
              <label className="label-text">Email</label>
              <input 
                type="email" name="email" className="input-field" 
                value={formData.email} onChange={handleChange}
              />
            </div>
            <div>
              <label className="label-text">Téléphone</label>
              <input 
                type="text" name="phone" className="input-field" 
                value={formData.phone} onChange={handleChange}
              />
            </div>
            <div>
              <label className="label-text">Date de Naissance</label>
              <input 
                type="date" name="dob" className="input-field" 
                value={formData.dob} onChange={handleChange}
              />
            </div>
            <div>
              <label className="label-text">Sexe</label>
              <select name="gender" className="input-field" value={formData.gender} onChange={handleChange}>
                <option value="Male">Homme</option>
                <option value="Female">Femme</option>
                <option value="Other">Autre</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-100">
            <div>
              <label className="label-text">Type d'Assurance</label>
              <select name="insurance_type" className="input-field" value={formData.insurance_type} onChange={handleChange}>
                <option value="Aucune">Aucune</option>
                <option value="CNSS">CNSS</option>
                <option value="AMO">AMO</option>
              </select>
            </div>
            <div>
              <label className="label-text">N° d'affiliation / Matricule</label>
              <input 
                type="text" name="insurance_id" className="input-field" 
                placeholder="ex. 123456789"
                value={formData.insurance_id} onChange={handleChange}
              />
            </div>
          </div>

          <div>
            <label className="label-text">Adresse</label>
            <input 
              type="text" name="address" className="input-field" 
              value={formData.address} onChange={handleChange}
            />
          </div>

          <div>
            <label className="label-text">Notes Médicales</label>
            <textarea 
              name="medical_notes" rows="4" className="input-field" 
              value={formData.medical_notes} onChange={handleChange}
              placeholder="Allergies, conditions chroniques, etc."
            ></textarea>
          </div>

          <div className="pt-4 flex justify-end gap-4">
            <button type="button" onClick={() => navigate('/patients')} className="btn-secondary">
              Annuler
            </button>
            <button type="submit" disabled={loading} className="btn-primary flex items-center gap-2 px-8">
              <Save size={18} />
              <span>{loading ? 'Enregistrement...' : 'Enregistrer le Patient'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PatientForm;
