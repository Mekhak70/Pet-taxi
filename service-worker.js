const CACHE_NAME = "pettaxi-cache-v7"; // փոխիր version ամեն deploy-ի ժամանակ

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
  self.skipWaiting(); // Նոր SW-ն անմիջապես ակտիվանա
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
  self.clients.claim();

  // Ակտիվանալուց հետո բոլոր բացված clients-ին ուղարկում ենք refresh հրաման
  self.clients.matchAll({ type: "window" }).then((clients) => {
    clients.forEach((client) => {
      client.navigate(client.url); // ավտոմատ refresh
    });
  });
});

// --- FETCH ---
self.addEventListener("fetch", (event) => {
  if (!event.request.url.startsWith("http")) return;

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      const fetchPromise = fetch(event.request)
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
            cache.put(event.request, cloned).catch(() => {});
          });

          return networkResponse;
        })
        .catch(() => {
          if (event.request.mode === "navigate") {
            return new Response(
              "<h1>Դուք ցանցից անջատված եք</h1><p>Ստուգեք կապը և նորից փորձեք։</p>",
              { headers: { "Content-Type": "text/html" } }
            );
          }
        });

      return cachedResponse || fetchPromise;
    })
  );
});
