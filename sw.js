const CACHE_NAME = 'altin-fiyatlari-v1';
// Çevrimdışı modda çalışması için önbelleğe alınacak dosyaların listesi
const urlsToCache = [
  '/',
  'index.html',
  'style.css',
  'script.js',
  'logo.png'
];

// 1. Yükleme (Install) adımı: Dosyaları önbelleğe al
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Önbellek açıldı');
        return cache.addAll(urlsToCache);
      })
  );
});

// 2. Fetch adımı: Bir kaynak istendiğinde (resim, script vb.)
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Eğer istenen kaynak önbellekte varsa, oradan döndür
        if (response) {
          return response;
        }
        // Önbellekte yoksa, internetten çek
        return fetch(event.request);
      })
  );
});