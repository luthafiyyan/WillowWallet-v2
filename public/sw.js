const CACHE_NAME = 'willow-static-v2';
const IMAGE_CACHE = 'willow-images-v2';
const DYNAMIC_CACHE = 'willow-dynamic-v2';

const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/offline.html',
  '/favicon.svg',
  '/manifest.webmanifest',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
  '/icons/maskable-icon.png'
];

// Install Event - Pre-cache core assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[Service Worker] Pre-caching offline pages and core assets');
      return cache.addAll(PRECACHE_ASSETS);
    }).then(() => self.skipWaiting())
  );
});

// Activate Event - Clean up stale caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME && cache !== IMAGE_CACHE && cache !== DYNAMIC_CACHE) {
            console.log('[Service Worker] Deleting old cache:', cache);
            return caches.delete(cache);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Helper to check if a request is for an image
const isImageRequest = (request) => {
  const url = request.url;
  return (
    request.destination === 'image' ||
    url.match(/\.(png|jpg|jpeg|gif|svg|webp|ico)/) ||
    url.includes('dicebear.com')
  );
};

// Helper to check if a request is a static asset (js, css, font)
const isStaticAsset = (request) => {
  const url = request.url;
  return (
    request.destination === 'style' ||
    request.destination === 'script' ||
    request.destination === 'font' ||
    url.match(/\.(js|css|woff2?|ttf|otf|eot)/)
  );
};

// Fetch Event - Handle Caching Strategies
self.addEventListener('fetch', (event) => {
  const request = event.request;
  const url = new URL(request.url);

  // Skip non-GET requests (e.g. POST, PUT, Firebase Realtime Database WebSockets/API)
  if (request.method !== 'GET') {
    return;
  }

  // Skip chrome-extension, dev server websockets, and Firebase RTDB/Auth domains
  if (
    url.protocol !== 'http:' && 
    url.protocol !== 'https:' || 
    url.hostname.includes('firebaseio.com') || 
    url.hostname.includes('googleapis.com') ||
    url.pathname.includes('/ws') || 
    url.pathname.includes('vite')
  ) {
    return;
  }

  // 1. Navigation / Document requests (HTML Pages) -> Network First with Offline Fallback
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Cache the latest page
          const responseClone = response.clone();
          caches.open(DYNAMIC_CACHE).then((cache) => cache.put(request, responseClone));
          return response;
        })
        .catch(() => {
          // If offline, check Cache first, otherwise serve offline.html
          return caches.match(request).then((cachedResponse) => {
            return cachedResponse || caches.match('/offline.html');
          });
        })
    );
    return;
  }

  // 2. Images -> Stale While Revalidate
  if (isImageRequest(request)) {
    event.respondWith(
      caches.open(IMAGE_CACHE).then((cache) => {
        return cache.match(request).then((cachedResponse) => {
          const fetchPromise = fetch(request).then((networkResponse) => {
            cache.put(request, networkResponse.clone());
            return networkResponse;
          }).catch(() => null); // Silent fail if network is offline

          return cachedResponse || fetchPromise;
        });
      })
    );
    return;
  }

  // 3. Static Assets (JS, CSS, Fonts, Manifest) -> Cache First
  if (isStaticAsset(request) || url.pathname.endsWith('manifest.webmanifest')) {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        if (cachedResponse) {
          // Return cached version, but update in background
          fetch(request).then((networkResponse) => {
            if (networkResponse.status === 200) {
              caches.open(CACHE_NAME).then((cache) => cache.put(request, networkResponse));
            }
          }).catch(() => null);
          return cachedResponse;
        }

        return fetch(request).then((networkResponse) => {
          if (networkResponse.status === 200) {
            const responseClone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, responseClone));
          }
          return networkResponse;
        });
      })
    );
    return;
  }

  // 4. Fallback default (Network First)
  event.respondWith(
    fetch(request)
      .then((networkResponse) => {
        if (networkResponse.status === 200) {
          const responseClone = networkResponse.clone();
          caches.open(DYNAMIC_CACHE).then((cache) => cache.put(request, responseClone));
        }
        return networkResponse;
      })
      .catch(() => caches.match(request))
  );
});

// Push/Notification support placeholder
self.addEventListener('push', (event) => {
  const data = event.data ? event.data.text() : 'WillowWallet Update!';
  event.waitUntil(
    self.registration.showNotification('WillowWallet v2', {
      body: data,
      icon: '/icons/icon-192x192.png',
      badge: '/favicon.svg'
    })
  );
});

// Listen for skipWaiting messages
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
