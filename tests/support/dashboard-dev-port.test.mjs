import assert from "node:assert/strict";
import { fileURLToPath } from "node:url";
import { test } from "node:test";
import { createServer } from "vite";

const configFile = fileURLToPath(
  new URL("../../dashboard/vite.config.mts", import.meta.url),
);

test("the dashboard development server uses its dedicated port", async () => {
  const server = await createServer({ configFile });
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
