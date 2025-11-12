import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';

import '@/styles/global.css';
import { queryClient } from '@/lib/query-client';
import { router } from '@/routes/router';
import { AuthProvider } from '@/state/auth-provider';
import { ThemeProvider } from '@/state/theme-provider';

const container = document.getElementById('root');

if (!container) {
  throw new Error('Root element #root missing in index.html');
}

const root = createRoot(container);

root.render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ThemeProvider>
          <RouterProvider router={router} />
        </ThemeProvider>
      </AuthProvider>
    </QueryClientProvider>
  </StrictMode>
);
