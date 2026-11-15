// Deliver Open Dough's supplied icons and kneading animation from the brand
// directory at stable root URLs, outside this Vite root.
// The dev server answers them from the source files on each request; a build
// writes the same bytes, unrenamed, beside `index.html` in its output, which
// the preview and every production deployment then serve as static files.
// `../index.html` declares them for the tab, bookmarks and touch icon.

import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import type { Plugin } from "vite";

const brandExports = fileURLToPath(
  new URL("../../assets/brand/favicon/", import.meta.url),
);

// The content type Vite's preview gives each extension, so dev answers alike.
const contentTypes: Readonly<Record<string, string>> = {
  ".ico": "image/x-icon",
  ".png": "image/png",
};

type BrandAsset = { readonly source: string; readonly contentType: string };

// Every supplied image export, by the root URL path it is served at.
const brandAssets: ReadonlyMap<string, BrandAsset> = new Map([
  ...readdirSync(brandExports).flatMap((name): [string, BrandAsset][] => {
    const contentType = contentTypes[path.extname(name)];
    return contentType === undefined
      ? []
      : [[`/${name}`, { source: path.join(brandExports, name), contentType }]];
  }),
  [
    "/opendough-knead.svg",
    {
      source: path.join(brandExports, "..", "opendough-knead.svg"),
      contentType: "image/svg+xml",
    },
  ],
]);

export function brandAssetPlugin(): Plugin {
  return {
    name: "open-dough-brand-assets",
    configureServer(server) {
      server.middlewares.use((request, response, next) => {
        const asset =
          request.method === "GET" || request.method === "HEAD"
            ? brandAssets.get(new URL(request.url ?? "/", "http://x").pathname)
            : undefined;
        if (asset === undefined) {
          next();
          return;
        }
        const body = readFileSync(asset.source);
        response.writeHead(200, {
          "Content-Type": asset.contentType,
          "Content-Length": body.length,
        });
        response.end(request.method === "HEAD" ? undefined : body);
      });
    },
    generateBundle() {
      for (const [urlPath, { source }] of brandAssets) {
        this.emitFile({
          type: "asset",
          fileName: urlPath.slice(1),
          source: readFileSync(source),
        });
      }
    },
  };
}
