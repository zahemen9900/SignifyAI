import { Moon, Sun } from 'lucide-react';

import { useTheme } from '@/state/theme-provider';

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-muted/60 px-4 py-2 text-sm font-semibold text-foreground shadow-sm transition hover:border-brand hover:text-brand"
      aria-label="Toggle theme"
    >
      {theme === 'dark' ? <Moon size={16} /> : <Sun size={16} />}
      <span>{theme === 'dark' ? 'Dark' : 'Light'} mode</span>
    </button>
  );
}
