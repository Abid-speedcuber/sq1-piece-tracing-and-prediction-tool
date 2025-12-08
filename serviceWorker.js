// Service Worker for SQ1 Piece Tracing and Prediction Tool
// Version 1.0.0

const CACHE_NAME = 'sq1-co-tracker-v1.0.0';
const ASSETS_TO_CACHE = [
    '/',
    '/index.html',
    '/styles.css',
    '/manifest.webmanifest',
    
    // JavaScript files
    '/src/draw-scramble.js',
    '/src/train-case.js',
    '/src/scramblegenerator.js',
    '/src/scrambleFormatting.js',
    '/src/scrambleNormalizer.js',
    '/src/variableTable.js',
    '/src/instructions.js',
    '/src/settings.js',
    '/src/case.js',
    '/src/restoftheapp.js',
    '/src/co-tracker-training.js',
    
    // Icons and resources
    '/res/plus.svg',
    '/res/edit.svg',
    '/res/table.svg',
    '/res/settings.svg',
    '/res/instruction.svg',
    '/res/close.svg',
    '/res/delete.svg',
    '/res/undo.svg',
    '/res/redo.svg',
    '/res/save.svg',
    '/res/search.svg',
    '/res/upVar.svg',
    '/res/downVar.svg',
    '/res/white-instruction.svg',
    '/res/eye.svg',
    '/res/trainingSettings.svg'
];

// Install event - cache all assets
self.addEventListener('install', (event) => {
    console.log('[Service Worker] Installing...');
    
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('[Service Worker] Caching app shell');
                return cache.addAll(ASSETS_TO_CACHE);
            })
            .then(() => {
                console.log('[Service Worker] Installation complete');
                return self.skipWaiting(); // Activate immediately
            })
            .catch((error) => {
                console.error('[Service Worker] Installation failed:', error);
            })
    );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
    console.log('[Service Worker] Activating...');
    
    event.waitUntil(
        caches.keys()
            .then((cacheNames) => {
                return Promise.all(
                    cacheNames.map((cacheName) => {
                        if (cacheName !== CACHE_NAME) {
                            console.log('[Service Worker] Deleting old cache:', cacheName);
                            return caches.delete(cacheName);
                        }
                    })
                );
            })
            .then(() => {
                console.log('[Service Worker] Activation complete');
                return self.clients.claim(); // Take control immediately
            })
    );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
    // Skip non-GET requests
    if (event.request.method !== 'GET') {
        return;
    }
    
    // Skip chrome-extension and other non-http(s) requests
    if (!event.request.url.startsWith('http')) {
        return;
    }
    
    event.respondWith(
        caches.match(event.request)
            .then((cachedResponse) => {
                // Return cached version if available
                if (cachedResponse) {
                    console.log('[Service Worker] Serving from cache:', event.request.url);
                    return cachedResponse;
                }
                
                // Otherwise fetch from network
                console.log('[Service Worker] Fetching from network:', event.request.url);
                return fetch(event.request)
                    .then((networkResponse) => {
                        // Don't cache if not a valid response
                        if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
                            return networkResponse;
                        }
                        
                        // Clone the response as it can only be consumed once
                        const responseToCache = networkResponse.clone();
                        
                        // Cache the fetched resource for future use
                        caches.open(CACHE_NAME)
                            .then((cache) => {
                                cache.put(event.request, responseToCache);
                            });
                        
                        return networkResponse;
                    })
                    .catch((error) => {
                        console.error('[Service Worker] Fetch failed:', error);
                        
                        // If it's a navigation request and we're offline, show a custom offline page
                        if (event.request.mode === 'navigate') {
                            return caches.match('/index.html');
                        }
                        
                        throw error;
                    });
            })
    );
});

// Handle messages from the main app
self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
    
    if (event.data && event.data.type === 'CLEAR_CACHE') {
        event.waitUntil(
            caches.keys().then((cacheNames) => {
                return Promise.all(
                    cacheNames.map((cacheName) => {
                        return caches.delete(cacheName);
                    })
                );
            }).then(() => {
                return self.clients.matchAll();
            }).then((clients) => {
                clients.forEach((client) => {
                    client.postMessage({ type: 'CACHE_CLEARED' });
                });
            })
        );
    }
});

// Background sync (if needed in future)
self.addEventListener('sync', (event) => {
    if (event.tag === 'sync-data') {
        event.waitUntil(
            // Perform background sync operations here
            Promise.resolve()
        );
    }
});

// Push notification support (if needed in future)
self.addEventListener('push', (event) => {
    const options = {
        body: event.data ? event.data.text() : 'New notification',
        icon: '/res/icon-192.png',
        badge: '/res/badge-72.png',
        vibrate: [200, 100, 200]
    };
    
    event.waitUntil(
        self.registration.showNotification('SQ1 CO Tracker', options)
    );
});

// Notification click handler
self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    
    event.waitUntil(
        clients.openWindow('/')
    );
});

console.log('[Service Worker] Script loaded');