import { CONFIG } from './config.js';

/**
 * Small state store. Not a framework — just an object plus a subscribe
 * list, so pages can react when login/logout happens without polling.
 */

const listeners = new Set();

function loadUser() {
  try {
    const raw = localStorage.getItem(CONFIG.STORAGE_KEYS.USER);
    return raw ? JSON.parse(raw) : null;
  } catch (err) {
    return null;
  }
}

export const state = {
  user: loadUser(),
  sessionToken: localStorage.getItem(CONFIG.STORAGE_KEYS.SESSION_TOKEN) || null,
};

export function setSession(sessionToken, user) {
  state.sessionToken = sessionToken;
  state.user = user;
  localStorage.setItem(CONFIG.STORAGE_KEYS.SESSION_TOKEN, sessionToken);
  localStorage.setItem(CONFIG.STORAGE_KEYS.USER, JSON.stringify(user));
  notify();
}

export function clearSession() {
  state.sessionToken = null;
  state.user = null;
  localStorage.removeItem(CONFIG.STORAGE_KEYS.SESSION_TOKEN);
  localStorage.removeItem(CONFIG.STORAGE_KEYS.USER);
  notify();
}

export function isLoggedIn() {
  return Boolean(state.sessionToken && state.user);
}

export function isAdmin() {
  return isLoggedIn() && state.user.role === 'SuperAdmin';
}

/** @param {(state: object) => void} fn @returns {() => void} unsubscribe */
export function onStateChange(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

function notify() {
  listeners.forEach((fn) => fn(state));
}
