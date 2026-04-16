import { useContext, useState, useEffect } from 'react';
import { Menu, Bell, User as UserIcon } from 'lucide-react';
import { AuthContext } from '../../context/AuthContext';
import api from '../../services/api';
import { useNavigate } from 'react-router-dom';

const Topbar = ({ setSidebarOpen }) => {
  const { user } = useContext(AuthContext);
  const [upcoming, setUpcoming] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUpcoming = async () => {
      try {
        const res = await api.get('/appointments/upcoming');
        setUpcoming(res.data);
      } catch (error) {
        console.error('Failed to fetch upcoming appts', error);
      }
    };
    fetchUpcoming();
  }, []);

  return (
    <header className="bg-white border-b border-slate-200 h-20 px-6 flex items-center justify-between z-10 shadow-sm">
      <div className="flex items-center">
        <button
          onClick={() => setSidebarOpen(true)}
          className="p-2 mr-4 rounded-md text-slate-500 hover:bg-slate-100 focus:outline-none lg:hidden"
        >
          <Menu className="h-6 w-6" />
        </button>
        <h2 className="text-xl font-semibold text-slate-800 hidden sm:block">
          Welcome back, {user?.name?.split(' ')[0] || 'User'} 👋
        </h2>
      </div>

      <div className="flex items-center space-x-4">
        <div className="relative">
          <button 
            onClick={() => setShowDropdown(!showDropdown)}
            className="relative p-2 text-slate-500 hover:bg-slate-50 rounded-full transition-colors"
          >
            <Bell className="h-6 w-6" />
            {upcoming.length > 0 && (
              <span className="absolute top-1.5 right-1.5 flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500 ring-2 ring-white"></span>
              </span>
            )}
          </button>
          
          {showDropdown && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-slate-100 overflow-hidden z-50">
              <div className="p-4 border-b border-slate-100 bg-slate-50">
                <h3 className="font-semibold text-slate-800">Notifications</h3>
              </div>
              <div className="max-h-80 overflow-y-auto">
                {upcoming.length > 0 ? (
                  upcoming.map(appt => (
                    <div 
                      key={appt.id} 
                      onClick={() => { setShowDropdown(false); navigate('/appointments'); }}
                      className="p-4 border-b border-slate-50 hover:bg-slate-50 cursor-pointer transition-colors"
                    >
                      <p className="font-medium text-sm text-slate-800">{appt.title}</p>
                      <p className="text-xs text-slate-500 mt-1">
                        {appt.patient?.first_name} {appt.patient?.last_name} • {new Date(appt.start_time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </p>
                    </div>
                  ))
                ) : (
                  <div className="p-6 text-center text-slate-400 text-sm">
                    No upcoming appointments in the next 24 hours.
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center space-x-3 border-l border-slate-200 pl-4 ml-1">
          <div className="h-10 w-10 flex border-2 border-primary-100 items-center justify-center rounded-full bg-primary-50 text-primary-600">
            <UserIcon className="h-5 w-5" />
          </div>
          <div className="hidden md:block text-sm">
            <p className="font-semibold text-slate-700">{user?.name}</p>
            <p className="text-slate-500 capitalize text-xs">{user?.role}</p>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Topbar;
