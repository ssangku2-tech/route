// 버전 올리면 캐시 갱신
const VERSION = "v5";
const CACHE = "myroute-" + VERSION;
const ASSETS = [
  "./index.html",
  "./manifest.json",
  "./icon-192.png",
  "./icon-512.png",
];

self.addEventListener("install", (e) => {
  self.skipWaiting();
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(ASSETS).catch(() => {})));
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (e) => {
  const url = new URL(e.request.url);
  // API 호출(프록시)은 항상 네트워크 — 실시간 정보
  if (url.pathname.includes("/route") || url.pathname.includes("/search") || url.hostname.includes("workers.dev")) {
    return; // 기본 네트워크
  }
  // 앱 셸은 캐시 우선
  e.respondWith(
    caches.match(e.request).then((r) => r || fetch(e.request))
  );
});
