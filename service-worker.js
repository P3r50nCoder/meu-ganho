
const CACHE_NAME = "meu-ganho-v1";

const ARQUIVOS = [
    "./",
    "./index.html",
    "./style.css",
    "./script.js",
    "./manifest.json",
    "./icon.png"
];

// Instala e armazena os arquivos
self.addEventListener("install", (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(ARQUIVOS);
        })
    );

    self.skipWaiting();
});

// Ativa o cache
self.addEventListener("activate", (event) => {
    event.waitUntil(
        caches.keys().then((chaves) => {
            return Promise.all(
                chaves
                    .filter((chave) => chave !== CACHE_NAME)
                    .map((chave) => caches.delete(chave))
            );
        })
    );

    self.clients.claim();
});

// Responde usando o cache quando estiver offline
self.addEventListener("fetch", (event) => {
    if (event.request.method !== "GET") return;

    event.respondWith(
        caches.match(event.request).then((arquivoEmCache) => {
            return arquivoEmCache || fetch(event.request);
        })
    );
});
