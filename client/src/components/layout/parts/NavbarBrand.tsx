import React from 'react';
import { Sparkles } from 'lucide-react';

interface NavbarBrandProps {
  icon?: React.ReactNode;
  title?: string;
  subtitle?: string;
  className?: string;
}

const NavbarBrand: React.FC<NavbarBrandProps> = ({
  icon = <Sparkles size={16} strokeWidth={3} />,
  title = 'DEVN',
  subtitle = 'APP',
  className = '',
}) => {
  return (
    <div id="navbar-brand" className={`w-64 flex-none flex items-center gap-3 px-6 border-border-strong h-full ${className}`}>
      <div className="w-8 h-8 bg-primary flex items-center justify-center text-black border border-black shrink-0">
        {icon}
      </div>
      <div className="min-w-0">
        <h1 className="text-sm font-black tracking-tighter text-foreground leading-none truncate uppercase">
          {title}<span className="text-secondary">{subtitle}</span>
        </h1>
      </div>
    </div>
  );
};

export default NavbarBrand;