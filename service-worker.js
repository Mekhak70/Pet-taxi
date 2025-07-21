const CACHE_NAME = "pettaxi-cache-v7"; // փոխիր յուրաքանչյուր անգամ ֆայլերի փոփոխման դեպքում

const urlsToCache = [
  "/",
  "/index.html",
  "/indexru.html",
  "/indexus.html",
  "/about.html",
  "/aboutus.html",
  "/aboutru.html",
  "/blog-single.html",
  "/blog-single1.html",
  "/blog-single2.html",
  "/blog-singleru.html",
  "/blog-singleru1.html",
  "/blog-singleru2.html",
  "/blog-singleus.html",
  "/blog-singleus1.html",
  "/blog-singleus2.html",
  "/blog.html",
  "/blogru.html",
  "/blogus.html",
  "/contact.html",
  "/contactus.html",
  "/contactru.html",
  "/faq.html",
  "/faqus.html",
  "/faqru.html",
  "/pricing.html",
  "/pricingus.html",
  "/pricingru.html",
  "/services.html",
  "/servicesru.html",
  "/servicesus.html",
  "/script.js",
  "/scriptru.js",
  "/scriptus.js",
  "/css/style.css",
  "/images/logo.png",
];


self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(urlsToCache);
    })
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) =>
      Promise.all(
        cacheNames.map((name) => {
          if (name !== CACHE_NAME) {
            return caches.delete(name);
          }
        })
      )
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) return cachedResponse;

      return fetch(event.request)
        .then((networkResponse) => {
          if (
            !networkResponse ||
            networkResponse.status !== 200 ||
            networkResponse.type !== "basic"
          ) {
            return networkResponse;
          }

          const cloned = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, cloned);
          });

          return networkResponse;
        })
        .catch(() => {
          if (event.request.mode === "navigate") {
            return caches.match("/Pet-taxi/offline.html");
          }
        });
    })
  );
});
