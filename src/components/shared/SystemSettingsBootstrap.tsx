import { type ReactElement, useEffect } from 'react';
import { useAuthStore } from '@/stores/auth-store';
import { useAppShellStore } from '@/stores/app-shell-store';
import { systemSettingsApi } from '@/features/system-settings/api/systemSettingsApi';
import { useSystemSettingsStore } from '@/stores/system-settings-store';

export function SystemSettingsBootstrap(): ReactElement | null {
  const token = useAuthStore((state) => state.token);
  const userId = useAuthStore((state) => state.user?.id ?? null);
  const bootstrapAppShell = useAppShellStore((state) => state.bootstrapAppShell);

  useEffect(() => {
    let cancelled = false;

    async function bootstrapSettings(): Promise<void> {
      if (!token || !userId) return;

      try {
        const [, settingsResult] = await Promise.allSettled([
          bootstrapAppShell({ token, userId }),
          systemSettingsApi.get(),
        ]);
        if (settingsResult.status === 'fulfilled') {
          useSystemSettingsStore.getState().setSettings(settingsResult.value);
        }
        if (cancelled) return;
      } catch {
        // App shell bootstrap should not block app rendering.
      }
    }

    void bootstrapSettings();

    return () => {
      cancelled = true;
    };
  }, [bootstrapAppShell, token, userId]);

  return null;
}
