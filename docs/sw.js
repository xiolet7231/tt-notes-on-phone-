const CACHE_NAME = 'toptick-cache-v1';
const STATIC_ASSETS = [
  './',
  './index.html',
  './manifest.json'
];
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS))
  );
});
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((resp) => resp || fetch(event.request))
  );
});
