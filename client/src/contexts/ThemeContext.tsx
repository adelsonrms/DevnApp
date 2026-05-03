import React, { createContext, useContext, useEffect, useState } from 'react';
import { THEME_PRESETS, ThemeConfig, ThemeColors } from '../config/themes';

interface ThemeContextType {
  theme: string;
  config: ThemeConfig;
  setThemeById: (id: string) => void;
  updateCustomColors: (colors: Partial<ThemeColors>) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [themeId, setThemeId] = useState(() => {
    return localStorage.getItem('devnapp-theme-id') || THEME_PRESETS[0].id;
  });

  const [customColors, setCustomColors] = useState<Partial<ThemeColors>>(() => {
    const saved = localStorage.getItem('devnapp-custom-colors');
    return saved ? JSON.parse(saved) : {};
  });

  const currentTheme = THEME_PRESETS.find(t => t.id === themeId) || THEME_PRESETS[0];

  useEffect(() => {
    const root = window.document.documentElement;
    const colors = { ...currentTheme.colors, ...customColors };

    // Apply base class for light/dark specific tailwind classes
    root.classList.remove('light', 'dark');
    root.classList.add(currentTheme.type);

    // Apply CSS Variables
    root.style.setProperty('--background', colors.background);
    root.style.setProperty('--foreground', colors.foreground);
    root.style.setProperty('--primary', colors.primary);
    root.style.setProperty('--primary-foreground', colors.primaryForeground);
    root.style.setProperty('--secondary', colors.secondary);
    root.style.setProperty('--secondary-foreground', colors.secondaryForeground);
    root.style.setProperty('--accent', colors.accent);
    root.style.setProperty('--border', colors.border);
    root.style.setProperty('--border-strong', colors.borderStrong);
    root.style.setProperty('--panel-bg', colors.panelBg);

    localStorage.setItem('devnapp-theme-id', themeId);
    localStorage.setItem('devnapp-custom-colors', JSON.stringify(customColors));
  }, [themeId, currentTheme, customColors]);

  const setThemeById = (id: string) => {
    setThemeId(id);
    setCustomColors({}); // Reset custom colors when switching presets
  };

  const updateCustomColors = (colors: Partial<ThemeColors>) => {
    setCustomColors(prev => ({ ...prev, ...colors }));
  };

  return (
    <ThemeContext.Provider value={{ 
      theme: currentTheme.type, 
      config: currentTheme, 
      setThemeById,
      updateCustomColors
    }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
