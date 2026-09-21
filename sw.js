const CACHE_NAME = "tcm-flashcards-v2"; // Versiyonu v2 yaptık (telefon güncellemeyi algılasın diye)

const ASSETS = [
  "./",
  "./index.html",
  "./vaka-ornekleri.html", // Yeni eklenen vaka örnekleri sayfası
  "./manifest.json",
  "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2",
];

// Service Worker Yüklenme (Install)
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
  self.skipWaiting(); // Yeni Service Worker'ı hemen aktif et
});

// Yeni Service Worker Aktif Olduğunda Eski Önbellekleri (v1 vb.) Silme
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log("Eski önbellek temizleniyor:", cache);
            return caches.delete(cache);
          }
        })
      );
    })
  );
  self.clients.claim(); // Kontrolü hemen ele al
});

// İstek Yakalama (Fetch)
self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches
      .match(event.request)
      .then((response) => response || fetch(event.request))
  );
});
