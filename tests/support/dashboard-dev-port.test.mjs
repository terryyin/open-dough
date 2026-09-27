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
    await server.listen();
    const address = server.resolvedUrls?.local[0];
    assert.equal(new URL(address).port, "43127");
    const response = await fetch(address);
    assert.equal(response.status, 200);
  } finally {
    await server.close();
  }
});
