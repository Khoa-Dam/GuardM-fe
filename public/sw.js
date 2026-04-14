// GuardM Service Worker — Push Notifications
const CACHE_NAME = 'guardm-v1';

self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', e => e.waitUntil(self.clients.claim()));

self.addEventListener('push', event => {
    if (!event.data) return;

    let data = {};
    try { data = event.data.json(); } catch { data = { title: 'GuardM Alert', body: event.data.text() }; }

    const { title = '🚨 GuardM Alert', body = '', icon = '/icons/icon-192x192.png', badge = '/icons/badge-72x72.png', tag = 'guardm', data: notifData = {} } = data;

    event.waitUntil(
        self.registration.showNotification(title, {
            body,
            icon,
            badge,
            tag,
            renotify: true,
            requireInteraction: notifData.severity === 'high',
            data: notifData,
            vibrate: notifData.severity === 'high' ? [200, 100, 200, 100, 200] : [200],
            actions: [
                { action: 'view', title: 'Xem trên bản đồ' },
                { action: 'dismiss', title: 'Bỏ qua' },
            ],
        })
    );
});

self.addEventListener('notificationclick', event => {
    event.notification.close();
    if (event.action === 'dismiss') return;

    const reportId = event.notification.data?.reportId;
    const url = reportId ? `/map?focus=${reportId}` : '/map';

    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then(clientList => {
            for (const client of clientList) {
                if (client.url.includes(self.location.origin) && 'focus' in client) {
                    client.navigate(url);
                    return client.focus();
                }
            }
            return clients.openWindow(url);
        })
    );
});
