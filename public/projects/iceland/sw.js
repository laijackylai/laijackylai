// Offline support. Caches what you actually use:
//  - the app shell + hashed assets (network-first for pages, cache-first for /assets/)
//  - map tiles you have viewed (stale-while-revalidate, capped) — no bulk prefetch, per the OSM tile usage policy
//  - Wikimedia photos you have opened (cache-first, capped)
const SHELL = 'shell-v2', TILES = 'tiles-v1', PHOTOS = 'photos-v1';
const TILE_HOSTS = /(^|\.)(tile\.openstreetmap\.org|tile\.opentopomap\.org|server\.arcgisonline\.com)$/;
const MAX = { [TILES]: 4000, [PHOTOS]: 800 };

self.addEventListener('install', e => { e.waitUntil(caches.open(SHELL).then(c => c.addAll(['./', './index.html']))); self.skipWaiting(); });
self.addEventListener('activate', e => e.waitUntil(
  caches.keys().then(ks => Promise.all(ks.filter(k => ![SHELL, TILES, PHOTOS].includes(k)).map(k => caches.delete(k)))).then(() => self.clients.claim())));

async function trim(name) {
  const c = await caches.open(name), keys = await c.keys();
  for (let i = 0; i < keys.length - MAX[name]; i++) await c.delete(keys[i]);   // oldest first
}

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);

  if (req.mode === 'navigate') {
    e.respondWith(fetch(req).then(r => { caches.open(SHELL).then(c => c.put('./index.html', r.clone())); return r; })
      .catch(() => caches.match('./index.html')));
    return;
  }
  if (url.origin === location.origin && (url.pathname.includes('/assets/') || url.pathname.includes('/thumbs/'))) {
    e.respondWith(caches.match(req).then(hit => hit || fetch(req).then(r => { if (r.ok) { const cp = r.clone(); caches.open(SHELL).then(c => c.put(req, cp)); } return r; })));
    return;
  }
  if (TILE_HOSTS.test(url.hostname)) {
    e.respondWith(caches.open(TILES).then(async c => {
      const hit = await c.match(req);
      const net = fetch(req).then(r => { if (r.ok) { c.put(req, r.clone()); trim(TILES); } return r; }).catch(() => hit);
      return hit || net;
    }));
    return;
  }
  if (url.hostname === 'upload.wikimedia.org') {
    e.respondWith(caches.open(PHOTOS).then(async c => (await c.match(req)) || fetch(req).then(r => {
      if (r.ok) { c.put(req, r.clone()); trim(PHOTOS); }   // CORS requests only: opaque responses inflate storage quota
      return r;
    })));
  }
});
