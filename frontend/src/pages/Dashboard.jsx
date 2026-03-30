import { useState, useEffect } from 'react';
import api from '../services/api';
import { Users, Calendar, DollarSign, Clock } from 'lucide-react';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

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
    return <div className="h-full flex items-center justify-center">Loading stats...</div>;
  }

  const statCards = [
    { title: 'Total Patients', value: stats?.totalPatients || 0, icon: <Users className="w-6 h-6 text-blue-500" />, bgColor: 'bg-blue-50' },
    { title: "Today's Appointments", value: stats?.todayAppointments || 0, icon: <Calendar className="w-6 h-6 text-emerald-500" />, bgColor: 'bg-emerald-50' },
    { title: 'Total Revenue', value: `$${stats?.totalRevenue || 0}`, icon: <DollarSign className="w-6 h-6 text-purple-500" />, bgColor: 'bg-purple-50' },
    { title: 'Pending Invoices', value: stats?.pendingInvoices || 0, icon: <Clock className="w-6 h-6 text-amber-500" />, bgColor: 'bg-amber-50' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Dashboard Overview</h1>
        <button className="btn-primary">
          + New Appointment
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <div key={index} className="card p-6 flex items-center hover:-translate-y-1 transition-transform duration-300">
            <div className={`p-4 rounded-xl ${stat.bgColor} mr-4`}>
              {stat.icon}
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">{stat.title}</p>
              <h3 className="text-2xl font-bold text-slate-800 mt-1">{stat.value}</h3>
            </div>
          </div>
        ))}
      </div>
      
      {/* Skeleton for charts area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-4">
        <div className="card p-6 lg:col-span-2 min-h-[400px]">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">Patient Growth</h3>
          <div className="flex h-full items-center justify-center text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-200">
            Chart Placeholder
          </div>
        </div>
        <div className="card p-6 min-h-[400px]">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">Upcoming Appointments</h3>
          <div className="flex h-full items-center justify-center text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-200">
            List Placeholder
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
