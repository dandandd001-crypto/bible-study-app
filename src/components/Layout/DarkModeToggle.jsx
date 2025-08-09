import React, { useContext, useMemo } from 'react';
import { ThemeContext } from './ThemeProvider.jsx';
import { Moon, Sun } from 'lucide-react';
import { Button } from '../UI/Button.jsx';

export default function DarkModeToggle() {
  const { theme, setTheme, toggle } = useContext(ThemeContext);

  const icon = useMemo(() => {
    const isDark =
      theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
    return isDark ? <Sun size={18} /> : <Moon size={18} />;
  }, [theme]);

  return (
    <div className="flex items-center gap-2">
      <Button variant="ghost" size="sm" onClick={toggle} title="Toggle dark mode" aria-label="Toggle dark mode">
        {icon}
      </Button>
      <select
        className="text-sm bg-transparent border rounded px-2 py-1"
        value={theme}
        onChange={(e) => setTheme(e.target.value)}
      >
        <option value="system">System</option>
        <option value="light">Light</option>
        <option value="dark">Dark</option>
      </select>
    </div>
  );
}
