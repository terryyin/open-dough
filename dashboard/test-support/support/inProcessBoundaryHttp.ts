// Mount one localBoundaryPlugin on a plain http.Server owned by this process
// so closeServer can run while the process and fake GitHub keep observing.
// Out-of-process boundaryServer exit would hide that shutdown path.

import { once } from "node:events";
import http from "node:http";
import type { AddressInfo } from "node:net";
import type { LocalBoundary } from "../../server/localBoundary.ts";
import { localBoundaryPlugin } from "../../server/localBoundaryPlugin.ts";
import {
  mountProjectConfiguration,
  type ProjectEnvironment,
} from "../../server/projectConfiguration.ts";

type StoredHandler = (
  req: http.IncomingMessage,
  res: http.ServerResponse,
  next: () => void,
) => void;

export type InProcessBoundaryHttp = {
  readonly origin: string;
  readonly closeBoundary: () => void | Promise<void>;
  readonly closeHttp: () => Promise<void>;
};

export async function startInProcessBoundaryHttp(
  boundary: LocalBoundary,
  environment: ProjectEnvironment = "development",
): Promise<InProcessBoundaryHttp> {
  let storedHandler: StoredHandler | undefined;
  const connectStub = {
    use(fn: StoredHandler) {
      storedHandler = fn;
    },
  };

  const plugin = localBoundaryPlugin(boundary);
  const development = environment === "development";
  const configureServer = (development
    ? plugin.configureServer
    : plugin.configurePreviewServer) as unknown as (server: {
    middlewares: typeof connectStub;
  }) => void | Promise<void>;
  const closeServer = (development
    ? plugin.closeServer
    : plugin.closePreviewServer) as unknown as () => void | Promise<void>;

  const rawServer = http.createServer((req, res) => {
    storedHandler?.(req, res, () => {
      res.writeHead(404);
      res.end();
    });
  });
  const releaseConfiguration = mountProjectConfiguration(environment);
  try {
    await configureServer({ middlewares: connectStub });
    const listening = once(rawServer, "listening");
    rawServer.listen(0, "127.0.0.1");
    await listening;
  } catch (error) {
    try {
      await closeServer();
    } catch (cleanupError) {
      throw new AggregateError(
        [error, cleanupError],
        "Could not start the in-process boundary HTTP fixture",
        { cause: cleanupError },
      );
    } finally {
      releaseConfiguration();
    }
    throw error;
  }
  const { port } = rawServer.address() as AddressInfo;

  return {
    origin: `http://127.0.0.1:${String(port)}`,
    closeBoundary: () => closeServer(),
    async closeHttp() {
      rawServer.closeAllConnections();
      await new Promise<void>((resolve) => {
        rawServer.close(() => {
          resolve();
        });
      });
      releaseConfiguration();
    },
  };
}
