// next.config.mjs
/** @type {import('next').NextConfig} */
const nextConfig = {
 eslint: {
   ignoreDuringBuilds: true,
 },
 typescript: {
   ignoreBuildErrors: true,
 },
 images: {
   unoptimized: true,
 },
 
 // PWA configuration
 async headers() {
   return [
     {
       source: '/sw.js',
       headers: [
         {
           key: 'Cache-Control',
           value: 'public, max-age=0, must-revalidate',
         },
         {
           key: 'Service-Worker-Allowed',
           value: '/',
         },
       ],
     },
     {
       source: '/firebase-messaging-sw.js',
       headers: [
         {
           key: 'Cache-Control',
           value: 'public, max-age=0, must-revalidate',
         },
         {
           key: 'Service-Worker-Allowed',
           value: '/',
         },
       ],
     },
     {
       source: '/manifest.json',
       headers: [
         {
           key: 'Cache-Control',
           value: 'public, max-age=31536000, immutable',
         },
       ],
     },
   ];
 },
 
 // Enable service worker registration
 async rewrites() {
   return [
     {
       source: '/sw.js',
       destination: '/sw.js',
     },
     // Nova regra para o SW do Firebase
     {
       source: '/firebase-messaging-sw.js',
       destination: '/firebase-messaging-sw.js',
     },
   ];
 },
}

export default nextConfig