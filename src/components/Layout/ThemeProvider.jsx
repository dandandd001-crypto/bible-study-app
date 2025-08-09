import React, { useEffect } from 'react';
import { useLocalStorage } from '../../hooks/useLocalStorage.js';

export const ThemeContext = React.createContext({
  theme: 'system',
  setTheme: () => {},
  toggle: () => {},
});

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useLocalStorage('theme', 'system');

  useEffect(() => {
    const root = document.documentElement;

    function applyTheme(t) {
      if (t === 'dark') {
        root.classList.add('dark');
      } else if (t === 'light') {
        root.classList.remove('dark');
      } else {
        // system
        const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        root.classList.toggle('dark', isDark);
      }
    }

    applyTheme(theme);

    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const handle = () => {
      if (theme === 'system') {
        applyTheme('system');
      }
    };
    media.addEventListener?.('change', handle);
    return () => media.removeEventListener?.('change', handle);
  }, [theme]);

  function toggle() {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  }

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggle }}>
      {children}
    </ThemeContext.Provider>
  );
}
