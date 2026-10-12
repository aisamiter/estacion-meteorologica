// Service worker de la Estacion Meteorologica.
// Objetivo: que la pantalla siga mostrando algo util si se cae el WiFi o GitHub Pages.
// Estrategias:
//   - Shell (HTML, iconos, mascotas): network-first, cae a cache.
//   - APIs de clima y calidad del aire: network-first; si falla, devuelve el ultimo dato
//     con el header X-SW-Cached-At para que la pagina sepa que es viejo.
//   - Satelite: network-first, ignorando el ?t= de cache-busting.
//   - Fotos: cache-first con tope de entradas (pesan mucho).
//   - Fuentes de Google: stale-while-revalidate.
var VERSION = 'v1';
var SHELL_CACHE = 'estacion-shell-' + VERSION;
var DATA_CACHE = 'estacion-data-' + VERSION;
var PHOTO_CACHE = 'estacion-photos-' + VERSION;
var FONT_CACHE = 'estacion-fonts-' + VERSION;
var ALL_CACHES = [SHELL_CACHE, DATA_CACHE, PHOTO_CACHE, FONT_CACHE];
var MAX_PHOTOS = 30;

var SHELL_URLS = [
  './',
  'index.html',
  'manifest.json',
  'favicon.svg',
  'icon-192.png',
  'icon-512.png',
  'photos.json'
];

self.addEventListener('install', function (event) {
  event.waitUntil(
    caches.open(SHELL_CACHE).then(function (cache) {
      // addAll falla entero si un recurso falla; los agregamos de a uno para tolerar faltantes.
      return Promise.all(SHELL_URLS.map(function (u) {
        return cache.add(u).catch(function () { /* se cachea en la primera visita online */ });
      }));
    }).then(function () { return self.skipWaiting(); })
  );
});

self.addEventListener('activate', function (event) {
  event.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(keys
        .filter(function (k) { return k.indexOf('estacion-') === 0 && ALL_CACHES.indexOf(k) === -1; })
        .map(function (k) { return caches.delete(k); }));
    }).then(function () { return self.clients.claim(); })
  );
});

function isCacheable(res) {
  return res && (res.ok || res.type === 'opaque');
}

// Copia la respuesta cacheada agregando cuando se guardo, para que la pagina detecte datos viejos.
function withCachedAt(res, cachedAt) {
  var headers = new Headers(res.headers);
  headers.set('X-SW-Cached-At', String(cachedAt));
  return res.blob().then(function (body) {
    return new Response(body, { status: res.status, statusText: res.statusText, headers: headers });
  });
}

function networkFirst(request, cacheName, opts) {
  opts = opts || {};
  var cacheKey = opts.ignoreSearch ? new Request(new URL(request.url).origin + new URL(request.url).pathname) : request;
  return fetch(request).then(function (res) {
    if (isCacheable(res)) {
      var copy = res.clone();
      caches.open(cacheName).then(function (c) {
        if (opts.stamp) {
          withCachedAt(copy, Date.now()).then(function (stamped) { c.put(cacheKey, stamped); });
        } else {
          c.put(cacheKey, copy);
        }
      });
    }
    return res;
  }).catch(function () {
    return caches.open(cacheName).then(function (c) {
      return c.match(cacheKey).then(function (hit) {
        if (hit) return hit;
        return Response.error();
      });
    });
  });
}

function cacheFirst(request, cacheName, maxEntries) {
  return caches.open(cacheName).then(function (cache) {
    return cache.match(request).then(function (hit) {
      if (hit) return hit;
      return fetch(request).then(function (res) {
        if (isCacheable(res)) {
          cache.put(request, res.clone()).then(function () { return trim(cache, maxEntries); });
        }
        return res;
      });
    });
  });
}

function staleWhileRevalidate(request, cacheName) {
  return caches.open(cacheName).then(function (cache) {
    return cache.match(request).then(function (hit) {
      var refresh = fetch(request).then(function (res) {
        if (isCacheable(res)) cache.put(request, res.clone());
        return res;
      }).catch(function () { return hit || Response.error(); });
      return hit || refresh;
    });
  });
}

function trim(cache, maxEntries) {
  if (!maxEntries) return;
  return cache.keys().then(function (keys) {
    var extra = keys.length - maxEntries;
    if (extra <= 0) return;
    return Promise.all(keys.slice(0, extra).map(function (k) { return cache.delete(k); }));
  });
}

self.addEventListener('fetch', function (event) {
  var request = event.request;
  if (request.method !== 'GET') return;
  var url = new URL(request.url);

  // Datos de clima / aire: network-first con marca de antiguedad al caer a cache.
  if (url.hostname === 'api.open-meteo.com' || url.hostname === 'air-quality-api.open-meteo.com') {
    event.respondWith(networkFirst(request, DATA_CACHE, { stamp: true }));
    return;
  }

  // Satelite y radar: ignorar el ?t= para poder reusar la ultima imagen.
  if (url.hostname === 'cdn.star.nesdis.noaa.gov' ||
      url.hostname === 'basemaps.cartocdn.com' ||
      url.hostname.indexOf('rainviewer.com') !== -1) {
    event.respondWith(networkFirst(request, DATA_CACHE, { ignoreSearch: true }));
    return;
  }

  // Fuentes.
  if (url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com') {
    event.respondWith(staleWhileRevalidate(request, FONT_CACHE));
    return;
  }

  if (url.origin !== self.location.origin) return;

  // Fotos: pesadas, cache-first con tope.
  if (url.pathname.indexOf('/photos/') !== -1) {
    event.respondWith(cacheFirst(request, PHOTO_CACHE, MAX_PHOTOS));
    return;
  }

  // photos.json lleva ?t= para esquivar el cache HTTP: normalizar la clave.
  if (url.pathname.slice(-11) === 'photos.json') {
    event.respondWith(networkFirst(request, SHELL_CACHE, { ignoreSearch: true }));
    return;
  }

  // Navegacion: las URLs llevan ?perf=low&face=hp, asi que el fallback ignora el query string.
  if (request.mode === 'navigate') {
    event.respondWith(fetch(request).then(function (res) {
      if (isCacheable(res)) {
        var copy = res.clone();
        caches.open(SHELL_CACHE).then(function (c) { c.put('index.html', copy); });
      }
      return res;
    }).catch(function () {
      return caches.open(SHELL_CACHE).then(function (c) { return c.match('index.html'); })
        .then(function (hit) { return hit || Response.error(); });
    }));
    return;
  }

  // Resto del shell (HTML, mascotas, iconos): network-first para que los deploys se vean enseguida.
  event.respondWith(networkFirst(request, SHELL_CACHE));
});
