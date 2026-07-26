import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { SidebarTrigger } from '@/components/ui/sidebar';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const roleColors = {
    Admin: 'bg-indigo-100 text-indigo-700 border-indigo-200',
    Assessor: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    Auditee: 'bg-amber-100 text-amber-700 border-amber-200',
  };

  const roleBadge = user?.role?.name ? roleColors[user.role.name] || 'bg-slate-100 text-slate-700' : '';

  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 sticky top-0 z-30 shadow-sm">
      <div className="flex items-center gap-2">
        <SidebarTrigger className="-ml-2" />
        <h2 className="font-semibold text-slate-700 text-sm hidden md:block">COBIT 2019 Assessment Tool</h2>
      </div>
      
      <div className="flex items-center space-x-4">
        {user && (
          <span id="user-role-badge" className={`hidden sm:inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold border ${roleBadge}`}>
            {user.role?.name}
          </span>
        )}
        <div id="user-profile" className="flex items-center space-x-3">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-semibold text-slate-800">{user?.name || 'Loading...'}</p>
            <p className="text-xs text-slate-500">{user?.email || ''}</p>
          </div>
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white font-bold text-sm shadow-md">
            {user?.name?.substring(0, 2).toUpperCase() || '?'}
          </div>
        </div>
        <button
          id="logout-btn"
          onClick={handleLogout}
          className="p-2 text-slate-500 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all duration-200"
          title="Logout"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
        </button>
      </div>
    </header>
  );
}
