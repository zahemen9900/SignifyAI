import { Outlet } from 'react-router-dom';

import { ThemeToggle } from '@/components/ui/theme-toggle';

export function AppShell() {
  return (
    <div className="min-h-screen bg-background bg-ghana-gradient text-foreground transition-colors duration-300">
      <div className="pointer-events-none fixed inset-0 select-none bg-[radial-gradient(circle_at_top,rgba(15,118,110,0.18),transparent_55%)]" />
      <header className="relative z-10 flex items-center justify-between px-6 py-6 md:px-12">
        <div className="flex items-center gap-3">
          <img
            src="/logos/logo.jpg"
            alt="SignifyAI logo"
            className="h-12 w-12 rounded-2xl border border-border/40 bg-background/50 object-cover shadow-md"
            loading="lazy"
          />
          <div>
            <p className="font-display text-2xl font-black uppercase tracking-wide">SignifyAI</p>
            <p className="text-sm text-muted-foreground">Ghanaian Sign Language learning reimagined.</p>
          </div>
        </div>
        <ThemeToggle />
      </header>
      <main className="relative z-10 px-6 pb-16 md:px-12">
        <Outlet />
      </main>
    </div>
  );
}
