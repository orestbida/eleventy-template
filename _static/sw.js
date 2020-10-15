var cacheName = 'hello_v1_cache';
var OFFLINE_URL = "/offline/";
var cacheFiles = [
	"/offline/",
	"/public/assets/fonts/OpenSans-Bold.woff2",
	"/public/assets/fonts/OpenSans-Regular.woff2"
];

self.addEventListener('install', function (e) {
	e.waitUntil(caches.open(cacheName).then(function (cache) {
		return cache.addAll(cacheFiles);
	}));
});

self.addEventListener('activate', function (e) {
	e.waitUntil(caches.keys().then(function (cacheNames) {
		return Promise.all(cacheNames.map(function (thisCacheName) {
			if (thisCacheName !== cacheName) {
				return caches.delete(thisCacheName);
			}
		}));
	}));
});

self.addEventListener('fetch', function (event) {
	if (event.request.mode === 'navigate') {
		return event.respondWith(fetch(event.request).catch(() => caches.match(OFFLINE_URL)));
	} else {
		event.respondWith(async function () {
			const cachedResponse = await caches.match(event.request);
			if (cachedResponse) return cachedResponse;
			return fetch(event.request);
		}());
	}
});