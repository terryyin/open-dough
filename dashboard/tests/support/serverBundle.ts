// The server graph, bundled once from this checkout for one suite run. Keep
// each module's source location: server code reads files and starts entries
// relative to its own import.meta, not to the generated bundle.

import { mkdtempSync } from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { build } from "rolldown";
import { repoRoot } from "./repositoryRoot.ts";

export const serverBundleVariable = "OPEN_DOUGH_DASHBOARD_SERVER_BUNDLE";

// Bare imports resolve from the repository's node_modules as from source.
// Global setup owns removing this run's directory, including on interruption.
export function createServerBundleDirectory(): string {
  return mkdtempSync(
    path.join(repoRoot, "node_modules", ".dough-server-bundle-"),
  );
}

const keepImportMeta = {
  name: "keep-import-meta",
  transform(code: string, id: string) {
    if (!/import\.meta\.(url|dirname|filename)/.test(code)) return null;
    return code
      .replaceAll("import.meta.url", JSON.stringify(pathToFileURL(id).href))
      .replaceAll("import.meta.dirname", JSON.stringify(path.dirname(id)))
      .replaceAll("import.meta.filename", JSON.stringify(id));
  },
};

export async function bundleServerEntries(directory: string): Promise<void> {
  for (const [input, file] of [
    ["dashboard/vite.config.mts", "vite.config.mjs"],
    ["dashboard/server/boundaryServer.ts", "boundaryServer.mjs"],
    ["dashboard/server/hosts/cursor/runnerMain.ts", "runnerMain.mjs"],
  ] as const) {
    await build({
      cwd: repoRoot,
      input: path.join(repoRoot, input),
      platform: "node",
      plugins: [keepImportMeta],
      external: [/node_modules/, /^[^./]/],
      output: { file: path.join(directory, file), format: "esm" },
      logLevel: "silent",
    });
  }
}
