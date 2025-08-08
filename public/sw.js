// Unmask Service Worker - GenZ Optimized
const CACHE_NAME = 'unmask-v1.0.0';
const OFFLINE_URL = '/offline';

// Assets to cache immediately
const PRECACHE_ASSETS = [
  '/',
  '/offline',
  '/manifest.json',
  // Core CSS and JS will be added automatically by Next.js
];

// API endpoints to cache
const CACHE_API_ENDPOINTS = [
  '/api/waitlist',
  '/api/waitlist/stats',
];

// Cache strategies
const CACHE_STRATEGIES = {
  // Static assets: Cache first with network fallback
  STATIC: 'static',
  // API calls: Network first with cache fallback  
  API: 'api',
  // Images: Cache first with network fallback
  IMAGES: 'images',
  // HTML pages: Network first with cache fallback
  PAGES: 'pages'
};

// Install event - precache essential assets
self.addEventListener('install', (event) => {
  console.log('🎭 Unmask Service Worker installing...');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('📦 Precaching assets...');
        return cache.addAll(PRECACHE_ASSETS);
      })
      .then(() => {
        // Skip waiting to activate immediately
        return self.skipWaiting();
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('✨ Unmask Service Worker activated!');
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('🗑️ Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      // Claim all clients immediately
      return self.clients.claim();
    })
  );
});

// Fetch event - implement caching strategies
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Skip non-GET requests
  if (request.method !== 'GET') return;
  
  // Skip cross-origin requests (except for known CDNs)
  if (!url.origin.includes('unmask.life') && 
      !url.origin.includes('localhost') &&
      !url.origin.includes('vercel.app') &&
      !isTrustedCDN(url.origin)) {
    return;
  }

  event.respondWith(
    handleRequest(request)
  );
});

// Main request handler with GenZ-optimized caching
async function handleRequest(request) {
  const url = new URL(request.url);
  const pathname = url.pathname;
  
  try {
    // Determine cache strategy based on request type
    if (isAPIRequest(pathname)) {
      return await handleAPIRequest(request);
    } else if (isImageRequest(pathname)) {
      return await handleImageRequest(request);
    } else if (isStaticAsset(pathname)) {
      return await handleStaticRequest(request);
    } else {
      return await handlePageRequest(request);
    }
  } catch (error) {
    console.error('❌ Service Worker error:', error);
    return await handleFallback(request);
  }
}

// API requests: Network first with cache fallback
async function handleAPIRequest(request) {
  const cache = await caches.open(CACHE_NAME);
  
  try {
    // Try network first for fresh data
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      // Cache successful responses
      cache.put(request, networkResponse.clone());
      return networkResponse;
    }
    
    // If network fails, try cache
    const cachedResponse = await cache.match(request);
    return cachedResponse || createOfflineResponse('API temporarily unavailable 💔');
    
  } catch (error) {
    // Network error, try cache
    const cachedResponse = await cache.match(request);
    return cachedResponse || createOfflineResponse('You\'re offline, but we still love you! 💜');
  }
}

// Image requests: Cache first with network fallback
async function handleImageRequest(request) {
  const cache = await caches.open(CACHE_NAME);
  
  // Try cache first for images
  const cachedResponse = await cache.match(request);
  if (cachedResponse) {
    return cachedResponse;
  }
  
  try {
    // If not in cache, fetch from network
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
      return networkResponse;
    }
    
    return createImageFallback();
  } catch (error) {
    return createImageFallback();
  }
}

// Static assets: Cache first with network fallback
async function handleStaticRequest(request) {
  const cache = await caches.open(CACHE_NAME);
  
  const cachedResponse = await cache.match(request);
  if (cachedResponse) {
    return cachedResponse;
  }
  
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    return createOfflineResponse('Asset unavailable offline');
  }
}

// Page requests: Network first with cache fallback
async function handlePageRequest(request) {
  const cache = await caches.open(CACHE_NAME);
  
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
      return networkResponse;
    }
    
    // If network fails, try cache
    const cachedResponse = await cache.match(request);
    return cachedResponse || await cache.match(OFFLINE_URL);
    
  } catch (error) {
    // Network error, try cache
    const cachedResponse = await cache.match(request);
    return cachedResponse || await cache.match(OFFLINE_URL);
  }
}

// Fallback handler
async function handleFallback(request) {
  const cache = await caches.open(CACHE_NAME);
  
  if (isImageRequest(request.url)) {
    return createImageFallback();
  }
  
  return await cache.match(OFFLINE_URL) || createOfflineResponse('Something went wrong 😔');
}

// Helper functions
function isAPIRequest(pathname) {
  return pathname.startsWith('/api/');
}

function isImageRequest(pathname) {
  return /\.(jpg|jpeg|png|gif|webp|avif|svg)$/i.test(pathname);
}

function isStaticAsset(pathname) {
  return /\.(css|js|woff|woff2|eot|ttf|otf)$/i.test(pathname) || 
         pathname.startsWith('/_next/');
}

function isTrustedCDN(origin) {
  const trustedCDNs = [
    'fonts.googleapis.com',
    'fonts.gstatic.com',
    'unpkg.com',
    'cdn.jsdelivr.net'
  ];
  return trustedCDNs.some(cdn => origin.includes(cdn));
}

function createOfflineResponse(message) {
  return new Response(JSON.stringify({
    error: 'offline',
    message: message,
    timestamp: new Date().toISOString()
  }), {
    status: 503,
    statusText: 'Service Unavailable',
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-cache'
    }
  });
}

function createImageFallback() {
  // Return a minimal SVG placeholder
  const svg = `
    <svg width="400" height="300" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#FF6B9D;stop-opacity:0.3" />
          <stop offset="100%" style="stop-color:#4ECDC4;stop-opacity:0.3" />
        </linearGradient>
      </defs>
      <rect width="100%" height="100%" fill="url(#grad)"/>
      <text x="50%" y="50%" font-family="Arial, sans-serif" font-size="16" 
            fill="rgba(255,255,255,0.7)" text-anchor="middle" dy=".3em">
        🎭 Image offline
      </text>
    </svg>
  `;
  
  return new Response(svg, {
    status: 200,
    headers: {
      'Content-Type': 'image/svg+xml',
      'Cache-Control': 'max-age=86400'
    }
  });
}

// Background sync for waitlist submissions
self.addEventListener('sync', (event) => {
  if (event.tag === 'waitlist-submission') {
    event.waitUntil(syncWaitlistSubmissions());
  }
});

async function syncWaitlistSubmissions() {
  // Get pending submissions from IndexedDB
  // This would integrate with a more complex offline storage system
  console.log('🔄 Syncing waitlist submissions...');
}

// Push notification handling
self.addEventListener('push', (event) => {
  const options = {
    body: 'Unmask updates are here! 🎉',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/badge.png',
    vibrate: [200, 100, 200],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: '1'
    },
    actions: [
      {
        action: 'explore',
        title: 'Check it out! ✨',
        icon: '/icons/action-explore.png'
      },
      {
        action: 'close',
        title: 'Close',
        icon: '/icons/action-close.png'
      }
    ],
    tag: 'unmask-update'
  };

  const title = 'Unmask 🎭';
  
  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

// Notification click handling
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

console.log('🎭 Unmask Service Worker loaded and ready!');