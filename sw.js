var C='komdir-v9',F=['./','index.html','manifest.webmanifest','icon-192.png','icon-512.png','apple-touch-icon.png'];
// install: precache, but never block activation on failures
self.addEventListener('install',function(e){
  e.waitUntil(caches.open(C).then(function(c){return c.addAll(F)}).catch(function(){}));
  self.skipWaiting();
});
self.addEventListener('activate',function(e){
  e.waitUntil(
    caches.keys().then(function(k){
      return Promise.all(k.filter(function(x){return x!==C}).map(function(x){return caches.delete(x)}));
    }).then(function(){return self.clients.claim()})
  );
});
// HTML: network first (always fresh when online), cache only as offline fallback.
// Static files: cache first.
self.addEventListener('fetch',function(e){
  var r=e.request;
  if(r.method!=='GET')return;
  if(r.mode==='navigate'){
    e.respondWith(
      fetch(r,{cache:'no-store'}).then(function(res){
        if(res&&res.ok){var cp=res.clone();caches.open(C).then(function(c){c.put('index.html',cp)})}
        return res;
      }).catch(function(){
        return caches.match('index.html').then(function(x){return x||caches.match('./')});
      })
    );
    return;
  }
  e.respondWith(caches.match(r).then(function(x){
    return x||fetch(r).then(function(res){
      if(res&&res.ok){var cp=res.clone();caches.open(C).then(function(c){c.put(r,cp)})}
      return res;
    });
  }));
});
self.addEventListener('message',function(e){if(e.data==='skip')self.skipWaiting()});
