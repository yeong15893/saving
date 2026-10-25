// 离线缓存：先试网络（有网时拿到最新版），失败就用缓存，所以没网也能打开记账
var CACHE='ledger-shell-v2';
var SHELL=['./','index.html','manifest.webmanifest','icon-192.png','icon-512.png'];
self.addEventListener('install',function(e){
  e.waitUntil(caches.open(CACHE).then(function(c){return c.addAll(SHELL)}).then(function(){return self.skipWaiting()}));
});
self.addEventListener('activate',function(e){
  e.waitUntil(caches.keys().then(function(ks){return Promise.all(ks.filter(function(k){return k!==CACHE}).map(function(k){return caches.delete(k)}))}).then(function(){return self.clients.claim()}));
});
self.addEventListener('fetch',function(e){
  var r=e.request,u=new URL(r.url);
  if(r.method!=='GET'||u.origin!==location.origin)return;
  e.respondWith(fetch(r,{cache:'no-cache'}).then(function(res){
    var copy=res.clone();caches.open(CACHE).then(function(c){c.put(r,copy)});return res;
  }).catch(function(){
    return caches.match(r).then(function(m){return m||caches.match('index.html')});
  }));
});
