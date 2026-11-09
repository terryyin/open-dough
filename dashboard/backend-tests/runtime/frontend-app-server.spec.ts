import { once } from "node:events";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import http, { type Server } from "node:http";
import { syncBuiltinESMExports } from "node:module";
import { createConnection, type Socket } from "node:net";
import { tmpdir } from "node:os";
import path from "node:path";
import {
  startFrontendAppServer,
  type FrontendAppServer,
} from "../../tests/support/frontendAppServer.ts";
import { expect, test as base } from "../../tests/support/pageTest.ts";
import { rawRequest } from "../../tests/support/rawHttp.ts";

const index = "<!doctype html><title>Static frontend fixture</title>";
const stylesheet = "body { color: green; }";

const test = base.extend<{ outDir: string }>({
  // These exact static bytes exercise the HTTP harness, not product data.
  // eslint-disable-next-line no-empty-pattern
  outDir: async ({}, use) => {
    const directory = await mkdtemp(path.join(tmpdir(), "frontend-server-"));
    try {
      await writeFile(path.join(directory, "index.html"), index);
      await writeFile(path.join(directory, "style.css"), stylesheet);
      await use(directory);
    } finally {
      await rm(directory, { recursive: true, force: true });
    }
  },
});

test("frontend shutdown releases an accepted connection before any HTTP request", async ({
  outDir,
}) => {
  const originalCreateServer = http.createServer;
  let server: Server | undefined;
  let fixture: FrontendAppServer | undefined;
  let client: Socket | undefined;
  let acceptedSocket: Socket | undefined;
  let closing: Promise<void> | undefined;
  const closeEvents: Promise<unknown>[] = [];
  // Observe the real helper's accepted socket without changing its server API.
  http.createServer = ((...args: Parameters<typeof http.createServer>) => {
    server = originalCreateServer(...args);
    return server;
  }) as typeof http.createServer;
  syncBuiltinESMExports();
  try {
    try {
      fixture = await startFrontendAppServer(outDir);
    } finally {
      http.createServer = originalCreateServer;
      syncBuiltinESMExports();
    }
    if (server === undefined)
      throw new Error("The frontend server was not observed");
    const accepted = once(server, "connection") as Promise<[Socket]>;
    closeEvents.push(once(server, "close"));
    const address = new URL(fixture.baseURL);
    client = createConnection({
      host: address.hostname,
      port: Number(address.port),
    });
    closeEvents.push(once(client, "close"));
    const [[socket]] = await Promise.all([accepted, once(client, "connect")]);
    acceptedSocket = socket;
    closeEvents.push(once(acceptedSocket, "close"));
    expect(acceptedSocket.bytesRead).toBe(0);
    expect(acceptedSocket.destroyed).toBe(false);

    let closeResolved = false;
    closing = fixture.close().then(() => {
      closeResolved = true;
    });
    await expect.poll(() => closeResolved).toBe(true);
    await Promise.all([closing, ...closeEvents]);
    expect(acceptedSocket.destroyed).toBe(true);
    expect(server.listening).toBe(false);
    expect(client.destroyed).toBe(true);
  } finally {
    http.createServer = originalCreateServer;
    syncBuiltinESMExports();
    client?.destroy();
    acceptedSocket?.destroy();
    try {
      if (fixture !== undefined) await (closing ?? fixture.close());
    } finally {
      await Promise.all(closeEvents);
    }
  }
});

test("frontend static files and SPA fallback complete before close, and close errors propagate", async ({
  outDir,
}) => {
  const fixture = await startFrontendAppServer(outDir);
  let closed = false;
  try {
    const file = await rawRequest({ url: `${fixture.baseURL}/style.css` });
    expect(file.status).toBe(200);
    expect(file.headers["content-type"]).toBe("text/css; charset=utf-8");
    expect(file.body).toBe(stylesheet);
    const fallback = await rawRequest({
      url: `${fixture.baseURL}/nested/route`,
    });
    expect(fallback.status).toBe(200);
    expect(fallback.headers["content-type"]).toBe("text/html; charset=utf-8");
    expect(fallback.body).toBe(index);
    await fixture.close();
    closed = true;
    await expect(fixture.close()).rejects.toMatchObject({
      code: "ERR_SERVER_NOT_RUNNING",
    });
  } finally {
    if (!closed) await fixture.close();
  }
});
