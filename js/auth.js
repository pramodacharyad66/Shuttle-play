import { callApi } from './api.js';
import { setSession, clearSession } from './state.js';

/**
 * @param {{mobile: string, pin: string, name: string, nickname?: string}} fields
 */
export async function register(fields) {
  return callApi('auth.register', fields);
}

/**
 * @param {{mobile: string, pin: string}} fields
 */
export async function login(fields) {
  const result = await callApi('auth.login', fields);
  setSession(result.sessionToken, result.user);
  return result.user;
}

export async function logout() {
  try {
    await callApi('auth.logout', {});
  } finally {
    // Clear local session even if the network call fails — the person
    // asked to log out, so their device should forget the token regardless.
    clearSession();
  }
}
