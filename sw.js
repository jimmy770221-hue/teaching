// 星星小學堂：離線使用。第一次打開會把整個程式存進裝置；之後打開都用裝置裡的版本（沒網路也能開），
// 有網路時在背景下載新版，下次打開就是新版。
const CACHE = 'xxt-34837858f9';
const CORE = ['index.html', 'kai.woff2', 'manifest.webmanifest', 'icon-192.png', 'icon-512.png', 'icon-maskable-512.png', 'apple-touch-icon.png'];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => Promise.all(CORE.map(u => fetch(new Request(u, {cache: 'reload'})).then(r => { if (!r.ok) throw new Error(u); return c.put(u, r); })))).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k.startsWith('xxt-') && k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
function offlinePage(){
  return new Response('<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>星星小學堂</title><body style="font-family:sans-serif;padding:32px;line-height:1.7"><h2>還沒下載完成</h2><p>第一次使用需要連上網路，等畫面右下角出現「✓ 已可離線使用」之後，就可以不用網路打開了。</p></body>', {headers: {'Content-Type': 'text/html; charset=utf-8'}});
}
self.addEventListener('fetch', e => {
  const r = e.request; if (r.method !== 'GET') return;
  const url = new URL(r.url);
  if (url.origin === location.origin && /\/sw\.js$/.test(url.pathname)) return;   // 版本檢查一律走網路
  if (r.mode === 'navigate' || (url.origin === location.origin && /\/(index\.html)?$/.test(url.pathname))) {
    e.respondWith(caches.open(CACHE).then(async c => {
      const hit = await c.match('index.html');
      const net = fetch(new Request('index.html', {cache: 'no-cache'})).then(res => { if (res.ok) c.put('index.html', res.clone()); return res; });
      if (hit) { e.waitUntil(net.catch(() => {})); return hit; }
      return net.catch(() => offlinePage());
    }));
    return;
  }
  e.respondWith(caches.open(CACHE).then(async c => {
    const hit = await c.match(r, {ignoreSearch: url.origin === location.origin});
    const net = fetch(r).then(res => { if (res && (res.ok || res.type === 'opaque')) c.put(r, res.clone()); return res; });
    if (hit) { e.waitUntil(net.catch(() => {})); return hit; }
    return net.catch(() => new Response('', {status: 504}));
  }));
});
