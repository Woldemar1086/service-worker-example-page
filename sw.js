const APPCACHE = 'APPCACHE';

const currentCaches = [APPCACHE];

const OFFLINE_PAGE = '/offline-page.html'

var CACHE_SRC = [
    '/index.html',
    '/restaurant.html',
    '/img/1.jpg',
    '/img/2.jpg',
    '/img/3.jpg',
    '/img/4.jpg',
    '/img/5.jpg',
    '/img/6.jpg',
    '/img/7.jpg',
    '/img/8.jpg',
    '/img/9.jpg',
    '/img/10.jpg',
    '/css/styles.css',
    '/data/restaurants.json',
    '/js/dbhelper.js',
    '/js/main.js',
    '/js/restaurant_info.js'
];

function deleteOldCache(cachesToDelete) {
    return Promise.all(cachesToDelete.map(function(cacheDelete) {
        return caches.delete(cacheDelete);
    }));
}

function findNotIncludedCache(cacheNames) {
    return cacheNames.filter(function(cacheName) {
        return !currentCaches.includes(cacheName);
    });
}

function addSrcToCache(cache) {
    return cache.addAll(CACHE_SRC);
}

function createCacheBustedRequest(url) {
    let request = new Request(url, { cache: 'reload' });

    if ('cache' in request) {
        return request;
    }

    let bustedUrl = new URL(url, self.location.href);
    bustedUrl.search += (bustedUrl.search ? '&' : '') + 'cachebust=' + Date.now();

    return new Request(bustedUrl);
}

function offlinePage() {
    console.log('offline page was cached')
    fetch(createCacheBustedRequest(OFFLINE_PAGE)).then(function(response) {
        return caches.open(APPCACHE).then(function(cache) {
            return cache.put(OFFLINE_PAGE, response);
        });
    })
}



self.addEventListener('install', function(event) {
    event.waitUntil(
        caches.open(APPCACHE)
        .then(addSrcToCache)
        .then(offlinePage)
        .then(self.skipWaiting())
    );
});

// The activate handler takes care of cleaning up old caches.
self.addEventListener('activate', function(event) {
    event.waitUntil(
        caches.keys()
        .then(findNotIncludedCache)
        .then(deleteOldCache)
        .then(function() {
            self.clients.claim();
        })
    );
});

self.addEventListener('fetch', function(event) {
    var requestFetch, responseForCache;

    // Do not cache other sources
    if (event.request.url.indexOf(self.location.origin) > -1) {

        event.respondWith(
            caches.match(event.request)
            .then(function(response) {
                if (response) {
                    return response;
                }

                requestFetch = event.request.clone();

                return fetch(event.request).then(function(response) {

                        if (!response || response.status !== 200 || response.type !== 'basic') {
                            return response
                        }

                        responseForCache = response.clone();

                        caches.open(APPCACHE)
                            .then(function(cache) {
                                cache.put(event.request, responseToCache);
                                console.log(`Responese was added to cache`);
                            });

                        return response;
                    })
                    .catch(function(e) {
                        return caches.match(createCacheBustedRequest(OFFLINE_PAGE));
                    })
            })
        );
    }
});