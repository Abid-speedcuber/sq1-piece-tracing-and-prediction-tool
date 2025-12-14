const CACHE_NAME = 'oblp v-1.2.1';
const ASSETS_TO_CACHE = [
    '/',
    '/index.html',
    '/styles.css',
    '/manifest.webmanifest',
    
    // JavaScript files
    '/src/case.js',
    '/src/caseSelector.js',
    '/src/co-tracker-training.js',
    '/src/draw-scramble.js',
    '/src/instructions.js',
    '/src/memoMarathon.js',
    '/src/restoftheapp.js',
    '/src/scrambleFormatting.js',
    '/src/scramblegenerator.js',
    '/src/scrambleNormalizer.js',
    '/src/settings.js',
    '/src/train-case.js',
    '/src/variableTable.js',
    
    // Icons and resources
    '/res/abid.svg',
    '/res/close.svg',
    '/res/delete.svg',
    '/res/downVar.svg',
    '/res/edit.svg',
    '/res/eye.svg',
    '/res/instruction.svg',
    '/res/plus.svg',
    '/res/redo.svg',
    '/res/save.svg',
    '/res/search.svg',
    '/res/settings-home.svg',
    '/res/settings-memo.svg',
    '/res/settings-overall.svg',
    '/res/settings-training.svg',
    '/res/settings.svg',
    '/res/sidebar.svg',
    '/res/table.svg',
    '/res/training.svg',
    '/res/trainingSettings.svg',
    '/res/undo.svg',
    '/res/upVar.svg',
    '/res/white-instruction.svg',
];

// Install event - cache all assets
self.addEventListener('install', (event) => {
    
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                return cache.addAll(ASSETS_TO_CACHE);
            })
            .then(() => {
                return self.skipWaiting(); // Activate immediately
            })
            .catch((error) => {
                console.error('[Service Worker] Installation failed:', error);
            })
    );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
    
    event.waitUntil(
        caches.keys()
            .then((cacheNames) => {
                return Promise.all(
                    cacheNames.map((cacheName) => {
                        if (cacheName !== CACHE_NAME) {
                            return caches.delete(cacheName);
                        }
                    })
                );
            })
            .then(() => {
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
                    return cachedResponse;
                }
                
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