/**
 * SPL Service Worker — Phase 0 version.
 * Strategy: cache-first for the app shell (so the app opens instantly and
 * works offline), network-first for anything else (later, API calls will
 * fall back to last-known cached data via storageUtils.js in Phase 9).
 *
 * IMPORTANT: bump CACHE_NAME on every deploy that changes cached files,
 * or returning users will keep seeing the old shell.
 */

const CACHE_NAME = 'spl-shell-v2'; // bumped for Phase 1 — new files added below

const SHELL_FILES = [
  './',
  './index.html',
  './manifest.json',
  './css/tokens.css',
  './css/base.css',
  './css/components.css',
  './css/forms.css',
  './js/config.js',
  './js/api.js',
  './js/app.js',
  './js/state.js',
  './js/auth.js',
  './js/router.js',
  './js/pages/login.js',
  './js/pages/register.js',
  './js/pages/pendingApproval.js',
  './js/pages/home.js',
  './js/pages/admin.js',
  './icons/icon-192.png',
  './icons/icon-512.png',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(SHELL_FILES))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const { request } = event;

  // Never cache API calls (Apps Script) — always go to network
  if (request.method !== 'GET' || request.url.includes('script.google.com')) {
    return;
  }

  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached;
      return fetch(request).then((response) => {
        const clone = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
        return response;
      });
    })
  );
});
