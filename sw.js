const CACHE_NAME = 'apex-v28';[cite: 3]

// الملفات الأساسية المتاحة فعلياً فقط لضمان عدم حدوث خطأ 404 والشاشة البيضاء
const INITIAL_ASSETS = [
    './',
    './index.html',
    './manifest.json'
];

self.addEventListener('install', (event) => {[cite: 2]
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(INITIAL_ASSETS);
        })
    );
    // تفعيل التحديث الجديد فوراً في الخلفية بدون انتظار إغلاق التطبيق
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {[cite: 2]
    event.waitUntil(
        caches.keys().then((keys) => {
            return Promise.all(
                keys.map((key) => {
                    // حذف أي كاش قديم تلقائياً
                    if (key !== CACHE_NAME) {
                        return caches.delete(key);
                    }
                })
            );
        })
    );
    self.clients.claim();
});

// استراتيجية ذكية لجلب الملفات وتحديث الكاش تلقائياً دون تعطيل التطبيق[cite: 2]
self.addEventListener('fetch', (event) => {
    if (event.request.method !== 'GET') return;

    event.respondWith(
        caches.match(event.request).then((cachedResponse) => {
            const fetchPromise = fetch(event.request).then((networkResponse) => {
                if (networkResponse && networkResponse.status === 200) {
                    const responseClone = networkResponse.clone();
                    caches.open(CACHE_NAME).then((cache) => {
                        cache.put(event.request, responseClone);
                    });
                }
                return networkResponse;
            }).catch(() => {
                // في حالة انقطاع الإنترنت التام، يفتح من الكاش بسلاسة
            });

            return cachedResponse || fetchPromise;
        })
    );
});