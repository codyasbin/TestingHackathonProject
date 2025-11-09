// next.config.mjs
import nextPWA from 'next-pwa';

const runtimeCaching = [
  {
    // Handle all navigations (pages)
    urlPattern: ({ request }) => request.mode === 'navigate',
    handler: 'NetworkFirst',
    options: {
      cacheName: 'pages-cache',
      networkTimeoutSeconds: 10,
      expiration: { maxEntries: 50, maxAgeSeconds: 7 * 24 * 60 * 60 },
    },
  },
  {
    // API requests
    urlPattern: /^https?:\/\/.*\/api\/.*$/i,
    handler: 'NetworkFirst',
    options: {
      cacheName: 'api-cache',
      networkTimeoutSeconds: 10,
      expiration: { maxEntries: 100, maxAgeSeconds: 24 * 60 * 60 },
      cacheableResponse: { statuses: [0, 200] },
    },
  },
  {
    // JS, CSS, JSON files
    urlPattern: /\.(?:js|css|json)$/i,
    handler: 'StaleWhileRevalidate',
    options: {
      cacheName: 'static-resources',
      expiration: { maxEntries: 100, maxAgeSeconds: 30 * 24 * 60 * 60 },
    },
  },
  {
    // Images (including Unsplash)
    urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp|avif|ico)$/i,
    handler: 'CacheFirst',
    options: {
      cacheName: 'image-cache',
      expiration: { maxEntries: 200, maxAgeSeconds: 60 * 24 * 60 * 60 },
    },
  },
  {
    // Unsplash images specifically
    urlPattern: /^https:\/\/images\.unsplash\.com\/.*/i,
    handler: 'CacheFirst',
    options: {
      cacheName: 'unsplash-image-cache',
      expiration: { maxEntries: 100, maxAgeSeconds: 30 * 24 * 60 * 60 },
      cacheableResponse: { statuses: [0, 200] },
    },
  },
];

// Create the PWA plugin with options
const withPWA = nextPWA({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',
  buildExcludes: [/middleware-manifest\.json$/],
  runtimeCaching,
  fallbacks: {
    document: '/offline.html',
    image: '/icons/icon-192.png',
  },
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "unsplash.com",
        port: "",
        pathname: "/**",
      },
    ],
  },
};

// Export final config with PWA plugin applied
export default withPWA(nextConfig);