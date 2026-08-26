import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';

export type ThemeMode = 'dark' | 'light';

interface ThemeContextType {
  theme: ThemeMode;
  isLight: boolean;
  isDark: boolean;
  setTheme: (theme: ThemeMode) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: 'dark',
  isLight: false,
  isDark: true,
  setTheme: () => {},
  toggleTheme: () => {},
});

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<ThemeMode>(() => {
    try {
      const saved = localStorage.getItem('mely_theme_mode');
      if (saved === 'light' || saved === 'dark') return saved;
    } catch {
      // ignore
    }
    return 'dark';
  });

  const setTheme = useCallback((newTheme: ThemeMode) => {
    setThemeState(newTheme);
    try {
      localStorage.setItem('mely_theme_mode', newTheme);
    } catch {
      // ignore
    }
  }, []);

  const toggleTheme = useCallback(() => {
    setThemeState((prev) => {
      const next = prev === 'dark' ? 'light' : 'dark';
      try {
        localStorage.setItem('mely_theme_mode', next);
      } catch {
        // ignore
      }
      return next;
    });
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    const body = document.body;
    // La barra de estado del OS toma este color cuando la PWA corre standalone (sin la
    // barra de direcciones del navegador) — si queda fija en el rosa de marca en vez de
    // seguir el tema, se ve como una franja roja pegada arriba que no combina con nada.
    const themeColorMeta = document.querySelector('meta[name="theme-color"]');

    if (theme === 'light') {
      root.classList.add('theme-light');
      root.classList.remove('theme-dark', 'dark');
      body.classList.add('theme-light');
      body.classList.remove('theme-dark', 'dark');
      body.style.backgroundColor = '#ffffff';
      body.style.color = '#0f172a';
      themeColorMeta?.setAttribute('content', '#ffffff');
    } else {
      root.classList.add('theme-dark', 'dark');
      root.classList.remove('theme-light');
      body.classList.add('theme-dark', 'dark');
      body.classList.remove('theme-light');
      body.style.backgroundColor = '#0b090a';
      body.style.color = '#fdf2f4';
      themeColorMeta?.setAttribute('content', '#0b090a');
    }
  }, [theme]);

  const value = useMemo<ThemeContextType>(
    () => ({
      theme,
      isLight: theme === 'light',
      isDark: theme === 'dark',
      setTheme,
      toggleTheme,
    }),
    [theme, setTheme, toggleTheme]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useTheme = () => useContext(ThemeContext);

