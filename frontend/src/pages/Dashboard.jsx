import { useState, useEffect, useContext } from 'react';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import { Users, Calendar, DollarSign, Clock, TrendingUp, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/dashboard/stats');
        setStats(res.data);
      } catch (error) {
        console.error('Error fetching dashboard stats', error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="animate-pulse text-slate-400">Loading dashboard...</div>
      </div>
    );
  }

  const statCards = [
    { title: 'Total Patients', value: stats?.totalPatients || 0, icon: <Users className="w-6 h-6" />, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-100' },
    { title: "Today's Appointments", value: stats?.todayAppointments || 0, icon: <Calendar className="w-6 h-6" />, color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-100' },
    { title: 'Total Revenue', value: `$${Number(stats?.totalRevenue || 0).toLocaleString()}`, icon: <DollarSign className="w-6 h-6" />, color: 'text-purple-600', bg: 'bg-purple-50', border: 'border-purple-100' },
    { title: 'Pending Invoices', value: stats?.pendingInvoices || 0, icon: <Clock className="w-6 h-6" />, color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-100' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Admin Dashboard</h1>
          <p className="text-sm text-slate-500 mt-1">Clinic-wide overview and management</p>
        </div>
        <button onClick={() => navigate('/appointments')} className="btn-primary">
          + New Appointment
        </button>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {statCards.map((stat, index) => (
          <div key={index} className={`card p-5 flex items-center hover:-translate-y-1 transition-all duration-300 border-l-4 ${stat.border}`}>
            <div className={`p-3 rounded-xl ${stat.bg} ${stat.color} mr-4`}>
              {stat.icon}
            </div>
            <div>
              <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">{stat.title}</p>
              <h3 className="text-2xl font-bold text-slate-800 mt-0.5">{stat.value}</h3>
            </div>
          </div>
        ))}
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Appointments */}
        <div className="card p-6 lg:col-span-2">
          <div className="flex justify-between items-center mb-5">
            <h3 className="text-lg font-semibold text-slate-800">Recent Appointments</h3>
            <button onClick={() => navigate('/appointments')} className="text-sm text-primary-600 hover:text-primary-700 flex items-center gap-1 font-medium">
              View All <ArrowRight size={14} />
            </button>
          </div>
          <div className="space-y-3">
            {stats?.recentAppointments?.length > 0 ? stats.recentAppointments.map((appt) => (
              <div key={appt.id} className="flex items-center justify-between p-3 rounded-xl bg-slate-50/80 hover:bg-slate-100/80 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center text-sm font-bold">
                    {appt.patient?.first_name?.[0]}{appt.patient?.last_name?.[0]}
                  </div>
                  <div>
                    <p className="font-medium text-slate-800 text-sm">{appt.patient?.first_name} {appt.patient?.last_name}</p>
                    <p className="text-xs text-slate-400">{appt.title} · Dr. {appt.dentist?.name}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-slate-500">{new Date(appt.start_time).toLocaleDateString()}</p>
                  <span className={`inline-block mt-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                    appt.status === 'completed' ? 'bg-emerald-100 text-emerald-700' :
                    appt.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                    'bg-blue-100 text-blue-700'
                  }`}>{appt.status}</span>
                </div>
              </div>
            )) : (
              <p className="text-sm text-slate-400 text-center py-8">No appointments yet</p>
            )}
          </div>
        </div>

        {/* Recent Patients */}
        <div className="card p-6">
          <div className="flex justify-between items-center mb-5">
            <h3 className="text-lg font-semibold text-slate-800">New Patients</h3>
            <button onClick={() => navigate('/patients')} className="text-sm text-primary-600 hover:text-primary-700 flex items-center gap-1 font-medium">
              View All <ArrowRight size={14} />
            </button>
          </div>
          <div className="space-y-3">
            {stats?.recentPatients?.length > 0 ? stats.recentPatients.map((patient) => (
              <div key={patient.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer" onClick={() => navigate(`/patients/${patient.id}`)}>
                <div className="w-9 h-9 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center text-xs font-bold">
                  {patient.first_name[0]}{patient.last_name[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-slate-800 text-sm truncate">{patient.first_name} {patient.last_name}</p>
                  <p className="text-xs text-slate-400">{patient.phone || patient.email}</p>
                </div>
              </div>
            )) : (
              <p className="text-sm text-slate-400 text-center py-8">No patients yet</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
