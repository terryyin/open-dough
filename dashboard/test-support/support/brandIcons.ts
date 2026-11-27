// Open Dough's supplied icon exports (../../../assets/brand/favicon/) that the
// dashboard page declares (../../../e2e/runtime/browser-identity.spec.ts), and the answer every
// serving mode gives for each: that canonical file's exact bytes as an image.
// Fetched with Node's own fetch() and checked with node:assert, so both the
// Vitest and the Playwright runner use it.

import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { repoRoot } from "./repositoryRoot.ts";

// Expects the answer at an icon's URL to be the export its file name names.
export async function expectSuppliedIcon(url: string): Promise<void> {
  const name = path.basename(new URL(url).pathname);
  const response = await fetch(url);
  assert.deepEqual(
    {
      status: response.status,
      contentType: response.headers.get("content-type"),
      body: Buffer.from(await response.arrayBuffer()),
    },
    {
      status: 200,
      contentType: name.endsWith(".ico") ? "image/x-icon" : "image/png",
      body: await readFile(path.join(repoRoot, "assets/brand/favicon", name)),
    },
    url,
  );
}
