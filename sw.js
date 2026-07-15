// sw.js (VERSI 6: FULL DYNAMIC CACHING)
const CACHE_NAME = 'kknku-pro-v6';
const ASSETS_TO_CACHE = [
    './',
    './index.html',
    './manifest.json',
    './icon-192.png',
    './icon-512.png'
];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS_TO_CACHE))
    );
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((keys) => Promise.all(
            keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
        ))
    );
});

self.addEventListener('fetch', (event) => {
    // 1. Strategi Cache-First untuk semua request
    event.respondWith(
        caches.match(event.request).then((cachedResponse) => {
            if (cachedResponse) return cachedResponse;

            // 2. Jika tidak ada di cache, ambil dari network
            return fetch(event.request).then((networkResponse) => {
                // 3. Simpan hasil network ke cache (Runtime Caching)
                if (networkResponse && networkResponse.status === 200) {
                    const responseToCache = networkResponse.clone();
                    caches.open(CACHE_NAME).then((cache) => {
                        cache.put(event.request, responseToCache);
                    });
                }
                return networkResponse;
            }).catch(() => {
                // Opsional: Fallback untuk request yang gagal (misal jika bukan file navigasi)
                return new Response('Offline', { status: 404 });
            });
        })
    );
});
