// Service worker del escáner: permite instalarlo como app y recibir notificaciones con la app cerrada.
importScripts('firebase-config.js');
if (self.FIREBASE_CONFIG && self.FIREBASE_CONFIG.apiKey) {
  importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js',
                'https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-compat.js');
  firebase.initializeApp(self.FIREBASE_CONFIG);
  firebase.messaging().onBackgroundMessage(p => {
    const d = p.data || {};
    if (self.navigator.setAppBadge && d.pendientes) self.navigator.setAppBadge(Number(d.pendientes)).catch(() => {});
    return self.registration.showNotification(d.title || 'clicOH Escáner', {
      body: d.body || '', icon: 'icon-192.png', badge: 'icon-192.png', tag: d.tag || 'clicoh', renotify: true,
      vibrate: [300, 150, 300, 150, 300], data: { url: d.url || './' }
    });
  });
}
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', e => e.waitUntil(self.clients.claim()));
self.addEventListener('notificationclick', e => {
  e.notification.close();
  e.waitUntil(self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(lista => {
    for (const c of lista) { if ('focus' in c) { c.postMessage('recargarAlertas'); return c.focus(); } }
    return self.clients.openWindow((e.notification.data && e.notification.data.url) || './');
  }));
});
self.addEventListener('fetch', () => {});
