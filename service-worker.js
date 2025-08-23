const CACHE_NAME = "pettaxi-cache-v70"; // << ամեն թարմացման ժամանակ փոխիր version-ը

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

// --- INSTALL ---
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(urlsToCache))
  );
  // Անմիջապես ակտիվացնի նոր service worker
  self.skipWaiting();
});

// --- ACTIVATE ---
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
  // Նոր SW-ն անմիջապես կառաջնորդի բոլոր clients
  self.clients.claim();
});

// --- FETCH ---
self.addEventListener("fetch", (event) => {
  if (!event.request.url.startsWith("http")) return;

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      const fetchPromise = fetch(event.request)
        .then((networkResponse) => {
          // Վերահսկում ենք որ պատասխանն OK լինի
          if (
            !networkResponse ||
            networkResponse.status !== 200 ||
            networkResponse.type !== "basic"
          ) {
            return networkResponse;
          }

          // Թարմացնենք cache-ը նոր response-ով
          const cloned = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, cloned).catch(() => {});
          });

          return networkResponse;
        })
        .catch((err) => {
          console.warn("SW fetch failed:", event.request.url, err);
          if (event.request.mode === "navigate") {
            return new Response(
              "<h1>Դուք ցանցից անջատված եք</h1><p>Ստուգեք կապը և նորից փորձեք։</p>",
              { headers: { "Content-Type": "text/html" } }
            );
          }
        });

      // Եթե cache կա՝ ցույց է տալիս cache-ը, բայց ֆոնում քաշում է նոր տարբերակը
      return cachedResponse || fetchPromise;
    })
  );
});

// --- UPDATE LOGIC ---
// Երբ նոր service worker կա, ինքը կսկսի աշխատել անմիջապես
self.addEventListener("controllerchange", () => {
  // Կարող ես օգտագործողի համար refresh անել
  window.location.reload();
});
