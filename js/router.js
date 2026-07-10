import { state, isLoggedIn, isAdmin, onStateChange } from './state.js';
import { renderLogin } from './pages/login.js';
import { renderRegister } from './pages/register.js';
import { renderPendingApproval } from './pages/pendingApproval.js';
import { renderHome } from './pages/home.js';
import { renderAdmin } from './pages/admin.js';

/**
 * Phase 1 routing is intentionally simple: logged-out users see an auth
 * flow (login/register/pending — a local UI mode, not a URL), logged-in
 * users see Home, and '#/admin' (SuperAdmin only) shows the approval
 * screen. Real multi-page routing (Matches, Payments, etc.) arrives once
 * those pages exist in later phases.
 */

let authMode = 'login'; // 'login' | 'register' | 'pending'
let pendingName = '';

function viewContainer() {
  return document.getElementById('view');
}

export function goToPending(name) {
  pendingName = name || '';
  authMode = 'pending';
  renderRoute();
}

function setAuthMode(mode) {
  authMode = mode;
  renderRoute();
}

function currentHashRoute() {
  return window.location.hash.replace('#', '') || '/';
}

export function renderRoute() {
  const el = viewContainer();
  if (!el) return;
  el.innerHTML = '';

  if (!isLoggedIn()) {
    if (authMode === 'register') {
      renderRegister(el, {
        onSwitchToLogin: () => setAuthMode('login'),
        onRegistered: (name) => goToPending(name),
      });
    } else if (authMode === 'pending') {
      renderPendingApproval(el, {
        name: pendingName,
        onBackToLogin: () => setAuthMode('login'),
      });
    } else {
      renderLogin(el, { onSwitchToRegister: () => setAuthMode('register') });
    }
    return;
  }

  const route = currentHashRoute();
  if (route === '/admin' && isAdmin()) {
    renderAdmin(el);
  } else {
    renderHome(el);
  }
}

export function initRouter() {
  window.addEventListener('hashchange', renderRoute);
  onStateChange(() => {
    authMode = 'login'; // reset auth mode after login/logout transitions
    renderRoute();
  });
  renderRoute();
}
