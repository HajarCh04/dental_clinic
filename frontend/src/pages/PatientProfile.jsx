import { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import { ArrowLeft, Edit, Download, Shield, FileText, Upload, Trash2, FileIcon, User } from 'lucide-react';
import toast from 'react-hot-toast';
import Modal from '../components/ui/Modal';
import { generatePatientReport } from '../utils/pdfGenerator';
import { uploadMedicalDocument, getPatientDocuments, deleteMedicalDocument } from '../services/api';

const PatientProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  
  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('timeline');
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [newNote, setNewNote] = useState('');

  // Documents state
  const [documents, setDocuments] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [docType, setDocType] = useState('autre');

  useEffect(() => {
    fetchPatient();
    fetchDocuments();
  }, [id]);

  const fetchDocuments = async () => {
    try {
      const docs = await getPatientDocuments(id);
      setDocuments(docs);
    } catch (error) {
      console.error('Error fetching documents', error);
    }
  };

  const fetchPatient = async () => {
    try {
      const res = await api.get(`/patients/${id}`);
      setPatient(res.data);
    } catch (error) {
      toast.error('Erreur lors du chargement du patient');
      navigate('/patients');
    } finally {
      setLoading(false);
    }
  };

  const handleAddNote = async (e) => {
    e.preventDefault();
    if (!newNote.trim()) return;
    
    try {
      const updatedNotes = patient.medical_notes 
        ? `${patient.medical_notes}\n[${new Date().toLocaleDateString()}] ${newNote}`
        : `[${new Date().toLocaleDateString()}] ${newNote}`;
        
      await api.put(`/patients/${id}`, { medical_notes: updatedNotes });
      toast.success('Note ajoutée');
      setNewNote('');
      setShowNoteModal(false);
      fetchPatient();
    } catch (error) {
      toast.error('Erreur lors de l\'ajout de la note');
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);
    formData.append('patient_id', id);
    formData.append('title', file.name);
    formData.append('type_document', docType);

    setUploading(true);
    try {
      await uploadMedicalDocument(formData);
      toast.success('Document téléchargé avec succès');
      fetchDocuments();
    } catch (error) {
      toast.error('Échec du téléchargement du document');
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteDoc = async (docId) => {
    if (!window.confirm('Voulez-vous vraiment supprimer ce document ?')) return;
    try {
      await deleteMedicalDocument(docId);
      toast.success('Document supprimé');
      fetchDocuments();
    } catch (error) {
      toast.error('Erreur lors de la suppression');
    }
  };

  const handleDownloadReport = () => {
    if (!patient) return;
    generatePatientReport(patient);
    toast.success('Rapport patient téléchargé !');
  };

  if (loading) return <div className="p-8 text-center text-slate-500 italic flex flex-col items-center gap-4">
    <div className="w-12 h-12 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div>
    Chargement du profil...
  </div>;
  if (!patient) return null;

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/patients')} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
            <ArrowLeft className="w-6 h-6 text-slate-600" />
          </button>
          <h1 className="text-2xl font-bold text-slate-800">Profil du Patient</h1>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={handleDownloadReport} className="btn-secondary flex items-center gap-2">
            <Download size={16} /> Rapport PDF
          </button>
          <button onClick={() => navigate(`/patients/edit/${patient.id}`)} className="btn-secondary flex items-center gap-2">
            <Edit size={16} /> Modifier
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left sidebar: Info */}
        <div className="space-y-6">
          <div className="card p-6">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center text-2xl font-bold">
                {patient.first_name[0]}{patient.last_name[0]}
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-800">{patient.first_name} {patient.last_name}</h2>
                <p className="text-sm text-slate-500">ID: PT-{patient.id.toString().padStart(4, '0')}</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Contact</p>
                <p className="text-sm text-slate-700 mt-1 font-medium">{patient.phone || 'Non renseigné'}</p>
                <p className="text-sm text-slate-500">{patient.email || 'Pas d\'email'}</p>
              </div>
              <div className="flex justify-between items-end">
                <div>
                  <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Démographie</p>
                  <p className="text-sm text-slate-700 mt-1">{patient.gender === 'Male' ? 'Homme' : 'Femme'}, {patient.dob ? new Date().getFullYear() - new Date(patient.dob).getFullYear() + ' ans' : 'N/A'}</p>
                </div>
              </div>
              <div className="pt-3 border-t border-slate-50">
                <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider mb-2">Assurance Maladie</p>
                <div className={`flex items-center gap-3 p-3 rounded-xl border ${patient.insurance_type === 'Aucune' ? 'bg-slate-50 border-slate-100' : 'bg-indigo-50 border-indigo-100'}`}>
                  <Shield size={20} className={patient.insurance_type === 'Aucune' ? 'text-slate-400' : 'text-indigo-600'} />
                  <div>
                    <p className="text-sm font-bold text-slate-800">{patient.insurance_type}</p>
                    {patient.insurance_id && <p className="text-xs text-slate-500">Matricule: {patient.insurance_id}</p>}
                  </div>
                </div>
              </div>
              <div>
                <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Adresse</p>
                <p className="text-sm text-slate-700 mt-1 italic">{patient.address || 'N/A'}</p>
              </div>
            </div>
          </div>

          <div className="card p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-slate-800">Notes Médicales</h3>
              {(user?.role === 'dentist' || user?.role === 'admin') && (
                <button onClick={() => setShowNoteModal(true)} className="text-sm text-primary-600 hover:text-primary-800 font-medium">+ Ajouter une Note</button>
              )}
            </div>
            <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 text-sm text-amber-900 whitespace-pre-wrap">
              {patient.medical_notes || 'Aucune note médicale enregistrée.'}
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="lg:col-span-2">
          <div className="card h-full">
            <div className="flex border-b border-slate-100 p-2 gap-2 overflow-x-auto">
              <button 
                onClick={() => setActiveTab('timeline')} 
                className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${activeTab === 'timeline' ? 'bg-slate-100 text-slate-800 shadow-sm' : 'text-slate-500 hover:bg-slate-50'}`}
              >
                Parcours Traitement
              </button>
              <button 
                onClick={() => setActiveTab('appointments')} 
                className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${activeTab === 'appointments' ? 'bg-slate-100 text-slate-800 shadow-sm' : 'text-slate-500 hover:bg-slate-50'}`}
              >
                Rendez-vous
              </button>
              <button 
                onClick={() => setActiveTab('documents')} 
                className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${activeTab === 'documents' ? 'bg-slate-100 text-slate-800 shadow-sm' : 'text-slate-500 hover:bg-slate-50'}`}
              >
                <span className="flex items-center gap-2">Documents <span className="bg-primary-100 text-primary-700 px-1.5 py-0.5 rounded text-[10px]">{documents.length}</span></span>
              </button>
              <button 
                onClick={() => setActiveTab('billing')} 
                className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${activeTab === 'billing' ? 'bg-slate-100 text-slate-800 shadow-sm' : 'text-slate-500 hover:bg-slate-50'}`}
              >
                Facturation
              </button>
            </div>

            <div className="p-6">
              {activeTab === 'timeline' && (
                <div className="space-y-6">
                  {patient.treatments?.length > 0 ? (
                    <div className="relative border-l-2 border-slate-200 ml-3 space-y-6">
                      {patient.treatments.sort((a,b) => new Date(b.date) - new Date(a.date)).map((t) => (
                        <div key={t.id} className="relative pl-6">
                          <div className="absolute w-3 h-3 bg-primary-500 rounded-full -left-[7px] top-1.5 ring-4 ring-white" />
                          <div>
                            <p className="text-sm text-slate-400 font-medium">{new Date(t.date).toLocaleDateString('fr-FR')}</p>
                            <div className="bg-slate-50 p-4 rounded-xl mt-2 border border-slate-100">
                              <h4 className="font-semibold text-slate-800">{t.procedure_name}</h4>
                              <p className="text-sm text-slate-600 mt-1">{t.description}</p>
                              {t.notes && <p className="text-xs text-slate-500 mt-2 bg-white p-2 rounded-lg border border-slate-100 italic">" {t.notes} "</p>}
                              <p className="text-xs text-emerald-600 font-bold mt-2">{Number(t.cost).toLocaleString('fr-FR')} DH</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : <p className="text-slate-500 text-center py-8 italic underline">Aucun traitement enregistré.</p>}
                </div>
              )}

              {activeTab === 'appointments' && (
                <div className="space-y-3">
                  {patient.appointments?.length > 0 ? (
                    patient.appointments.sort((a,b) => new Date(b.start_time) - new Date(a.start_time)).map(appt => (
                      <div key={appt.id} className="flex justify-between items-center p-4 bg-slate-50 rounded-xl border border-slate-100 hover:bg-white hover:shadow-sm transition-all">
                        <div>
                          <p className="font-semibold text-slate-800">{appt.title}</p>
                          <p className="text-sm text-slate-500">{new Date(appt.start_time).toLocaleString('fr-FR')}</p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                          appt.status === 'completed' ? 'bg-emerald-100 text-emerald-700' :
                          appt.status === 'scheduled' ? 'bg-blue-100 text-blue-700' : 'bg-red-100 text-red-700'
                        }`}>{appt.status === 'completed' ? 'Terminé' : appt.status === 'scheduled' ? 'Confirmé' : 'Annulé'}</span>
                      </div>
                    ))
                  ) : <p className="text-slate-500 text-center py-8">Aucun rendez-vous trouvé.</p>}
                </div>
              )}

              {activeTab === 'documents' && (
                <div className="space-y-6">
                  {/* Upload Controls */}
                  <div className="p-4 bg-primary-50 rounded-2xl border border-primary-100 flex flex-col md:flex-row items-center gap-4">
                    <div className="flex-1 w-full">
                      <label className="text-xs font-bold text-primary-700 uppercase mb-2 block tracking-tight">Type de document</label>
                      <select className="input-field py-1.5" value={docType} onChange={(e) => setDocType(e.target.value)}>
                        <option value="facture">Facture</option>
                        <option value="ordonnance">Ordonnance</option>
                        <option value="feuille_de_soins">Feuille de soins</option>
                        <option value="autre">Autre</option>
                      </select>
                    </div>
                    <div className="w-full md:w-auto">
                      <label 
                        className={`btn-primary w-full flex items-center justify-center gap-2 cursor-pointer ${uploading ? 'opacity-50 pointer-events-none' : ''}`}
                      >
                        {uploading ? <Activity className="animate-spin" size={18} /> : <Upload size={18} />}
                        <span>{uploading ? 'Upload...' : 'Uploader un fichier'}</span>
                        <input type="file" className="hidden" onChange={handleFileUpload} disabled={uploading} />
                      </label>
                    </div>
                  </div>

                  {/* Documents List */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {documents.length > 0 ? documents.map((doc) => (
                      <div key={doc.id} className="p-4 bg-white rounded-2xl border border-slate-100 hover:border-primary-100 flex items-center gap-3 group relative hover:shadow-card transition-all">
                        <div className="p-3 bg-slate-50 rounded-xl text-slate-400 group-hover:bg-primary-50 group-hover:text-primary-600 transition-colors">
                          <FileText size={24} />
                        </div>
                        <div className="flex-1 overflow-hidden">
                          <p className="font-semibold text-slate-800 text-sm truncate pr-6">{doc.title}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-[10px] bg-slate-100 font-bold uppercase text-slate-500 px-1.5 py-0.5 rounded">{doc.type_document}</span>
                            <span className="text-[10px] text-slate-400">{new Date(doc.uploaded_at).toLocaleDateString('fr-FR')}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <a 
                            href={`${import.meta.env.VITE_API_URL}${doc.file_path}`} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="p-2 text-slate-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-all"
                            title="Ouvrir le document"
                          >
                            <FileIcon size={16} />
                          </a>
                          <button 
                            onClick={() => handleDeleteDoc(doc.id)}
                            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                            title="Supprimer"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    )) : (
                      <div className="col-span-full py-12 text-center text-slate-400">
                        <FileText size={48} className="mx-auto mb-3 opacity-20" />
                        <p className="italic">Aucun document numérique associé à ce dossier.</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {activeTab === 'billing' && (
                <div className="space-y-3">
                  {patient.invoices?.length > 0 ? (
                    patient.invoices.sort((a,b) => new Date(b.issued_date) - new Date(a.issued_date)).map(inv => (
                      <div key={inv.id} className="flex justify-between items-center p-4 bg-slate-50 rounded-xl border border-slate-100">
                        <div>
                          <p className="font-semibold text-slate-800">Facture #{inv.id.toString().padStart(4, '0')}</p>
                          <p className="text-sm text-slate-500">{new Date(inv.issued_date).toLocaleDateString('fr-FR')}</p>
                          {inv.estimated_reimbursement > 0 && (
                            <p className="text-[10px] text-indigo-600 font-bold mt-1 uppercase tracking-tight">Remboursement estimé: {Number(inv.estimated_reimbursement).toLocaleString('fr-FR')} DH</p>
                          )}
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-slate-800">{Number(inv.amount).toLocaleString('fr-FR')} DH</p>
                          <p className={inv.status === 'paid' ? 'text-xs font-bold text-emerald-600' : 'text-xs font-bold text-amber-600'}>
                             {inv.status === 'paid' ? 'Payé' : `Reste: ${Number(inv.amount - inv.paid_amount).toLocaleString('fr-FR')} DH`}
                          </p>
                        </div>
                      </div>
                    ))
                  ) : <p className="text-slate-500 text-center py-8">Aucun historique de facturation.</p>}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <Modal isOpen={showNoteModal} onClose={() => setShowNoteModal(false)} title="Ajouter une Note Médicale">
        <form onSubmit={handleAddNote} className="space-y-4">
          <textarea 
            rows="5" className="input-field" placeholder="Écrire les observations cliniques ici..."
            value={newNote} onChange={(e) => setNewNote(e.target.value)} required
          />
          <div className="flex justify-end gap-3">
            <button type="button" onClick={() => setShowNoteModal(false)} className="btn-secondary">Annuler</button>
            <button type="submit" className="btn-primary px-6">Enregistrer la Note</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default PatientProfile;
