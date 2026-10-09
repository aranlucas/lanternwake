import { createHash } from "node:crypto";
import { readdir, readFile, writeFile } from "node:fs/promises";

async function files(dir) {
  const entries = await readdir(dir, { withFileTypes: true });

  return (
    await Promise.all(
      entries.map(async (entry) =>
        entry.isDirectory() ? files(`${dir}/${entry.name}`) : `${dir}/${entry.name}`,
      ),
    )
  ).flat();
}

const paths = (await files("dist")).filter((path) => !path.endsWith("sw.js")).sort();

const hash = createHash("sha256");

for (const path of paths) hash.update(await readFile(path));

const version = hash.digest("hex").slice(0, 12);

const urls = paths.map((path) => `/${path.slice(5)}`);

const source = `const CACHE = "lanternwake-${version}";
const FILES = ${JSON.stringify(urls)};
self.addEventListener("install", event => event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(FILES)).then(() => self.skipWaiting())));
self.addEventListener("activate", event => event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(key => key.startsWith("lanternwake-") && key !== CACHE).map(key => caches.delete(key)))).then(() => self.clients.claim())));
self.addEventListener("fetch", event => {
  if (event.request.method !== "GET" || new URL(event.request.url).origin !== self.location.origin) return;
  event.respondWith(caches.open(CACHE).then(async cache => (await cache.match(event.request)) || (event.request.mode === "navigate" ? await cache.match("/index.html") : null) || fetch(event.request)));
});
`;

await writeFile("dist/sw.js", source);

console.log(`Offline cache ${version}: ${urls.length} local files`);
