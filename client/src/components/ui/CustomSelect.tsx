import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ChevronDown, Check, X } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface Option {
  id: string;
  label: string;
  description?: string;
  icon?: React.ReactNode;
}

interface CustomSelectProps {
  options: Option[];
  value: string | string[];
  onChange: (value: any) => void;
  placeholder?: string;
  multiple?: boolean;
  searchable?: boolean;
  className?: string;
}

const CustomSelect: React.FC<CustomSelectProps> = ({
  options,
  value,
  onChange,
  placeholder = "Selecionar...",
  multiple = false,
  searchable = true,
  className
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedOptions = Array.isArray(value) 
    ? options.filter(opt => value.includes(opt.id))
    : options.filter(opt => opt.id === value);

  const filteredOptions = options.filter(opt => 
    opt.label.toLowerCase().includes(searchQuery.toLowerCase())
  );

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleToggle = (id: string) => {
    if (multiple) {
      const currentValues = Array.isArray(value) ? value : [];
      const newValue = currentValues.includes(id)
        ? currentValues.filter(v => v !== id)
        : [...currentValues, id];
      onChange(newValue);
    } else {
      onChange(id);
      setIsOpen(false);
    }
  };

  return (
    <div className={cn("relative w-full", className)} ref={containerRef}>
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex items-center justify-between px-3 h-full bg-border-strong/20 border border-border-strong cursor-pointer transition-all duration-200 hover:border-primary",
          isOpen && "border-primary bg-border-strong/40"
        )}
      >
        <div className="flex flex-wrap gap-2 flex-1">
          {selectedOptions.length > 0 ? (
            selectedOptions.map(opt => (
              <span key={opt.id} className="flex items-center gap-1.5 px-2 py-0.5 bg-primary text-black text-[10px] font-black uppercase border border-primary">
                {opt.label}
                {multiple && (
                  <X 
                    size={10} 
                    className="cursor-pointer hover:text-white" 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleToggle(opt.id);
                    }}
                  />
                )}
              </span>
            ))
          ) : (
            <span className="text-foreground text-[10px] font-black uppercase tracking-widest">{placeholder}</span>
          )}
        </div>
        <ChevronDown 
          className={cn("text-primary transition-transform duration-200", isOpen && "rotate-180")} 
          size={14} 
        />
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            className="absolute z-[100] w-full mt-1 bg-panel-bg border-2 border-border-strong shadow-2xl overflow-hidden"
          >
            {searchable && (
              <div className="p-2 border-b border-border-strong/30 bg-background/50">
                <div className="relative">
                  <Search className="absolute left-2 top-1/2 -translate-y-1/2 text-primary" size={12} />
                  <input
                    type="text"
                    className="w-full bg-background border border-border-strong pl-7 pr-3 py-1.5 text-[10px] font-bold text-foreground focus:outline-none focus:border-primary uppercase"
                    placeholder="Filtrar..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    autoFocus
                  />
                </div>
              </div>
            )}

            <div className="max-h-60 overflow-y-auto custom-scrollbar">
              {filteredOptions.length > 0 ? (
                filteredOptions.map((option) => {
                  const isSelected = Array.isArray(value) ? value.includes(option.id) : value === option.id;
                  return (
                    <div
                      key={option.id}
                      onClick={() => handleToggle(option.id)}
                      className={cn(
                        "flex items-center justify-between px-3 py-2.5 cursor-pointer transition-colors border-b border-border-strong/10 last:border-0",
                        isSelected ? "bg-primary/20 text-primary" : "text-foreground hover:bg-primary hover:text-black"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        {option.icon && <span className="shrink-0">{option.icon}</span>}
                        <div>
                          <p className="text-[10px] font-black uppercase tracking-wider">{option.label}</p>
                          {option.description && (
                            <p className={cn(
                              "text-[8px] font-bold uppercase mt-0.5",
                              isSelected ? "text-primary/70" : "text-foreground/70"
                            )}>
                              {option.description}
                            </p>
                          )}
                        </div>
                      </div>
                      {isSelected && <Check size={12} className="text-primary" />}
                    </div>
                  );
                })
              ) : (
                <div className="px-3 py-4 text-center">
                  <p className="text-[10px] font-bold text-foreground/50 uppercase">Nenhum resultado</p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CustomSelect;
