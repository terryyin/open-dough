// Serves the run's prebuilt dashboard bundle as plain static files with SPA
// fallback, without Vite preview, boundaryServer, fake-gh, or FakeGitHub.

import { createReadStream, existsSync, statSync } from "node:fs";
import { createServer, type Server } from "node:http";
import type { AddressInfo } from "node:net";
import path from "node:path";
import { builtDashboardDir } from "./dashboardBuild.ts";

const contentTypes: Readonly<Record<string, string>> = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".map": "application/json; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".woff2": "font/woff2",
};

function contentTypeFor(filePath: string): string {
  return contentTypes[path.extname(filePath)] ?? "application/octet-stream";
}

function resolveFile(root: string, urlPath: string): string | undefined {
  const decoded = decodeURIComponent(urlPath.split("?")[0] ?? "/");
  const relative = decoded === "/" ? "index.html" : decoded.replace(/^\/+/, "");
  const candidate = path.resolve(root, relative);
  if (!candidate.startsWith(root) || !existsSync(candidate)) return undefined;
  const stats = statSync(candidate);
  if (stats.isDirectory()) {
    const index = path.join(candidate, "index.html");
    return existsSync(index) ? index : undefined;
  }
  return candidate;
}

export type FrontendAppServer = {
  readonly baseURL: string;
  readonly origin: string;
  readonly outDir: string;
  close(): Promise<void>;
};

export async function startFrontendAppServer(
  outDir: string = builtDashboardDir,
): Promise<FrontendAppServer> {
  const root = path.resolve(outDir);
  if (!existsSync(path.join(root, "index.html"))) {
    throw new Error(
      `Frontend app fixture needs a built dashboard at ${root} (globalSetup sets OPEN_DOUGH_DASHBOARD_BUILD).`,
    );
  }
  const server: Server = createServer((request, response) => {
    const urlPath = request.url ?? "/";
    const file = resolveFile(root, urlPath) ?? path.join(root, "index.html");
    response.writeHead(200, { "Content-Type": contentTypeFor(file) });
    createReadStream(file).pipe(response);
  });
  await new Promise<void>((resolve, reject) => {
    server.once("error", reject);
    server.listen(0, "127.0.0.1", () => {
      resolve();
    });
  });
  const address = server.address() as AddressInfo;
  const origin = `http://127.0.0.1:${String(address.port)}`;
  return {
    baseURL: origin,
    origin,
    outDir: root,
    close: () =>
      new Promise<void>((resolve, reject) => {
        server.close((error) => {
          if (error) {
            reject(error);
            return;
          }
          resolve();
        });
      }),
  };
}
