
const CACHE_NAME = "tcm-flashcards-v3";

const ASSETS = [
  "./",
  "./index.html",
  "./vaka-ornekleri.html",
  "./spot-bilgiler.html",
  "./manifest.json",
  "./flashcardLogo-512x512.png"
];

// Kurulum
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) =>
      cache.addAll(ASSETS)
    )
  );

  self.skipWaiting();
});

// Eski uygulama önbelleklerini temizle
self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();

      await Promise.all(
        keys
          .filter((key) =>
            key.startsWith("tcm-flashcards-") &&
            key !== CACHE_NAME
          )
          .map((key) => caches.delete(key))
      );

      await self.clients.claim();
    })()
  );
});

// HTML sayfalarında önce internetten güncel sürümü al
self.addEventListener("fetch", (event) => {
  const request = event.request;

  if (request.method !== "GET") return;

  const url = new URL(request.url);

  // Supabase ve diğer harici istekleri önbelleğe alma
  if (url.origin !== self.location.origin) return;

  const isHTML =
    request.mode === "navigate" ||
    url.pathname.endsWith(".html");

  if (isHTML) {
    event.respondWith(
      (async () => {
        try {
          const response = await fetch(request);

          if (response.ok) {
            const cache = await caches.open(CACHE_NAME);
            await cache.put(request, response.clone());
          }

          return response;
        } catch (error) {
          const cached = await caches.match(request);
          if (cached) return cached;

          throw error;
        }
      })()
    );
    return;
  }

  // Diğer yerel dosyalarda önce önbellek
  event.respondWith(
    (async () => {
      const cached = await caches.match(request);
      if (cached) return cached;

      const response = await fetch(request);
      return response;
    })()
  );
});
