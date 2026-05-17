import { useState, useEffect } from 'react';
import api from '../services/api';
import { Users, Mail, CheckCircle, Phone, Plus, Edit, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Modal from '../components/ui/Modal';
import toast from 'react-hot-toast';

const MyTeam = () => {
  const [assistants, setAssistants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingAssistant, setEditingAssistant] = useState(null);
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const navigate = useNavigate();

  useEffect(() => {
    fetchAssistants();
  }, []);

  const fetchAssistants = async () => {
    try {
      const res = await api.get('/assistants');
      setAssistants(res.data);
    } catch (error) {
      console.error('Error fetching assistants', error);
      toast.error('Erreur lors du chargement de l\'équipe');
    } finally {
      setLoading(false);
    }
  };

  const openCreateModal = () => {
    setEditingAssistant(null);
    setForm({ name: '', email: '', password: '' });
    setShowModal(true);
  };

  const openEditModal = (assistant) => {
    setEditingAssistant(assistant);
    setForm({ name: assistant.name, email: assistant.email, password: '' });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette assistante ?')) {
      try {
        await api.delete(`/assistants/${id}`);
        toast.success('Assistante supprimée');
        fetchAssistants();
      } catch (error) {
        toast.error('Erreur lors de la suppression');
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingAssistant) {
        await api.put(`/assistants/${editingAssistant.id}`, form);
        toast.success('Informations mises à jour');
      } else {
        await api.post('/assistants', form);
        toast.success('Nouvelle assistante ajoutée');
      }
      setShowModal(false);
      fetchAssistants();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Une erreur est survenue');
    }
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="animate-pulse text-slate-400">Chargement de votre équipe...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight flex items-center gap-2">
            <Users className="text-indigo-600" />
            Mon Équipe
          </h1>
          <p className="text-sm text-slate-500 mt-1">Gérez et consultez les informations de vos assistantes</p>
        </div>
        <button onClick={openCreateModal} className="btn-primary flex items-center gap-2">
          <Plus size={18} />
          <span>Ajouter Assistante</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {assistants.length > 0 ? assistants.map((assistant) => (
          <div key={assistant.id} className="card p-6 hover:shadow-md transition-all flex flex-col items-center text-center group relative">
            <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button onClick={() => openEditModal(assistant)} className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg">
                <Edit size={16} />
              </button>
              <button onClick={() => handleDelete(assistant.id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg">
                <Trash2 size={16} />
              </button>
            </div>

            <div className="w-20 h-20 rounded-full border-4 border-indigo-50 flex items-center justify-center bg-indigo-100 text-indigo-600 font-bold text-2xl mb-4 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
              {assistant.name.charAt(0)}
            </div>
            <h3 className="text-xl font-bold text-slate-800">{assistant.name}</h3>
            <p className="text-indigo-600 font-medium text-sm mb-4">Assistante Dentaire</p>
            
            <div className="w-full space-y-3 mt-4 border-t border-slate-100 pt-4">
              <div className="flex items-center gap-3 text-sm text-slate-600">
                <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center">
                  <Mail size={16} className="text-slate-400" />
                </div>
                <span className="truncate">{assistant.email}</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-slate-600">
                <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center">
                  <Phone size={16} className="text-slate-400" />
                </div>
                <span>+212 600 000 000</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center">
                  <CheckCircle size={16} className="text-emerald-500" />
                </div>
                <span className="text-emerald-600 font-bold text-xs uppercase tracking-wider">Accès Système Actif</span>
              </div>
            </div>
            
            <button 
              onClick={() => navigate('/appointments')}
              className="mt-6 w-full py-2.5 px-4 bg-slate-50 hover:bg-indigo-50 text-slate-600 hover:text-indigo-600 rounded-xl text-sm font-bold transition-colors"
            >
              Voir le planning
            </button>
          </div>
        )) : (
          <div className="col-span-full card p-12 text-center text-slate-400">
            <Users className="w-12 h-12 mx-auto mb-3 text-slate-200" />
            <p>Aucune assistante n'est enregistrée dans le système.</p>
          </div>
        )}
      </div>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editingAssistant ? 'Modifier Assistante' : 'Ajouter une Assistante'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label-text">Nom complet</label>
            <input 
              type="text" required className="input-field" 
              value={form.name} onChange={e => setForm({...form, name: e.target.value})} 
              placeholder="ex. Imane El Fassi"
            />
          </div>
          <div>
            <label className="label-text">Adresse email</label>
            <input 
              type="email" required className="input-field" 
              value={form.email} onChange={e => setForm({...form, email: e.target.value})} 
              placeholder="email@example.com"
            />
          </div>
          <div>
            <label className="label-text">{editingAssistant ? 'Changer le mot de passe (optionnel)' : 'Mot de passe'}</label>
            <input 
              type="password" required={!editingAssistant} className="input-field" 
              value={form.password} onChange={e => setForm({...form, password: e.target.value})} 
              placeholder="••••••••"
            />
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <button type="button" onClick={() => setShowModal(false)} className="btn-secondary">Annuler</button>
            <button type="submit" className="btn-primary px-8">
              {editingAssistant ? 'Enregistrer' : 'Créer'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default MyTeam;
