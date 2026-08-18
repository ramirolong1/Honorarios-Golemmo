// Service worker mínimo: cachea el shell de la app (HTML, manifest, íconos)
// para que el navegador la reconozca como instalable. Los datos (clientes,
// pagos, pendientes) siempre se piden en vivo a la API de Google Apps
// Script — no se cachean, así que la app necesita conexión para funcionar,
// pero se puede "instalar" en el celular u la PC como un ícono aparte.

const CACHE_NAME = 'honorarios-shell-v1';
const SHELL_FILES = [
  './honorarios.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(SHELL_FILES))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  // Solo cachea el shell propio; todo lo demás (la API de Apps Script) va
  // siempre directo a la red para no mostrar datos viejos.
  if (SHELL_FILES.some((f) => url.pathname.endsWith(f.replace('./', '')))) {
    event.respondWith(
      caches.match(event.request).then((cached) => cached || fetch(event.request))
    );
  }
});
