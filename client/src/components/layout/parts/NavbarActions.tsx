import React from 'react';
import { Bell, Moon, Sun } from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';
import { useTheme } from '../../../contexts/ThemeContext';

interface UserInfo {
  name?: string;
  avatar_url?: string;
}

interface NavbarActionsProps {
  user?: UserInfo;
  showThemeToggle?: boolean;
  showNotifications?: boolean;
  showUserInfo?: boolean;
  version?: string;
  className?: string;
}

const NavbarActions: React.FC<NavbarActionsProps> = ({
  user: userProp,
  showThemeToggle = true,
  showNotifications = true,
  showUserInfo = true,
  version = 'V.2.0.4_B',
  className = '',
}) => {
  const { user: contextUser } = useAuth();
  const { theme, setThemeById, config } = useTheme();
  const user = userProp ?? contextUser;

  const toggleTheme = () => {
    if (theme === 'light') {
      setThemeById('cyber-dark');
    } else {
      setThemeById('industrial-light');
    }
  };

  return (
    <div id="navbar-actions" className={`flex items-center gap-3 px-6 ${className}`}>
      {showThemeToggle && (
        <button 
          onClick={toggleTheme}
          className="w-8 h-8 bg-background border border-border-strong flex items-center justify-center text-foreground hover:text-primary hover:border-primary transition-all"
          title="THEME"
        >
          {theme === 'light' ? <Moon size={14} /> : <Sun size={14} />}
        </button>
      )}

      {showNotifications && (
        <button className="relative w-8 h-8 bg-background border border-border-strong flex items-center justify-center text-foreground hover:text-accent hover:border-accent transition-all">
          <Bell size={14} />
          <div className="absolute top-0.5 right-0.5 w-1.5 h-1.5 bg-accent" />
        </button>
      )}

      <div className="w-px h-6 bg-border-strong mx-1" />

      {showUserInfo && (
        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <p className="text-[8px] font-black text-foreground leading-none uppercase truncate max-w-[100px]">{user?.name?.split(' ')[0]}</p>
            <p className="text-[7px] font-black text-primary uppercase tracking-tighter mt-0.5">{version}</p>
          </div>
          <div className="w-8 h-8 bg-background border border-border-strong flex items-center justify-center font-black text-primary text-[10px] uppercase overflow-hidden shrink-0">
            {user?.avatar_url ? <img src={user.avatar_url} alt="" className="w-full h-full object-cover" /> : user?.name?.substring(0, 2)}
          </div>
        </div>
      )}
    </div>
  );
};

export default NavbarActions;