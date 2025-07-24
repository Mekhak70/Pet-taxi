const CACHE_NAME = "pettaxi-cache-v11";

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
  "/images/logo.png"
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
  // Խուսափում ենք ոչ http(s) ռեսուրսներից (օր. chrome-extension://)
  if (!event.request.url.startsWith("http")) return;

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      // Եթե կա cache, վերադարձնում ենք այն
      if (cachedResponse) return cachedResponse;

      // Կամ else fetch ցանցից
      return fetch(event.request)
        .then((networkResponse) => {
          // Եթե պատասխանն անթույլատրելի է, պարզապես վերադարձնում ենք այն
          if (
            !networkResponse ||
            networkResponse.status !== 200 ||
            networkResponse.type !== "basic"
          ) {
            return networkResponse;
          }

          // Կլոնավորում ենք response-ը, քանի որ response-ները պինդ են մեկանգամյա օգտագործման համար
          const cloned = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, cloned).catch(() => {});
          });

          return networkResponse;
        })
        .catch((err) => {
          console.warn("SW fetch failed:", event.request.url, err);

          // Եթե request-ը navigation է (էջի URL), վերադարձնում ենք  ցանցի բացակայության HTML հաղորդագրություն
          if (event.request.mode === "navigate") {
            return new Response(
              "<h1>Դուք ցանցից անջատված եք</h1><p>Խնդրում ենք ստուգել կապը և կրկին փորձել։</p>",
              { headers: { "Content-Type": "text/html" } }
            );
          }

          // Մնացած դեպքերում ոչինչ չվերադարձնել
          return;
        });
    })
  );
});
