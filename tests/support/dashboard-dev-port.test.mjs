import assert from "node:assert/strict";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { test } from "node:test";
import { createServer } from "vite";

const configFile = fileURLToPath(
  new URL("../../dashboard/vite.config.mts", import.meta.url),
);

test("the dashboard development server uses its dedicated port", async (t) => {
  const cacheDir = await mkdtemp(join(tmpdir(), "dough-dev-port-vite-"));
  t.after(() => rm(cacheDir, { recursive: true, force: true }));
  // This server owns its generated cache; normal optimizer info is not a
  // port observation. Unexpected warnings and errors still reach the runner.
  const server = await createServer({ configFile, cacheDir, logLevel: "warn" });
  try {
    assert.equal(server.config.server.port, 43127);
    assert.equal(server.config.server.strictPort, true);
    // Serve on an ephemeral port so a developer's running dashboard, which
    // holds the dedicated port, cannot make this check fail.
    await server.listen(0);
    const response = await fetch(server.resolvedUrls?.local[0]);
    assert.equal(response.status, 200);
  } finally {
    await server.close();
  }
});
