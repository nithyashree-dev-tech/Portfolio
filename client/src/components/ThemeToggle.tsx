import { Moon, Sun } from 'lucide-react';

type ThemeToggleProps = {
  theme: 'dark' | 'light';
  setTheme: (theme: 'dark' | 'light') => void;
};

const ThemeToggle = ({ theme, setTheme }: ThemeToggleProps) => (
  <button
    type="button"
    className="theme-toggle"
    aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
    onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
  >
    {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
  </button>
);

export default ThemeToggle;
