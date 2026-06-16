const CACHE_NAME = "loan-cache-v3";
const ASSETS = [
  "./",
  "./index.html",
  "./admin.html",
  "./app.js",
  "./admin.js",
  "./manifest.json",
  "./icons/icon-192.png",
  "./icons/icon-512.png"
];

// 1. Instalación: Guarda los archivos en caché
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS)).catch(() => {})
  );
});

// 2. Activación: Borra versiones viejas y toma el control
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
    .then(() => clients.claim())
  );
});

// 3. Fetch: Sirve los archivos desde la caché
self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((cached) => cached || fetch(event.request).catch(() => cached))
  );
});
