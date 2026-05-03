import React from 'react';

const Footer: React.FC = () => {
  return (
      <div id="footer-area-main" className="h-10 p-2 bg-background transition-colors w-full">
      <div id="footer-content" className="h-full bg-panel-bg px-6 flex items-center justify-between">
        <div id="footer-version" className="flex items-center gap-4">
          <span className="text-[7px] font-black text-foreground/30 uppercase tracking-[0.3em]">DEVNFW_MONOREPO_NODE_V.2.0.4</span>
        </div>
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 bg-primary animate-pulse" />
            <span className="text-[8px] font-black text-primary uppercase tracking-widest">SYSTEM_READY</span>
          </div>
          <span className="text-[7px] font-black text-foreground/30 uppercase tracking-[0.3em]">©_MMXXVI_DEVONNO_CO</span>
        </div>
      </div>
    </div>
  );
};

export default Footer;
