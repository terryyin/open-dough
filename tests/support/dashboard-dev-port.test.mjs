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
  // This check reads config and HTML, so dependency optimization is unrelated
  // work. Vite can finish its scan and start writing after close begins.
  const server = await createServer({
    configFile,
    cacheDir,
    logLevel: "warn",
    plugins: [
      {
        name: "port-check-without-dependency-optimization",
        enforce: "post",
        config(config) {
          // React adds included deps in its config hook; disable the optimizer
          // after those defaults rather than merging another include array.
          Object.assign(config, {
            optimizeDeps: { noDiscovery: true, include: [] },
          });
        },
      },
    ],
  });
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
