import { Navigate, useLocation } from 'react-router-dom';
import type { ReactNode } from 'react';

import { useAuth } from '@/state/auth-provider';

const Fallback = () => (
  <div className="flex min-h-[60vh] items-center justify-center">
    <div className="animate-pulse rounded-3xl border border-border/40 bg-background/70 px-6 py-5 text-sm text-muted-foreground shadow-lg">
      Preparing your learning hub...
    </div>
  </div>
);

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <Fallback />;
  }

  if (!user) {
    return <Navigate to="/auth" replace state={{ from: location }} />;
  }

  return <>{children}</>;
}
