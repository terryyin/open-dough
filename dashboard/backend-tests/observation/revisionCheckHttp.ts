// A loopback authenticated-read server. It witnesses `no-store`, status
// codes, and cross-origin refusal without Vite or Chromium.

import { createServer } from "node:http";
import { homedir } from "node:os";
import { authenticatedReadEndpoint } from "../../src/authenticatedReadRules.ts";
import { mountAuthenticatedRead } from "../../server/authenticatedReadMiddleware.ts";
import { boundaryMiddlewareChain } from "../../server/localBoundary.ts";
import type { Boundary } from "../../server/performedRead.ts";
import { mountProjectConfiguration } from "../../server/projectConfiguration.ts";
import { configureDevelopmentProjects } from "../../test-support/support/projectConfiguration.ts";

export type ReadResponse = {
  readonly status: number;
  readonly cacheControl: string | null;
  readonly body: unknown;
};

export async function withAuthenticatedRead(
  supplied: Partial<Pick<Boundary, "pinned" | "checks">>,
  run: (
    get: (query: string, origin?: string) => Promise<ReadResponse>,
  ) => Promise<void>,
): Promise<void> {
  configureDevelopmentProjects(homedir());
  const unmount = mountProjectConfiguration("development");
  const chain = boundaryMiddlewareChain();
  const closeBoundary = mountAuthenticatedRead(chain, supplied);
  const server = createServer((req, res) => {
    chain.handle(req, res);
  });
  await new Promise<void>((resolve, reject) => {
    const fail = (error: Error) => {
      reject(error);
    };
    server.once("error", fail);
    server.listen(0, "127.0.0.1", () => {
      server.off("error", fail);
      resolve();
    });
  });
  const address = server.address();
  if (address === null || typeof address === "string") {
    throw new Error("The read server did not listen on a port.");
  }
  const origin = `http://127.0.0.1:${String(address.port)}`;
  try {
    await run(async (query, requestOrigin = origin) => {
      const response = await fetch(
        `${origin}${authenticatedReadEndpoint}?${query}`,
        { headers: { Origin: requestOrigin } },
      );
      const text = await response.text();
      return {
        status: response.status,
        cacheControl: response.headers.get("cache-control"),
        body: text.length === 0 ? null : (JSON.parse(text) as unknown),
      };
    });
  } finally {
    closeBoundary();
    unmount();
    server.closeAllConnections();
    await new Promise<void>((resolve, reject) => {
      server.close((error) => {
        if (error) reject(error);
        else resolve();
      });
    });
  }
}
