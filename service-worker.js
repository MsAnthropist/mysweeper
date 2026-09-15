// Bump this when the app shell changes so old caches get cleared out.
const CACHE = 'kerbwatch-shell-v1';

const SHELL_FILES = [
  './',
  'index.html',
  'manifest.json',
  'icon.svg',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(SHELL_FILES))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  const isData = url.pathname.includes('/data/');

  if (isData) {
    // Data files: always try the network first so you get fresh sweeping/RPP
    // data, but fall back to the last cached copy if you're offline.
    event.respondWith(
      fetch(event.request)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE).then((cache) => cache.put(event.request, copy));
          return res;
        })
        .catch(() => caches.match(event.request))
    );
    return;
  }

  // App shell: cache-first, so the map UI itself opens instantly offline.
  event.respondWith(
    caches.match(event.request).then((cached) => cached || fetch(event.request))
  );
});
