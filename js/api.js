import { CONFIG } from './config.js';

/**
 * callApi — the single function every page uses to talk to the backend.
 *
 * Sends a text/plain POST (deliberately, not application/json) so the
 * browser does NOT trigger a CORS preflight OPTIONS request, which Apps
 * Script Web Apps don't handle well. The body is still JSON — we just
 * parse it manually on the server side.
 *
 * @param {string} action - e.g. 'auth.login', 'dashboard.get'
 * @param {object} payload - action-specific data
 * @returns {Promise<any>} the `data` field of a successful response
 * @throws {Error} with a human-readable message on failure
 */
export async function callApi(action, payload = {}) {
  const sessionToken = localStorage.getItem(CONFIG.STORAGE_KEYS.SESSION_TOKEN) || null;

  let response;
  try {
    response = await fetch(CONFIG.API_BASE_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({ action, payload, sessionToken }),
    });
  } catch (networkErr) {
    throw new Error('Network error — check your connection.');
  }

  let json;
  try {
    json = await response.json();
  } catch (parseErr) {
    throw new Error('Unexpected response from server.');
  }

  if (!json.success) {
    throw new Error(json.error || 'Something went wrong.');
  }

  return json.data;
}

/**
 * Convenience health-check used to verify the frontend can reach the
 * backend during Phase 0 setup/testing. Backend must implement the
 * 'system.ping' action (included in the Phase 0 Code.gs skeleton).
 */
export async function pingBackend() {
  return callApi('system.ping', {});
}
