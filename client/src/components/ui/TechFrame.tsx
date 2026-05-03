import React from 'react';

interface TechFrameProps {
  id?: string;
  parent?: string;
  children: React.ReactNode;
  className?: string;
  contentClassName?: string;
  hideBorders?: ('top' | 'right' | 'bottom' | 'left')[];
  hideCorners?: ('tl' | 'tr' | 'bl' | 'br')[];
}

const TechFrame = ({ 
  id,
  parent,
  children, 
  className = '', 
  contentClassName = '',
  hideBorders = [],
  hideCorners = []
}: TechFrameProps) => {
  const borderClasses = {
    top: hideBorders.includes('top') ? '' : 'border-t-1',
    right: hideBorders.includes('right') ? '' : 'border-r-1',
    bottom: hideBorders.includes('bottom') ? '' : 'border-b-1',
    left: hideBorders.includes('left') ? '' : 'border-l-1',
  };

  const paddingClasses = {
    top: hideBorders.includes('top') ? 'pt-0' : 'pt-1',
    right: 'pr-1', // Always keep right padding for beveled corners
    bottom: hideBorders.includes('bottom') ? 'pb-0' : 'pb-1',
    left: hideBorders.includes('left') ? 'pl-0' : 'pl-1',
  };

  return (
    <div id={id} data-parent={parent} className={`relative bg-background ${Object.values(paddingClasses).join(' ')} ${className}`}>
      {/* Outer Border / Frame */}
      <div data-parent={parent} className={`absolute inset-0 border-border-strong pointer-events-none ${Object.values(borderClasses).join(' ')}`} />
      
      {/* Chanfo/Cantos triagulares */}
      {!hideCorners.includes('tl') && <div className="absolute top-0 left-0 w-2 h-2 bg-border-strong [clip-path:polygon(0%_0%,100%_0%,0%_100%)]" />}
      {!hideCorners.includes('tr') && <div className="absolute top-0 right-0 w-2 h-2 bg-border-strong [clip-path:polygon(0%_0%,100%_0%,100%_100%)]" />}
      {!hideCorners.includes('bl') && <div className="absolute bottom-0 left-0 w-2 h-2 bg-border-strong [clip-path:polygon(0%_0%,0%_100%,100%_100%)]" />}
      {!hideCorners.includes('br') && <div className="absolute bottom-0 right-0 w-2 h-2 bg-border-strong [clip-path:polygon(100%_0%,100%_100%,0%_100%)]" />}

      {/* Internal Content Container with beveled corners */}
      <div className="relative h-full w-full bg-panel-bg overflow-hidden [clip-path:polygon(8px_0%,calc(100%-8px)_0%,100%_8px,100%_calc(100%-8px),calc(100%-8px)_100%,8px_100%,0%_calc(100%-8px),0%_8px)]">
        <div className={`h-full w-full overflow-y-auto ${contentClassName}`}>
          {children}
        </div>
      </div>
    </div>
  );
};

export default TechFrame;
