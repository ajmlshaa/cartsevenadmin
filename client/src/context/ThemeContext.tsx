import React, { createContext, useContext, useState, useEffect } from 'react';

export interface ThemeColors {
  name: 'orange' | 'purple';
  primary: string;
  primaryHover: string;
  primaryLight: string;
  primaryBorder: string;
  chartLine: string;
  label: string;
}

const THEMES: Record<'orange' | 'purple', ThemeColors> = {
  orange: {
    name: 'orange',
    primary: '#FF5500',
    primaryHover: '#E64D00',
    primaryLight: 'rgba(255, 85, 0, 0.15)',
    primaryBorder: 'rgba(255, 85, 0, 0.3)',
    chartLine: '#FF5500',
    label: 'Brand Orange',
  },
  purple: {
    name: 'purple',
    primary: '#6C5DD3',
    primaryHover: '#5B4DC2',
    primaryLight: 'rgba(108, 93, 211, 0.15)',
    primaryBorder: 'rgba(108, 93, 211, 0.3)',
    chartLine: '#8B5CF6',
    label: 'Figma Purple',
  },
};

interface ThemeContextType {
  theme: ThemeColors;
  setThemeName: (name: 'orange' | 'purple') => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [themeName, setThemeNameState] = useState<'orange' | 'purple'>(() => {
    return (localStorage.getItem('cartseven_theme') as 'orange' | 'purple') || 'orange';
  });

  const theme = THEMES[themeName] || THEMES.orange;

  const setThemeName = (name: 'orange' | 'purple') => {
    setThemeNameState(name);
    localStorage.setItem('cartseven_theme', name);
  };

  const toggleTheme = () => {
    setThemeName(themeName === 'orange' ? 'purple' : 'orange');
  };

  return (
    <ThemeContext.Provider value={{ theme, setThemeName, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};
