import { useState, useEffect, useContext } from 'react';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import { Stethoscope, Clock, CheckCircle, Users, ArrowRight, Activity } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const DentistDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/dashboard/dentist-stats');
        setStats(res.data);
      } catch (error) {
        console.error('Error fetching dentist stats', error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="animate-pulse text-slate-400">Loading your schedule...</div>
      </div>
    );
  }

  const getTimeString = (dateStr) => {
    return new Date(dateStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="space-y-6">
      {/* Header with teal accent */}
      <div className="bg-gradient-to-r from-teal-600 to-emerald-600 rounded-2xl p-6 text-white shadow-lg">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-teal-100 text-sm font-medium">Good {new Date().getHours() < 12 ? 'Morning' : 'Afternoon'},</p>
            <h1 className="text-2xl font-bold mt-1">{user?.name || 'Doctor'}</h1>
            <p className="text-teal-100 text-sm mt-2">
              You have <span className="font-bold text-white">{stats?.todayTotal || 0}</span> appointments today
              {stats?.completedToday > 0 && <>, <span className="font-bold text-white">{stats.completedToday}</span> completed</>}
            </p>
          </div>
          <div className="flex gap-3">
            <button onClick={() => navigate('/treatments')} className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-medium transition-colors backdrop-blur-sm">
              <Activity size={16} className="inline mr-1" /> Add Treatment
            </button>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="card p-5 flex items-center border-l-4 border-teal-400">
          <div className="p-3 rounded-xl bg-teal-50 text-teal-600 mr-4">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Today's Schedule</p>
            <h3 className="text-2xl font-bold text-slate-800">{stats?.todayTotal || 0}</h3>
          </div>
        </div>
        <div className="card p-5 flex items-center border-l-4 border-emerald-400">
          <div className="p-3 rounded-xl bg-emerald-50 text-emerald-600 mr-4">
            <CheckCircle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Completed Today</p>
            <h3 className="text-2xl font-bold text-slate-800">{stats?.completedToday || 0}</h3>
          </div>
        </div>
        <div className="card p-5 flex items-center border-l-4 border-cyan-400">
          <div className="p-3 rounded-xl bg-cyan-50 text-cyan-600 mr-4">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">My Patients</p>
            <h3 className="text-2xl font-bold text-slate-800">{stats?.myPatientCount || 0}</h3>
          </div>
        </div>
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Today's Schedule Timeline */}
        <div className="card p-6 lg:col-span-2">
          <div className="flex justify-between items-center mb-5">
            <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
              <Stethoscope className="w-5 h-5 text-teal-600" />
              Today's Schedule
            </h3>
            <button onClick={() => navigate('/appointments')} className="text-sm text-teal-600 hover:text-teal-700 flex items-center gap-1 font-medium">
              Full Calendar <ArrowRight size={14} />
            </button>
          </div>
          <div className="space-y-1">
            {stats?.myTodayAppointments?.length > 0 ? stats.myTodayAppointments.map((appt, idx) => (
              <div key={appt.id} className="flex gap-4 group">
                {/* Timeline dot & line */}
                <div className="flex flex-col items-center">
                  <div className={`w-3 h-3 rounded-full mt-2 ${
                    appt.status === 'completed' ? 'bg-emerald-500' : 'bg-teal-500 ring-4 ring-teal-100'
                  }`} />
                  {idx < stats.myTodayAppointments.length - 1 && <div className="w-0.5 flex-1 bg-slate-200 my-1" />}
                </div>
                {/* Content */}
                <div className={`flex-1 p-4 rounded-xl mb-2 transition-colors ${
                  appt.status === 'completed' ? 'bg-emerald-50/50' : 'bg-slate-50 group-hover:bg-teal-50/50'
                }`}>
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-semibold text-slate-800">{appt.title}</p>
                      <p className="text-sm text-slate-500 mt-0.5">
                        {appt.patient?.first_name} {appt.patient?.last_name}
                        {appt.patient?.phone && <span className="text-slate-400"> · {appt.patient.phone}</span>}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-slate-600">
                        {getTimeString(appt.start_time)} - {getTimeString(appt.end_time)}
                      </p>
                      <span className={`inline-block mt-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        appt.status === 'completed' ? 'bg-emerald-100 text-emerald-700' :
                        appt.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                        'bg-teal-100 text-teal-700'
                      }`}>{appt.status}</span>
                    </div>
                  </div>
                </div>
              </div>
            )) : (
              <div className="text-center py-12 text-slate-400">
                <Calendar className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                <p>No appointments scheduled for today</p>
              </div>
            )}
          </div>
        </div>

        {/* Recent Treatments */}
        <div className="card p-6">
          <div className="flex justify-between items-center mb-5">
            <h3 className="text-lg font-semibold text-slate-800">Recent Treatments</h3>
            <button onClick={() => navigate('/treatments')} className="text-sm text-teal-600 hover:text-teal-700 flex items-center gap-1 font-medium">
              View All <ArrowRight size={14} />
            </button>
          </div>
          <div className="space-y-3">
            {stats?.myRecentTreatments?.length > 0 ? stats.myRecentTreatments.map((t) => (
              <div key={t.id} className="p-3 rounded-xl bg-slate-50 hover:bg-teal-50/50 transition-colors">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium text-slate-800 text-sm">{t.procedure_name}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{t.patient?.first_name} {t.patient?.last_name}</p>
                  </div>
                  <p className="text-sm font-bold text-teal-600">${Number(t.cost).toLocaleString()}</p>
                </div>
              </div>
            )) : (
              <p className="text-sm text-slate-400 text-center py-8">No treatments yet</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Need Calendar for the empty state icon
import { Calendar } from 'lucide-react';

export default DentistDashboard;
