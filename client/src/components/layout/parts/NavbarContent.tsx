import React from 'react';
import { Search } from 'lucide-react';

interface NavbarContentProps {
  children?: React.ReactNode;
  showSearch?: boolean;
  searchPlaceholder?: string;
  className?: string;
}

const NavbarContent: React.FC<NavbarContentProps> = ({
  children,
  showSearch = true,
  searchPlaceholder = 'SEARCH...',
  className = '',
}) => {
  return (
    <div id="navbar-content" className={`flex-1 flex items-center gap-4 px-6 h-full ${className}`}>
      {showSearch && (
        <div className="relative group w-48 h-8">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-primary/50 group-focus-within:text-primary transition-colors" size={12} />
          <input 
            type="text" 
            placeholder={searchPlaceholder}
            className="w-full h-full bg-background/50 border border-border-strong/30 py-1 pl-8 pr-3 text-[8px] font-black uppercase tracking-widest focus:outline-none focus:border-primary text-foreground transition-all"
          />
        </div>
      )}
      {children}
    </div>
  );
};

export default NavbarContent;