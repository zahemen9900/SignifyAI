import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import {
  BarChart3,
  BookOpenCheck,
  ChevronLeft,
  ChevronRight,
  CircleHelp,
  Compass,
  LogOut,
  PartyPopper,
  Search,
  Settings,
  Sparkles
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { useAuth } from '@/state/auth-provider';
import { useTheme } from '@/state/theme-provider';

type NavigationItem = {
  label: string;
  to: string;
  icon: ReactNode;
  badge?: string;
};

const mainNav: NavigationItem[] = [
  { label: 'Dashboard', to: '/dashboard', icon: <BarChart3 size={16} /> },
  { label: 'Practice', to: '/practice/basics', icon: <BookOpenCheck size={16} />, badge: '3 Tracks' },
  { label: 'Ask', to: '/ask', icon: <CircleHelp size={16} /> },
  { label: 'Search', to: '/search', icon: <Search size={16} /> }
];

function SidebarNav({ collapsed }: { collapsed: boolean }) {
  const location = useLocation();

  return (
    <nav className="flex flex-1 flex-col gap-2">
      {mainNav.map((item) => {
        const isActive = location.pathname.startsWith(item.to);

        return (
          <NavLink
            key={item.label}
            to={item.to}
            className={({ isActive: routeActive }) =>
              `group relative flex items-center justify-between rounded-2xl border border-transparent px-4 py-3 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/60 focus-visible:ring-offset-2 ${
                routeActive || isActive
                  ? 'bg-brand/20 text-brand shadow-glow dark:text-emerald-200'
                  : 'text-muted-foreground hover:border-border hover:bg-muted/30 hover:text-foreground'
              }`
            }
          >
            <span className="flex items-center gap-3">
              {item.icon}
              {!collapsed ? <span>{item.label}</span> : null}
            </span>
            {!collapsed && item.badge ? <Badge variant="outline" className="border-border/60 text-xs">{item.badge}</Badge> : null}
          </NavLink>
        );
      })}
    </nav>
  );
}

function UserPanel({ collapsed }: { collapsed: boolean }) {
  const { profile, settings, signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const nickname = profile?.nickname ?? profile?.email ?? 'Explorer';
  const avatarLetter = nickname.slice(0, 1).toUpperCase();

  return (
    <Card className="border-border/60 bg-background/80">
      <CardContent className="flex items-center justify-between gap-3 p-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-border/50 bg-brand/15 text-base font-semibold text-brand dark:text-emerald-200">
            {avatarLetter}
          </div>
          {!collapsed ? (
            <div className="text-left">
              <p className="text-sm font-semibold text-foreground">{nickname}</p>
              <p className="text-xs text-muted-foreground">{settings?.time_zone ?? 'UTC'}</p>
            </div>
          ) : null}
        </div>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-9 w-9 rounded-full text-muted-foreground hover:text-brand"
            onClick={toggleTheme}
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? <MoonIcon /> : <SunIcon />}
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-9 w-9 rounded-full text-muted-foreground hover:text-foreground"
            onClick={() => {
              if (typeof window !== 'undefined') {
                const event = new CustomEvent('signifyai:open-settings');
                window.dispatchEvent(event);
              }
            }}
            aria-label="Open settings"
          >
            <Settings size={16} />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-9 w-9 rounded-full text-muted-foreground hover:text-highlight"
            onClick={() => {
              void signOut();
            }}
            aria-label="Sign out"
          >
            <LogOut size={16} />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function SettingsPortal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { settings, updateSettings } = useAuth();
  const [timeZone, setTimeZone] = useState(settings?.time_zone ?? 'UTC');
  const [assistive, setAssistive] = useState(settings?.prefers_assistive_learning ?? false);
  const availableTimeZones = useMemo(() => {
    if (typeof (Intl as unknown as { supportedValuesOf?: (input: string) => string[] }).supportedValuesOf === 'function') {
      return ((Intl as unknown as { supportedValuesOf: (input: string) => string[] }).supportedValuesOf('timeZone') ?? []).slice(0, 200);
    }

    return ['UTC'];
  }, []);

  useEffect(() => {
    setTimeZone(settings?.time_zone ?? 'UTC');
    setAssistive(settings?.prefers_assistive_learning ?? false);
  }, [settings?.prefers_assistive_learning, settings?.time_zone]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await updateSettings({ time_zone: timeZone, prefers_assistive_learning: assistive });
    onClose();
  };

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className="fixed inset-0 z-50 flex items-end justify-center bg-background/60 backdrop-blur-sm md:items-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 40, opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="mx-4 w-full max-w-xl rounded-3xl border border-border/60 bg-background p-6 shadow-2xl"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1">
                <h2 className="font-display text-2xl uppercase text-foreground">Studio preferences</h2>
                <p className="text-sm text-muted-foreground">
                  Tune how SignifyAI accompanies your Ghanaian Sign Language practice.
                </p>
              </div>
              <Button variant="ghost" size="icon" className="rounded-full" onClick={onClose} aria-label="Close settings">
                <ChevronRight size={16} className="rotate-90" />
              </Button>
            </div>

            <form onSubmit={handleSubmit} className="mt-6 space-y-6">
              <div className="space-y-2 rounded-2xl border border-border/60 bg-muted/40 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-foreground">Assistive learning hints</p>
                    <p className="text-xs text-muted-foreground">
                      When on, we surface visual cues to help keep your signs aligned.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setAssistive((value) => !value)}
                    className={`relative inline-flex h-7 w-14 items-center rounded-full border border-border/70 transition ${
                      assistive ? 'bg-highlight text-highlight-foreground' : 'bg-muted text-muted-foreground'
                    }`}
                    aria-pressed={assistive}
                  >
                    <span
                      className={`mx-1 inline-block h-5 w-5 rounded-full bg-background shadow transition ${
                        assistive ? 'translate-x-6' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
              </div>

              <div className="space-y-3 rounded-2xl border border-border/60 bg-muted/40 p-4">
                <label className="text-sm font-semibold text-foreground" htmlFor="time-zone-select">
                  Preferred time zone
                </label>
                <select
                  id="time-zone-select"
                  value={timeZone ?? 'UTC'}
                  onChange={(event) => setTimeZone(event.target.value)}
                  className="w-full rounded-xl border border-border/60 bg-background px-3 py-2 text-sm text-foreground shadow-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/40"
                >
                  {availableTimeZones.map((zone) => (
                    <option key={zone} value={zone} className="bg-background text-foreground">
                      {zone}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center justify-between">
                <Button type="button" variant="ghost" onClick={onClose}>
                  Cancel
                </Button>
                <Button type="submit" className="gap-2">
                  <Sparkles size={16} /> Save preferences
                </Button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

export function DashboardLayout() {
  const { profile } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    if (typeof window === 'undefined') {
      return undefined;
    }

    function handleOpenSettings() {
      setSettingsOpen(true);
    }

    window.addEventListener('signifyai:open-settings', handleOpenSettings);
    return () => {
      window.removeEventListener('signifyai:open-settings', handleOpenSettings);
    };
  }, []);

  const nickname = profile?.nickname ?? 'Explorer';
  const sidebarWidth = collapsed ? 96 : 296;

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <motion.aside
        initial={{ width: 296 }}
        animate={{ width: sidebarWidth }}
        className="hidden h-screen flex-col border-r border-border/60 bg-background/95 px-4 py-6 shadow-lg lg:sticky lg:top-0 lg:flex"
      >
        <div className="flex items-center justify-between px-2">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-border/60 bg-brand/15 text-brand">
              <Compass size={18} />
            </div>
            {!collapsed ? (
              <div>
                <p className="font-display text-xl font-black tracking-wide">SignifyAI</p>
                <p className="text-xs text-muted-foreground">Ghanaian Sign Language studio</p>
              </div>
            ) : null}
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-9 w-9 rounded-full text-muted-foreground hover:text-brand"
            onClick={() => setCollapsed((value) => !value)}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </Button>
        </div>

        <div className="mt-8 flex flex-1 flex-col gap-6 overflow-hidden">
          <SidebarNav collapsed={collapsed} />
        </div>

        <div className="mt-6 flex flex-col gap-3">
          <UserPanel collapsed={collapsed} />
        </div>
      </motion.aside>

      <div className="flex min-h-screen flex-1 flex-col bg-background">
        <header className="sticky top-0 z-40 flex flex-wrap items-center justify-between gap-4 border-b border-border/60 bg-background/90 px-6 py-5 backdrop-blur lg:px-10">
          <div className="space-y-1">
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-muted-foreground">Signify studio</p>
            <h1 className="font-display text-3xl uppercase text-foreground">
              {location.pathname === '/dashboard'
                ? 'Dashboard'
                : location.pathname
                    .split('/')
                    .filter(Boolean)
                    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
                    .join(' / ')}
            </h1>
          </div>
          <Badge variant="outline" className="border-border/70 text-xs">
            <Sparkles size={14} className="mr-1" /> {nickname}
          </Badge>
        </header>

        <main className="flex-1 bg-background px-6 py-10 lg:px-10">
          <Outlet />
        </main>
      </div>

      <SettingsPortal open={settingsOpen} onClose={() => setSettingsOpen(false)} />
      <StreakCelebration />
    </div>
  );
}

function StreakCelebration() {
  const { streakEvent, acknowledgeStreakEvent } = useAuth();

  return (
    <AnimatePresence>
      {streakEvent ? (
        <motion.div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-background/70 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={acknowledgeStreakEvent}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="mx-4 w-full max-w-md rounded-3xl border border-brand/30 bg-background p-6 text-center shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-brand/15 text-brand dark:text-emerald-200">
              <PartyPopper size={28} />
            </div>
            <h2 className="mt-4 font-display text-2xl text-foreground">Streak rising!</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              {streakEvent.previous === 0
                ? `You're kicking things off with a ${streakEvent.current}-day streak. Keep signing daily to unlock more rewards.`
                : `You just pushed your streak to ${streakEvent.current} days. Amazing consistency!`}
            </p>
            <Button type="button" className="mt-6" onClick={acknowledgeStreakEvent}>
              Keep learning
            </Button>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

function MoonIcon() {
  return <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor"><path d="M21 12.79A9 9 0 0 1 11.21 3 7 7 0 1 0 21 12.79" /></svg>;
}

function SunIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
      <path d="M12 18a6 6 0 1 0 0-12 6 6 0 0 0 0 12Zm0 4a1 1 0 0 1-1-1v-1a1 1 0 1 1 2 0v1a1 1 0 0 1-1 1Zm0-20a1 1 0 0 1 1 1v1a1 1 0 1 1-2 0V3a1 1 0 0 1 1-1Zm10 9h-1a1 1 0 1 1 0 2h1a1 1 0 0 1 0-2Zm-18 0H3a1 1 0 0 1 0 2H2a1 1 0 0 1 0-2Zm14.95 7.95a1 1 0 0 1-1.41 0l-.7-.7a1 1 0 1 1 1.41-1.41l.7.7a1 1 0 0 1 0 1.41Zm-11.31-11.3a1 1 0 0 1-1.41 0l-.7-.71a1 1 0 0 1 1.41-1.41l.7.7a1 1 0 0 1 0 1.42Zm11.31-1.41a1 1 0 0 1 0-1.41l.7-.7a1 1 0 0 1 1.41 1.41l-.7.7a1 1 0 0 1-1.41 0Zm-11.31 11.3a1 1 0 0 1 0 1.41l-.7.7a1 1 0 0 1-1.41-1.41l.7-.7a1 1 0 0 1 1.41 0Z" />
    </svg>
  );
}
