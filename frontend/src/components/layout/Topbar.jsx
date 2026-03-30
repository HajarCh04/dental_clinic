import { useContext } from 'react';
import { Menu, Bell, User as UserIcon } from 'lucide-react';
import { AuthContext } from '../../context/AuthContext';

const Topbar = ({ setSidebarOpen }) => {
  const { user } = useContext(AuthContext);

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
        <button className="relative p-2 text-slate-500 hover:bg-slate-50 rounded-full transition-colors">
          <Bell className="h-6 w-6" />
          <span className="absolute top-1.5 right-1.5 block h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-white" />
        </button>

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
