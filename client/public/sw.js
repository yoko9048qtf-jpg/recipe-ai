// 最小構成の Service Worker。
// インストール可能(PWA)にするため fetch ハンドラを持ち、
// ネットワーク優先＋失敗時キャッシュで簡易オフライン耐性を提供する。
const CACHE = "recipe-maker-v1";

self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      // 古いキャッシュを掃除
      const keys = await caches.keys();
      await Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)));
      await self.clients.claim();
    })()
  );
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  // GET のみ・同一オリジンのみ対象（API やクロスオリジンはそのまま通す）
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;
  if (url.pathname.startsWith("/api/")) return;

  event.respondWith(
    fetch(req)
      .then((res) => {
        const copy = res.clone();
        caches.open(CACHE).then((c) => c.put(req, copy)).catch(() => {});
        return res;
      })
      .catch(() => caches.match(req).then((c) => c || Promise.reject(new Error("offline"))))
  );
});
