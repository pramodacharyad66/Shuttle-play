import { CONFIG } from './config.js';
import { initRouter } from './router.js';
import { startSync } from './sync.js';

/**
 * App bootstrap — Phase 1: theme handling + router init.
 * (Phase 0's ping/self-test screen is gone now that the router drives
 * real content; the connection is proven implicitly by login working.)
 */

function applyStoredTheme() {
  const theme = localStorage.getItem(CONFIG.STORAGE_KEYS.THEME) || CONFIG.DEFAULT_THEME;
  document.documentElement.setAttribute('data-theme', theme);
}

function toggleTheme() {
  const current = document.documentElement.getAttribute('data-theme');
  const next = current === 'light' ? 'dark' : 'light';
  document.documentElement.setAttribute('data-theme', next);
  localStorage.setItem(CONFIG.STORAGE_KEYS.THEME, next);
}

function init() {
  applyStoredTheme();

  const themeToggle = document.getElementById('theme-toggle');
  if (themeToggle) themeToggle.addEventListener('click', toggleTheme);

  initRouter();
  startSync();

  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js').catch(() => {
      // Non-fatal — app still works without offline caching
    });
  }
}

document.addEventListener('DOMContentLoaded', init);
