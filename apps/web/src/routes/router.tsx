import { Navigate, createBrowserRouter } from 'react-router-dom';

import { AppShell } from '@/layouts/app-shell';
import { DashboardLayout } from '@/layouts/dashboard-layout';
import { AuthPage } from '@/pages/auth';
import { AskPage } from '@/pages/ask';
import { DashboardPage } from '@/pages/dashboard';
import { LandingPage } from '@/pages/landing';
import { PracticeAdvancedPage } from '@/pages/practice/advanced';
import { PracticeBasicsPage } from '@/pages/practice/basics';
import { PracticeFreestylePage } from '@/pages/practice/freestyle';
import { PracticeLayout } from '@/pages/practice/layout';
import { SearchPage } from '@/pages/search';
import { ProtectedRoute } from '@/routes/protected-route';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppShell />,
    children: [
      {
        index: true,
        element: <LandingPage />
      }
    ]
  },
  {
    element: (
      <ProtectedRoute>
        <DashboardLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        path: '/dashboard',
        element: <DashboardPage />
      },
      {
        path: '/practice',
        element: <PracticeLayout />,
        children: [
          {
            index: true,
            element: <Navigate to="/practice/basics" replace />
          },
          {
            path: 'basics',
            element: <PracticeBasicsPage />
          },
          {
            path: 'advanced',
            element: <PracticeAdvancedPage />
          },
          {
            path: 'freestyle',
            element: <PracticeFreestylePage />
          }
        ]
      },
      {
        path: '/ask',
        element: <AskPage />
      },
      {
        path: '/search',
        element: <SearchPage />
      }
    ]
  },
  {
    path: '/auth',
    element: <AuthPage />
  }
]);
