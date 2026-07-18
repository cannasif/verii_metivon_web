import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { I18nextProvider } from 'react-i18next';
import { QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from './components/theme-provider';
import { TooltipProvider } from './components/ui/tooltip';
import './index.css';
import i18n, { ensureI18nReady } from './lib/i18n';
import App from './App.tsx';
import { queryClient } from './lib/query-client';
import { ensureApiReady } from './lib/axios';
import { useAuthStore } from './stores/auth-store';

async function bootstrap(): Promise<void> {
  await Promise.all([ensureApiReady(), ensureI18nReady()]);
  useAuthStore.getState().init();
  const root = document.getElementById('root')!;
  createRoot(root).render(
    <StrictMode>
      <I18nextProvider i18n={i18n}>
        <QueryClientProvider client={queryClient}>
          <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
            <TooltipProvider delayDuration={200} skipDelayDuration={100}>
              <App />
            </TooltipProvider>
          </ThemeProvider>
        </QueryClientProvider>
      </I18nextProvider>
    </StrictMode>,
  );
}

bootstrap();
