/**
 * SPL Service Worker — "network-first" strategy.
 *
 * Every request tries the network FIRST, always getting the latest
 * deployed version when online. The cache is purely a fallback for when
 * the device has no connection at all (so the app still opens offline).
 * This deliberately trades a little offline sophistication for
 * correctness: at this app's scale, "always show real data" matters far
 * more than aggressive offline caching, and this is what eliminates the
 * stale-version bugs we kept hitting during development.
 *
 * IMPORTANT: bump CACHE_NAME whenever you want to force every device to
 * fully discard its old fallback cache (rarely needed now, since network
 * is always preferred when available).
 */

const CACHE_NAME = 'spl-shell-v4-networkfirst';

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
  './js/sync.js',
  './js/router.js',
  './js/pages/login.js',
  './js/pages/register.js',
  './js/pages/pendingApproval.js',
  './js/pages/home.js',
  './js/pages/admin.js',
  './js/pages/profile.js',
  './js/pages/availability.js',
  './js/pages/courtBooking.js',
  './js/pages/announcements.js',
  './icons/icon-192.png',
  './icons/icon-512.png',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) =>
      cache.addAll(SHELL_FILES).catch(() => {
        // Don't let one missing file block install — offline fallback is
        // best-effort, not a hard requirement.
      })
    )
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

  // Never intercept API calls — those always go straight to the network,
  // full stop, no caching, no fallback (stale API data is worse than none).
  if (request.method !== 'GET' || request.url.indexOf('script.google.com') !== -1) {
    return;
  }

  event.respondWith(
    fetch(request, { cache: 'no-store' })
      .then((response) => {
        const clone = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
        return response;
      })
      .catch(() => caches.match(request)) // offline fallback only
  );
});
