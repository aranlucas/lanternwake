import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { resolve, extname } from "node:path";
const root = resolve("dist"), host = process.env.HOST ?? "127.0.0.1", port = Number(process.env.PORT ?? 4317);
const types = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".png": "image/png", ".svg": "image/svg+xml", ".json": "application/json" };
const server = createServer(async (req, res) => {
  if (!["GET", "HEAD"].includes(req.method ?? "")) { res.writeHead(405); res.end(); return; }
  const url = new URL(req.url ?? "/", "http://localhost");
  if (url.pathname === "/health") { res.writeHead(200, { "content-type": "application/json" }); res.end(JSON.stringify({ status: "ok", app: "lanternwake" })); return; }
  let pathname;
  try { pathname = decodeURIComponent(url.pathname); } catch { res.writeHead(400); res.end(); return; }
  const path = resolve(root, `.${pathname === "/" ? "/index.html" : pathname}`);
  if (!path.startsWith(`${root}/`)) { res.writeHead(403); res.end(); return; }
  try {
    if (!(await stat(path)).isFile()) throw new Error("not found");
    const body = await readFile(path);
    res.writeHead(200, { "content-type": types[extname(path)] ?? "application/octet-stream", "cache-control": pathname.includes("/assets/") && !pathname.endsWith(".png") ? "public, max-age=31536000, immutable" : "no-cache", "x-content-type-options": "nosniff", "content-security-policy": "default-src 'self'; img-src 'self' data: blob:; script-src 'self'; style-src 'self' 'unsafe-inline'; connect-src 'self'; worker-src 'self' blob:; object-src 'none'; base-uri 'self'; frame-ancestors 'none'" });
    res.end(req.method === "HEAD" ? undefined : body);
  } catch { res.writeHead(404); res.end("The garden ends here."); }
});
server.listen(port, host, () => console.log(`Lanternwake: http://${host}:${port}`));
for (const signal of ["SIGINT", "SIGTERM"]) process.on(signal, () => server.close(() => process.exit(0)));
