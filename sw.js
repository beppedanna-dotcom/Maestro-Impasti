/**
 * Maestro degli Impasti - Service Worker per PWA e Modalità Offline
 */

const CACHE_NAME = "maestro-impasti-v2";
const STATIC_ASSETS = [
  "./",
  "./index.html",
  "./privacy.html",
  "./manifest.json",
  "./data/recipes.js",
  "./js/calculator.js",
  "./js/troubleshooter.js",
  "./js/storage.js",
  "./js/agent.js",
  "./js/app.js",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
  "./icons/icon-maskable.png"
];

// Installazione Service Worker e pre-caching
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("[Service Worker] Pre-caching asset statici completato");
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

// Attivazione e pulizia vecchie cache
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            console.log("[Service Worker] Rimozione vecchia cache:", key);
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Strategia di fetch: Network-First con fallback su Cache (per garantire aggiornamenti dal vivo quando online)
self.addEventListener("fetch", (event) => {
  // Ignora richieste non-GET o verso API esterne
  if (event.request.method !== "GET") return;

  const url = new URL(event.request.url);

  // Per le chiamate API (/api/...) lascia fare direttamente al network
  if (url.pathname.startsWith("/api/")) {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        // Se la richiesta va a buon fine, aggiorna la cache
        if (networkResponse && networkResponse.status === 200 && networkResponse.type === "basic") {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return networkResponse;
      })
      .catch(() => {
        // Se siamo offline, recupera dalla cache
        return caches.match(event.request).then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }
          // Se la pagina richiesta è HTML e non in cache, restituisci index.html
          if (event.request.headers.get("accept")?.includes("text/html")) {
            return caches.match("./index.html");
          }
        });
      })
  );
});
