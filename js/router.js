import { state, isLoggedIn, isAdmin, onStateChange } from './state.js';
import { renderLogin } from './pages/login.js';
import { renderRegister } from './pages/register.js';
import { renderPendingApproval } from './pages/pendingApproval.js';
import { renderHome } from './pages/home.js';
import { renderAdmin } from './pages/admin.js';
import { renderProfile } from './pages/profile.js';
import { renderAvailability } from './pages/availability.js';
import { renderCourtBooking } from './pages/courtBooking.js';
import { renderAnnouncements } from './pages/announcements.js';

/**
 * Router — logged-out users see an auth flow (login/register/pending, a
 * local UI mode rather than a URL); logged-in users get real hash routes:
 * '/', '/availability', '/court', '/announcements', '/profile', and
 * '/admin' (SuperAdmin only). The bottom nav only appears once logged in.
 */

let authMode = 'login'; // 'login' | 'register' | 'pending'
let pendingName = '';

const NAV_ROUTES = ['/', '/availability', '/court', '/announcements', '/profile'];

function viewContainer() {
  return document.getElementById('view');
}

function navContainer() {
  return document.getElementById('bottom-nav');
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

function updateNavVisibilityAndActiveState() {
  const nav = navContainer();
  if (!nav) return;

  if (!isLoggedIn()) {
    nav.hidden = true;
    return;
  }
  nav.hidden = false;

  const route = currentHashRoute();
  nav.querySelectorAll('[data-route]').forEach((el) => {
    el.classList.toggle('active', el.dataset.route === route || (el.dataset.route === '/' && route === '/admin'));
  });
}

export function renderRoute() {
  const el = viewContainer();
  if (!el) return;
  el.innerHTML = '';

  if (!isLoggedIn()) {
    updateNavVisibilityAndActiveState();
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
  updateNavVisibilityAndActiveState();

  if (route === '/admin' && isAdmin()) {
    renderAdmin(el);
  } else if (route === '/availability') {
    renderAvailability(el);
  } else if (route === '/court') {
    renderCourtBooking(el);
  } else if (route === '/announcements') {
    renderAnnouncements(el);
  } else if (route === '/profile') {
    renderProfile(el);
  } else {
    renderHome(el);
  }
}

export function initRouter() {
  window.addEventListener('hashchange', renderRoute);
  onStateChange(() => {
    if (!isLoggedIn()) authMode = 'login'; // reset auth mode after logout
    renderRoute();
  });
  renderRoute();
}
