import { useState, useEffect } from 'react';
import api from '../services/api';
import { Users, Mail, CheckCircle, Phone } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const MyTeam = () => {
  const [assistants, setAssistants] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAssistants = async () => {
      try {
        const res = await api.get('/assistants');
        setAssistants(res.data);
      } catch (error) {
        console.error('Error fetching assistants', error);
      } finally {
        setLoading(false);
      }
    };
    fetchAssistants();
  }, []);

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
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {assistants.length > 0 ? assistants.map((assistant) => (
          <div key={assistant.id} className="card p-6 hover:shadow-md transition-all flex flex-col items-center text-center group">
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
                <span>{assistant.email}</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-slate-600">
                <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center">
                  <Phone size={16} className="text-slate-400" />
                </div>
                <span>+212 {Math.floor(100000000 + Math.random() * 900000000)}</span>
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
    </div>
  );
};

export default MyTeam;
