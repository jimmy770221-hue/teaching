// 星星小學堂已搬到 https://littlestar-school.github.io/
// 這個舊網址只剩搬家頁：清掉裝置裡存的舊網站，讓已安裝的 App 打開時直接看到搬家頁。
self.addEventListener('install', function(e){ self.skipWaiting(); });
self.addEventListener('activate', function(e){
  e.waitUntil(caches.keys().then(function(ks){ return Promise.all(ks.filter(function(k){ return k.indexOf('xxt-') === 0 || k === 'xmedia'; }).map(function(k){ return caches.delete(k); })); })
    .then(function(){ return self.clients.claim(); })
    .then(function(){ return self.clients.matchAll({type: 'window'}); })
    .then(function(cs){ cs.forEach(function(c){ if (c.url.indexOf('/teaching/') >= 0 && c.navigate) c.navigate(c.url.split('#')[0]).catch(function(){}); }); }));
});
