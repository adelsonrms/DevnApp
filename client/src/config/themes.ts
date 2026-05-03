export interface ThemeColors {
  background: string;
  foreground: string;
  primary: string;
  primaryForeground: string;
  secondary: string;
  secondaryForeground: string;
  accent: string;
  border: string;
  borderStrong: string;
  panelBg: string;
}

export interface ThemeConfig {
  id: string;
  name: string;
  type: 'light' | 'dark';
  colors: ThemeColors;
}

export const THEME_PRESETS: ThemeConfig[] = [
  {
    id: 'cyber-dark',
    name: 'CYBER_DARK (DEFAULT)',
    type: 'dark',
    colors: {
      background: '#121214',
      foreground: '#ffffff',
      primary: '#00ff00',
      primaryForeground: '#000000',
      secondary: '#00ffff',
      secondaryForeground: '#000000',
      accent: '#ff00ff',
      border: '#27272a',
      borderStrong: '#71717a',
      panelBg: '#18181b',
    }
  },
  {
    id: 'industrial-light',
    name: 'INDUSTRIAL_LIGHT',
    type: 'light',
    colors: {
      background: '#f4f4f5',
      foreground: '#09090b',
      primary: '#10b981',
      primaryForeground: '#ffffff',
      secondary: '#06b6d4',
      secondaryForeground: '#ffffff',
      accent: '#d946ef',
      border: '#e4e4e7',
      borderStrong: '#a1a1aa',
      panelBg: '#ffffff',
    }
  },
  {
    id: 'matrix-node',
    name: 'MATRIX_NODE',
    type: 'dark',
    colors: {
      background: '#000a00',
      foreground: '#00ff41',
      primary: '#00ff41',
      primaryForeground: '#000000',
      secondary: '#008f11',
      secondaryForeground: '#ffffff',
      accent: '#003b00',
      border: '#003b00',
      borderStrong: '#008f11',
      panelBg: '#000d00',
    }
  },
  {
    id: 'retro-terminal',
    name: 'RETRO_TERMINAL',
    type: 'dark',
    colors: {
      background: '#1a1a1a',
      foreground: '#f0ad4e',
      primary: '#f0ad4e',
      primaryForeground: '#000000',
      secondary: '#5bc0de',
      secondaryForeground: '#000000',
      accent: '#d9534f',
      border: '#333333',
      borderStrong: '#666666',
      panelBg: '#222222',
    }
  }
];
