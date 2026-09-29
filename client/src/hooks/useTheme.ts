import { useEffect, useState } from 'react';

const THEME_KEY = 'portfolio-theme';

type ThemeMode = 'dark' | 'light';

export const useTheme = () => {
  const [theme, setTheme] = useState<ThemeMode>(() => {
    const saved = localStorage.getItem(THEME_KEY);
    if (saved === 'dark' || saved === 'light') return saved;

    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem(THEME_KEY, theme);
  }, [theme]);

  return { theme, setTheme };
};
