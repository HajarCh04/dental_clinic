import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import Dashboard from '../pages/Dashboard';
import DentistDashboard from '../pages/DentistDashboard';

const RoleDashboard = () => {
  const { user } = useContext(AuthContext);

  if (user?.role === 'dentist') {
    return <DentistDashboard />;
  }

  // Admin and assistant see the admin dashboard
  return <Dashboard />;
};

export default RoleDashboard;
