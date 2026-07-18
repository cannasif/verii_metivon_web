/**
 * Notification endpoints are inherited from CRM and are not part of the
 * Metivon API contract yet. They stay opt-in until the API module is enabled.
 */
export const NOTIFICATIONS_ENABLED = import.meta.env.VITE_ENABLE_NOTIFICATIONS === 'true';
export const REAL_TIME_NOTIFICATIONS_ENABLED =
  NOTIFICATIONS_ENABLED && import.meta.env.VITE_ENABLE_SIGNALR === 'true';
