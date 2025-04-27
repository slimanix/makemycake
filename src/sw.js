// Service Worker for Push Notifications
console.log('Service Worker loaded');

// Install event handler
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Installing Service Worker...', event);
  self.skipWaiting(); // Ensures the service worker activates immediately
});

// Activate event handler
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activating Service Worker...', event);
  return self.clients.claim(); // Take control of all clients
});

// Push event handler
self.addEventListener('push', (event) => {
  console.log('[Service Worker] Push Received:', event);

  // Try to parse the data
  let notificationData;
  try {
    // First try to get JSON data
    notificationData = event.data && event.data.json();
    console.log('[Service Worker] Push data (JSON):', notificationData);
  } catch (e) {
    // If not JSON, try to get text data
    try {
      const text = event.data && event.data.text();
      console.log('[Service Worker] Push data (text):', text);
      try {
        notificationData = JSON.parse(text);
      } catch (e2) {
        // Default fallback if parsing fails
        notificationData = {
          title: 'Nouvelle commande',
          body: text || 'Vous avez reçu une nouvelle commande',
          data: { url: '/patissier/commandes' }
        };
      }
    } catch (e3) {
      // Ultimate fallback
      notificationData = {
        title: 'Nouvelle commande',
        body: 'Vous avez reçu une nouvelle commande',
        data: { url: '/patissier/commandes' }
      };
    }
  }

  // Default notification options
  const options = {
    body: notificationData.body || 'Vous avez reçu une nouvelle commande',
    icon: '/logo.png',
    badge: '/logo.png',
    vibrate: [200, 100, 200],
    data: notificationData.data || { url: '/patissier/commandes' },
    requireInteraction: true,
    actions: [
      { action: 'view', title: 'Voir' },
      { action: 'close', title: 'Fermer' }
    ]
  };

  // Ensure we have a title
  const title = notificationData.title || 'Notification de Make My Cake';

  // This is critical: must use waitUntil to keep the service worker active
  // until the notification is shown
  const promiseChain = self.registration.showNotification(title, options);
  event.waitUntil(promiseChain);
});

// Notification click event handler
self.addEventListener('notificationclick', (event) => {
  console.log('[Service Worker] Notification click received:', event);

  // Close the notification
  event.notification.close();

  // Get the URL from notification data, or use default
  const urlToOpen = (event.notification.data && event.notification.data.url)
    || '/patissier/commandes';

  console.log('[Service Worker] Opening URL:', urlToOpen);

  // Look for existing windows and focus one if found
  const promiseChain = clients.matchAll({
    type: 'window',
    includeUncontrolled: true
  })
  .then((windowClients) => {
    // Check if there is already a window/tab open with the target URL
    for (let i = 0; i < windowClients.length; i++) {
      const client = windowClients[i];
      console.log('[Service Worker] Checking client:', client.url);

      // If so, just focus it
      if (client.url.includes(urlToOpen) && 'focus' in client) {
        console.log('[Service Worker] Focusing existing client');
        return client.focus();
      }
    }

    // If not, open a new window/tab
    if (clients.openWindow) {
      console.log('[Service Worker] Opening new window');
      return clients.openWindow(urlToOpen);
    }
  });

  event.waitUntil(promiseChain);
});

// Notification close event handler
self.addEventListener('notificationclose', (event) => {
  console.log('[Service Worker] Notification closed', event);
}); 