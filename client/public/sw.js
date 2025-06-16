const CACHE_NAME = 'transitaccess-v1';
const urlsToCache = [
  '/',
  '/src/main.tsx',
  '/src/index.css',
  'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Return cached version or fetch from network
        return response || fetch(event.request);
      }
    )
  );
});

// Handle background sync for offline functionality
self.addEventListener('sync', event => {
  if (event.tag === 'validation-sync') {
    event.waitUntil(syncValidationEvents());
  }
  if (event.tag === 'feedback-sync') {
    event.waitUntil(syncFeedback());
  }
});

async function syncValidationEvents() {
  // Sync pending validation events when back online
  try {
    const pendingEvents = await getStoredPendingEvents();
    for (const event of pendingEvents) {
      await fetch('/api/validation-events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(event)
      });
    }
    await clearPendingEvents();
  } catch (error) {
    console.error('Sync validation events failed:', error);
  }
}

async function syncFeedback() {
  // Sync pending feedback when back online
  try {
    const pendingFeedback = await getStoredPendingFeedback();
    for (const feedback of pendingFeedback) {
      await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(feedback)
      });
    }
    await clearPendingFeedback();
  } catch (error) {
    console.error('Sync feedback failed:', error);
  }
}

// Helper functions would be implemented to manage IndexedDB storage
async function getStoredPendingEvents() { return []; }
async function clearPendingEvents() { }
async function getStoredPendingFeedback() { return []; }
async function clearPendingFeedback() { }
