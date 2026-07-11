/**
 * SPL — Centralized configuration.
 * Nothing outside this file should hardcode the API URL or app constants.
 */

export const CONFIG = {
  // Paste your Apps Script Web App "exec" URL here after Step 4 of the
  // deployment guide. Placeholder for now — Phase 0 has no live backend yet.
  API_BASE_URL: 'PASTE_YOUR_APPS_SCRIPT_WEB_APP_URL_HERE',

  APP_NAME: 'SPL',
  APP_FULL_NAME: 'ShuttlePlay',

  // Live-update polling interval (ms)
  SYNC_INTERVAL_MS: 30000,

  // localStorage keys
  STORAGE_KEYS: {
    SESSION_TOKEN: 'spl_session_token',
    USER: 'spl_user',
    THEME: 'spl_theme',
    LAST_DASHBOARD: 'spl_last_dashboard',
  },

  DEFAULT_THEME: 'dark',
};
