import { CONFIG } from './config.js';
import { callApi } from './api.js';

/**
 * Pings the backend on an interval and shows a small "Live" indicator with
 * "synced Xs ago" in the header. This exists specifically so it's visibly
 * obvious whether the app is talking to the real backend right now or
 * showing something stale — the dot + timestamp are ground truth, not
 * decoration.
 */

let lastSyncAt = null;
let pingTimerId = null;
let tickTimerId = null;

function dotEl() {
  return document.getElementById('sync-dot');
}
function textEl() {
  return document.getElementById('sync-text');
}

function setIndicator(state, text) {
  const dot = dotEl();
  const label = textEl();
  if (dot) dot.dataset.state = state; // 'live' | 'stale' | 'offline' | 'pending'
  if (label) label.textContent = text;
}

function tick() {
  if (!lastSyncAt) return;
  const secondsAgo = Math.round((Date.now() - lastSyncAt) / 1000);
  const staleThreshold = CONFIG.SYNC_INTERVAL_MS / 1000 + 15; // grace period before calling it "stale"

  if (secondsAgo < 3) {
    setIndicator('live', 'Live');
  } else if (secondsAgo < staleThreshold) {
    setIndicator('live', `Synced ${secondsAgo}s ago`);
  } else {
    setIndicator('stale', `Synced ${secondsAgo}s ago`);
  }
}

async function pingOnce() {
  try {
    const result = await callApi('system.ping', {});
    lastSyncAt = Date.now();
    tick();
    return result;
  } catch (err) {
    setIndicator('offline', 'Offline');
    return null;
  }
}

/** Starts the background heartbeat. Call once at app boot. */
export function startSync() {
  setIndicator('pending', 'Connecting…');
  pingOnce();
  pingTimerId = setInterval(pingOnce, CONFIG.SYNC_INTERVAL_MS);
  tickTimerId = setInterval(tick, 1000);

  // Ping immediately when the tab/app becomes visible again — catches the
  // "left it in the background overnight" case without waiting a full cycle.
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') pingOnce();
  });
}

export function stopSync() {
  if (pingTimerId) clearInterval(pingTimerId);
  if (tickTimerId) clearInterval(tickTimerId);
}
