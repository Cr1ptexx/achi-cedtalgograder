// Offline cache. The compiler files come from binji.github.io and are large, so once fetched they are kept
// (cache-first). Site files (app, tests, statements) use network-first and fall back to the cache when offline.
const COMPILER = 'algo-lab-compiler-v1';
const SITE = 'algo-lab-site-v1';

self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((ks) => Promise.all(ks.filter((k) => k !== COMPILER && k !== SITE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.hostname === 'binji.github.io') {
    e.respondWith(
      caches.open(COMPILER).then(async (c) => {
        const hit = await c.match(req);
        if (hit) return hit;
        const res = await fetch(req);
        if (res.ok || res.type === 'opaque') c.put(req, res.clone());
        return res;
      }),
    );
  } else if (url.origin === location.origin) {
    e.respondWith(
      fetch(req)
        .then((res) => { if (res.ok) caches.open(SITE).then((c) => c.put(req, res.clone())); return res; })
        .catch(() => caches.match(req).then((r) => r || Response.error())),
    );
  }
});
