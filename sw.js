const CACHE_NAME = 'kknku-pro-v1';
const ASSETS_TO_CACHE = [
    './',
    './index.html',
    './manifest.json'
];

// Instalasi Service Worker dan Caching Aset Utama
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                return cache.addAll(ASSETS_TO_CACHE);
            })
            .then(() => self.skipWaiting())
    );
});

// Menghapus cache versi lama saat Service Worker baru aktif
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cache) => {
                    if (cache !== CACHE_NAME) {
                        return caches.delete(cache);
                    }
                })
            );
        }).then(() => self.clients.claim())
    );
});

// Intersep Fetch: Cache First, Fallback to Network (Offline Support)
self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request)
            .then((response) => {
                // Kembalikan dari cache jika ada
                if (response) {
                    return response;
                }
                
                // Jika tidak ada di cache, ambil dari jaringan
                return fetch(event.request).then((networkResponse) => {
                    // Validasi respons jaringan
                    if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
                        return networkResponse;
                    }

                    // Kloning respons jaringan untuk disimpan ke cache secara dinamis
                    const responseToCache = networkResponse.clone();
                    caches.open(CACHE_NAME)
                        .then((cache) => {
                            // Hindari caching request dari ekstensi browser (chrome-extension://)
                            if (event.request.url.startsWith('http')) {
                                cache.put(event.request, responseToCache);
                            }
                        });

                    return networkResponse;
                }).catch(() => {
                    // Penanganan saat jaringan mati total dan aset tidak ada di cache
                    // Abaikan jika tidak diperlukan logika tambahan
                });
            })
    );
});
