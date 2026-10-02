import React, { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [isDark, setIsDark] = useState(() => {
    try {
      const saved = localStorage.getItem('theme');
      if (saved === 'dark') return true;
      if (saved === 'light') return false;
      return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    } catch {
      return false;
    }
  });

  useEffect(() => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.add('dark');
      root.style.colorScheme = 'dark';
      try {
        localStorage.setItem('theme', 'dark');
      } catch {}
    } else {
      root.classList.remove('dark');
      root.style.colorScheme = 'light';
      try {
        localStorage.setItem('theme', 'light');
      } catch {}
    }
  }, [isDark]);

  const toggleTheme = () => {
    setIsDark(prev => {
      const next = !prev;
      const root = document.documentElement;
      if (next) {
        root.classList.add('dark');
        root.style.colorScheme = 'dark';
        try { localStorage.setItem('theme', 'dark'); } catch {}
      } else {
        root.classList.remove('dark');
        root.style.colorScheme = 'light';
        try { localStorage.setItem('theme', 'light'); } catch {}
      }
      return next;
    });
  };

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    return {
      isDark: typeof document !== 'undefined' && document.documentElement.classList.contains('dark'),
      toggleTheme: () => {
        if (typeof document !== 'undefined') {
          const root = document.documentElement;
          const willBeDark = !root.classList.contains('dark');
          if (willBeDark) {
            root.classList.add('dark');
            root.style.colorScheme = 'dark';
            try { localStorage.setItem('theme', 'dark'); } catch {}
          } else {
            root.classList.remove('dark');
            root.style.colorScheme = 'light';
            try { localStorage.setItem('theme', 'light'); } catch {}
          }
        }
      }
    };
  }
  return context;
}
