import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import { LayoutDashboard, Users, Building, LogOut, Settings } from 'lucide-react';

const Sidebar: React.FC = () => {
  const { user, logout } = useAuth();
  const location = useLocation();

  const navItems = [
    { label: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard size={18} /> },
    { label: 'Usuários', path: '/users', icon: <Users size={18} /> },
    { label: 'Organizações', path: '/organizations', icon: <Building size={18} /> },
    { label: 'Configurações', path: '/settings', icon: <Settings size={18} /> },
  ];

  return (
    <div className="w-64 flex flex-col bg-panel-bg transition-colors h-full">
      {/* 1. Avatar Profile */}
      <div className="p-4 flex items-center gap-3 border-b border-border-strong/20">
        <div className="w-10 h-10 bg-background border border-border-strong flex items-center justify-center font-bold text-primary text-xs uppercase overflow-hidden shrink-0">
          {user?.avatar_url ? (
            <img src={user.avatar_url} alt={user.name} className="w-full h-full object-cover" />
          ) : (
            user?.name?.substring(0, 2)
          )}
        </div>
        <div className="min-w-0">
          <p className="text-[10px] font-black text-foreground uppercase truncate">{user?.name}</p>
          <p className="text-[8px] font-bold text-primary uppercase tracking-tighter">ONLINE_NODE</p>
        </div>
      </div>

      {/* 2. Menu */}
      <nav className="flex-1 p-2 space-y-1 scrollbar-hide">
        <p className="text-[8px] font-black text-foreground/30 uppercase tracking-[0.2em] px-2 mb-2">SYSTEM_NAVIGATION</p>
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-3 py-2.5 transition-all duration-200 group no-underline border ${
                isActive 
                  ? 'bg-primary text-black border-black shadow-[2px_2px_0_0_rgba(0,0,0,1)]' 
                  : 'text-foreground/70 hover:text-foreground hover:bg-white/5 border-transparent'
              }`}
            >
              <span className="shrink-0">
                {item.icon}
              </span>
              <span className="text-[10px] font-black uppercase tracking-wider">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* 3. Footer / Logout */}
      <div className="p-2 border-t border-border-strong/20">
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-3 py-2.5 text-foreground/50 hover:text-destructive hover:bg-destructive/5 transition-all duration-200 group border"
        >
          <LogOut size={18} />
          <span className="text-[10px] font-black uppercase tracking-widest">TERMINATE_SESSION</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
