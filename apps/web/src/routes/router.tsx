import { createBrowserRouter } from 'react-router-dom';

import { AppShell } from '@/layouts/app-shell';
import { AuthPage } from '@/pages/auth';
import { DashboardPage } from '@/pages/dashboard';
import { LandingPage } from '@/pages/landing';
import { ProtectedRoute } from '@/routes/protected-route';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppShell />,
    children: [
      {
        index: true,
        element: <LandingPage />
      },
      {
        path: 'dashboard',
        element: (
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        )
      }
    ]
  },
  {
    path: '/auth',
    element: <AuthPage />
  }
]);
