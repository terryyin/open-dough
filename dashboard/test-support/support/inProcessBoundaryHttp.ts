// Mount local boundary plugins on a plain HTTP server owned by this worker.
// Tests of Vite's close hooks can still end a boundary while HTTP remains open.

import { once } from "node:events";
import http from "node:http";
import type { AddressInfo } from "node:net";
import {
  boundaryMiddlewareChain,
  type LocalBoundary,
} from "../../server/localBoundary.ts";
import { localBoundaryPlugin } from "../../server/localBoundaryPlugin.ts";
import {
  mountProjectConfiguration,
  type ProjectEnvironment,
} from "../../server/projectConfiguration.ts";

type HookServer = {
  readonly middlewares: ReturnType<typeof boundaryMiddlewareChain>;
  readonly httpServer: http.Server;
};

export type InProcessBoundaryHttp = {
  readonly origin: string;
  readonly closeBoundary: () => Promise<void>;
  readonly closeHttp: () => Promise<void>;
};

export async function startInProcessBoundaryHttp(
  boundaries: LocalBoundary | readonly LocalBoundary[],
  environment: ProjectEnvironment = "development",
  port = 0,
): Promise<InProcessBoundaryHttp> {
  const plugins = ("install" in boundaries ? [boundaries] : boundaries).map(
    (boundary) => localBoundaryPlugin(boundary),
  );
  const development = environment === "development";
  const middlewares = boundaryMiddlewareChain();
  const rawServer = http.createServer((req, res) => {
    middlewares.handle(req, res);
  });
  const releaseConfiguration = mountProjectConfiguration(environment);
  const closeBoundary = async () => {
    const errors: unknown[] = [];
    for (const plugin of plugins) {
      const close = (
        development ? plugin.closeServer : plugin.closePreviewServer
      ) as () => void | Promise<void>;
      try {
        await close();
      } catch (error) {
        errors.push(error);
      }
    }
    if (errors.length === 1) throw errors[0];
    if (errors.length > 1)
      throw new AggregateError(
        errors,
        "Could not close the in-process boundaries",
      );
  };

  try {
    await Promise.all(
      plugins.map((plugin) => {
        const configure = (development
          ? plugin.configureServer
          : plugin.configurePreviewServer) as unknown as (
          server: HookServer,
        ) => void | Promise<void>;
        return Promise.resolve(
          configure({ middlewares, httpServer: rawServer }),
        );
      }),
    );
    const listening = once(rawServer, "listening");
    rawServer.listen(port, "127.0.0.1");
    await listening;
  } catch (error) {
    try {
      await closeBoundary();
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
  const address = rawServer.address() as AddressInfo;

  return {
    origin: `http://127.0.0.1:${String(address.port)}`,
    closeBoundary,
    async closeHttp() {
      const closing = new Promise<void>((resolve) => {
        rawServer.close(() => {
          resolve();
        });
      });
      rawServer.closeAllConnections();
      await closing;
      releaseConfiguration();
    },
  };
}
