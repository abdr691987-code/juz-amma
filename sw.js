// Stores the app itself. The recitation is saved separately by storage.js and never passes through here.
const CACHE_PREFIX = 'juz-amma-app-';
const CACHE_NAME = 'juz-amma-app-273cfbe8';
const SHELL_FILES = [['./app.css', 'b76bec88078305a2a07eba975ddca7697ee6f16698e57ab1bedf0aa10313f818'], ['./data.json', '92e3936705dff3c5402fbcad1b64ea5f768dd4e6faee50e771e7788580a79d96'], ['./fonts/Amiri-Regular.ttf', 'ab391c4147d054c48976e98322ad0eefe1427aa0e0502a12a4c75d80a70cfcd7'], ['./fonts/ArefRuqaa-Regular.ttf', 'ceb786d83ba92f35e96efcd8623c2858d288e0c543c8761ba35b1020989464f9'], ['./fonts/UthmanicHafs1Ver18.woff2', '8c00e7a7d5f773bcfb1642fdcfba505dbd81975fef39f14718827a32d075020c'], ['./icons/icon-192.png', '5f1e35db08a949653e1b09ad74fbd0443bf1ff0b6e5e466bfde81b23d0f8e87e'], ['./icons/icon-512.png', '907acce2ad76dce09953a9174fe3810a400227c15ca32518a8dc9a015dd322c8'], ['./index.html', '2b126a06b6797dec1c00325a8e282945ef5770701fea80509478071f5f5ea5fa'], ['./manifest.webmanifest', '692ba4e11279c289f6bbec1801381e05629b2251379ce9ba6c6328eb49c63bad'], ['./player.js', 'b3f12210a48d1ff2142e5569c957be8db4e7af2fbfcd653e0f5a10ba7fe70007'], ['./start.js', 'e1c97fb3de20a250c7d6b432e3301096e4f2d04eb6c0e2f0e4343f4fe5ebc2a8'], ['./storage.js', '50b86a330aa01a9f21636da2adc4745812612ba93f7292ca205d8a970a95971d'], ['./views.js', '72927864768877da85f23b87ef7a059bb8c4fd039c003aba48ce74a7c933e34a']];

function toHex(buffer) {
  return [...new Uint8Array(buffer)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

// Each file is fetched past the browser cache and must match the hash taken at build time,
// so an update never stores an older or mixed copy of the text.
async function addVerified(cache, [url, sha]) {
  const response = await fetch(new Request(url, { cache: 'reload' }));
  if (!response.ok) throw new Error('missing ' + url);
  const digest = await crypto.subtle.digest('SHA-256', await response.clone().arrayBuffer());
  if (toHex(digest) !== sha) throw new Error('changed ' + url);
  await cache.put(url, response);
}

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => Promise.all(SHELL_FILES.map((file) => addVerified(cache, file))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((names) => Promise.all(names
        .filter((name) => name.startsWith(CACHE_PREFIX) && name !== CACHE_NAME)
        .map((name) => caches.delete(name))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  if (event.request.method !== 'GET' || url.origin !== self.location.origin) return;
  const request = event.request.mode === 'navigate' ? './index.html' : event.request;
  event.respondWith(
    caches.open(CACHE_NAME)
      .then((cache) => cache.match(request, { ignoreSearch: true }))
      .then((saved) => saved || fetch(event.request))
  );
});
