const CACHE_NAME = 'tetys-calc-v15';

// Только свои файлы — внешние CDN не кэшируем при установке,
// чтобы один нестабильный внешний запрос не ронял всю установку.
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './js/config.js',
  './js/utils.js',
  './js/pricing.js',
  './js/main.js',
  './manifest.json'
];

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      // Кэшируем каждый файл по отдельности: если один не загрузится,
      // остальные всё равно закэшируются, а не вся установка целиком провалится.
      return Promise.all(
        ASSETS_TO_CACHE.map((url) =>
          cache.add(url).catch((err) => {
            console.warn('SW: не удалось закэшировать при установке:', url, err);
          })
        )
      );
    })
  );
});

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

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  event.respondWith(
    // Сеть в приоритете: всегда пытаемся получить свежую версию.
    fetch(event.request)
      .then((networkResponse) => {
        // Обновляем кэш свежим ответом (для офлайн-режима в будущем).
        const responseClone = networkResponse.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseClone).catch(() => {});
        });
        return networkResponse;
      })
      .catch(() => {
        // Сети нет (офлайн) — отдаём то, что есть в кэше.
        return caches.match(event.request);
      })
  );
});
