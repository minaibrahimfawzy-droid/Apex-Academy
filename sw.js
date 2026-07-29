const CACHE_NAME = 'apex-v6';

// الملفات الأساسية للتخزين السريع (محدثة لتشمل الموديولات الجديدة واللوجو)
const INITIAL_ASSETS = [
    './',
    './index.html',
    './manifest.json',
    './images/logo.png',
    './css/main.css',
    './css/layout.css',
    './css/components.css',
    './css/theme.css',
    './js/config.js',
    './js/storage.js',
    './js/helpers.js',
    './js/ui.js',
    './js/app.js',
    './js/years.js',
    './js/halls.js',
    './js/groups.js'
];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => cache.addAll(INITIAL_ASSETS))
    );
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((keys) => {
            return Promise.all(
                keys.map((key) => {
                    if (key !== CACHE_NAME) return caches.delete(key);
                })
            );
        })
    );
    self.clients.claim();
});

// استراتيجية Cache First مع حفظ أي ملف يُطلب تلقائياً
self.addEventListener('fetch', (event) => {
    if (event.request.method !== 'GET') return;

    event.respondWith(
        caches.match(event.request).then((cachedResponse) => {
            if (cachedResponse) {
                fetch(event.request).then((networkResponse) => {
                    if (networkResponse && networkResponse.status === 200) {
                        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, networkResponse));
                    }
                }).catch(() => {});
                return cachedResponse;
            }

            return fetch(event.request).then((networkResponse) => {
                if (networkResponse && networkResponse.status === 200) {
                    const responseClone = networkResponse.clone();
                    caches.open(CACHE_NAME).then((cache) => cache.put(event.request, responseClone));
                }
                return networkResponse;
            }).catch(() => {
                // في حالة الأوفلاين التام
            });
        })
    );
});
```[cite: 1]