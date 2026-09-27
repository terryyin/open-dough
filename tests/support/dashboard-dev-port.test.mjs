import assert from "node:assert/strict";
import { fileURLToPath } from "node:url";
import { test } from "node:test";
import { createServer, resolveConfig } from "vite";

const configFile = fileURLToPath(
  new URL("../../dashboard/vite.config.mts", import.meta.url),
);

// The dedicated port is checked in the resolved configuration rather than by
// binding it, so a maintainer's running dashboard does not fail the check.
test("the dashboard development server claims its dedicated loopback port", async () => {
  const { server } = await resolveConfig({ configFile }, "serve");
  assert.equal(server.port, 43127);
  assert.equal(server.strictPort, true);
  assert.equal(server.host, "127.0.0.1");
});

test("the dashboard development server serves the dashboard", async () => {
  const server = await createServer({
    configFile,
    server: { port: 0, strictPort: false },
  });
  try {
    await server.listen();
    const response = await fetch(server.resolvedUrls?.local[0]);
    assert.equal(response.status, 200);
  } finally {
    await server.close();
  }
});
