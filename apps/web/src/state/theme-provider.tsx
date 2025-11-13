import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';

import { useAuth } from '@/state/auth-provider';

const PREFERRED_THEME_KEY = 'signifyai:theme';

type Theme = 'light' | 'dark';

type ThemeContextState = {
  theme: Theme;
  setTheme: (next: Theme) => void;
  toggleTheme: () => void;
};

const ThemeContext = createContext<ThemeContextState | undefined>(undefined);

function resolveInitialTheme(): Theme {
  if (typeof window === 'undefined') {
    return 'dark';
  }

  const stored = window.localStorage.getItem(PREFERRED_THEME_KEY) as Theme | null;
  if (stored === 'light' || stored === 'dark') {
    return stored;
  }

  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  return prefersDark ? 'dark' : 'light';
}

function applyDocumentTheme(theme: Theme) {
  const root = document.documentElement;
  root.classList.remove('light', 'dark');
  root.classList.add(theme);
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const { settings, updateSettings } = useAuth();
  const [theme, setThemeState] = useState<Theme>(() => resolveInitialTheme());

  useEffect(() => {
    applyDocumentTheme(theme);
    window.localStorage.setItem(PREFERRED_THEME_KEY, theme);
  }, [theme]);

  useEffect(() => {
    if (settings?.app_theme && settings.app_theme !== theme) {
      setThemeState(settings.app_theme);
    }
  }, [settings?.app_theme, theme]);

  const persistTheme = useCallback(
    (next: Theme) => {
      setThemeState(next);
      if (settings?.user_id) {
        void updateSettings({ app_theme: next });
      }
    },
    [settings?.user_id, updateSettings]
  );

  const value = useMemo<ThemeContextState>(
    () => ({
      theme,
      setTheme: persistTheme,
      toggleTheme: () => {
        const next = theme === 'dark' ? 'light' : 'dark';
        persistTheme(next);
      }
    }),
    [persistTheme, theme]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return ctx;
}
