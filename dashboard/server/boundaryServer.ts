// This dashboard's local boundaries on a plain HTTP server, without Vite:
// the server a boundary test starts (`../tests/boundary/`, through
// `../tests/support/dashboardServer.ts` in boundary mode) in place of a dev
// or built-preview server. It mounts this dashboard's local boundaries
// (`./localBoundaries.ts`), the list `../vite.config.mts` mounts too, and
// serves no page or asset: a request none of them answers is 404. Its
// project environment is the one named by `--environment development` or
// `--environment production` (`./projectConfiguration.ts`): production, as
// under the built-preview server, when unnamed; development for a test of
// what the dev server's environment keeps. Dev and preview themselves stay
// Vite's.
//
// Run with `node --experimental-transform-types`, which the server's own
// TypeScript needs, as `--port 0` for any free port or `--port <n>
// --strictPort` for that port alone, on loopback only. It reports the address
// it bound on stdout the way Vite does (`Local:   http://127.0.0.1:<port>/`),
// so the same start helper reads it (`../tests/support/serverAddress.ts`), and
// closes every boundary before it exits on SIGTERM or SIGINT, as Vite's
// close hooks do (`./localBoundaryPlugin.ts`).

import {
  createServer,
  type IncomingMessage,
  type ServerResponse,
} from "node:http";
import type { Connect } from "vite";
import { localBoundaries } from "./localBoundaries.ts";
import {
  installBoundary,
  type BoundaryMiddlewares,
  type BoundaryReady,
} from "./localBoundary.ts";
import {
  initializeProjectConfiguration,
  type ProjectEnvironment,
} from "./projectConfiguration.ts";

const loopbackOnly = "127.0.0.1";

// The chain the boundaries mount on: each handler answers its own paths and
// passes the rest on; a request that reaches the end is unknown here, and a
// handler's error is answered as the failure it is.
function middlewareChain(): BoundaryMiddlewares & {
  handle(req: IncomingMessage, res: ServerResponse): void;
} {
  const handlers: Connect.NextHandleFunction[] = [];
  return {
    use(handler) {
      handlers.push(handler);
      return this;
    },
    handle(req, res) {
      const next = (index: number): Connect.NextFunction => {
        return (error?: unknown) => {
          const handler = handlers[index];
          if (error !== undefined) {
            res.writeHead(500, { "Content-Type": "text/plain" });
            res.end(
              error instanceof Error ? error.message : "The request failed.",
            );
            return;
          }
          if (handler === undefined) {
            res.writeHead(404, { "Content-Type": "text/plain" });
            res.end("Not found");
            return;
          }
          handler(req, res, next(index + 1));
        };
      };
      next(0)();
    },
  };
}

function listenPort(argv: readonly string[]): number {
  const at = argv.indexOf("--port");
  const port = at === -1 ? 0 : Number(argv[at + 1]);
  if (!Number.isInteger(port) || port < 0 || port > 65_535) {
    throw new Error(
      `--port must name a port number, not ${String(argv[at + 1])}`,
    );
  }
  return port;
}

function projectEnvironment(argv: readonly string[]): ProjectEnvironment {
  const at = argv.indexOf("--environment");
  const named = at === -1 ? "production" : argv[at + 1];
  if (named !== "development" && named !== "production") {
    throw new Error(
      `--environment must be development or production, not ${String(named)}`,
    );
  }
  return named;
}

async function main(): Promise<void> {
  const argv = process.argv.slice(2);
  const port = listenPort(argv);
  const environment = projectEnvironment(argv);
  const chain = middlewareChain();
  const server = createServer((req, res) => {
    chain.handle(req, res);
  });
  initializeProjectConfiguration(environment);
  const mounted: BoundaryReady[] = localBoundaries.map(({ install }) =>
    installBoundary(install, chain, server),
  );
  let closing: Promise<void> | undefined;
  const closeAndExit = () => {
    closing ??= (async () => {
      // Each boundary ends what it owns; then no connection keeps the
      // process alive.
      for (const boundary of mounted) await boundary.close();
      server.closeAllConnections();
      await new Promise<void>((resolve) => {
        server.close(() => {
          resolve();
        });
      });
      process.exit(0);
    })();
  };
  process.once("SIGTERM", closeAndExit);
  process.once("SIGINT", closeAndExit);
  await Promise.all(mounted.map((boundary) => boundary.ready));
  await new Promise<void>((resolve, reject) => {
    server.once("error", reject);
    server.listen(port, loopbackOnly, () => {
      server.off("error", reject);
      resolve();
    });
  });
  const address = server.address();
  if (address === null || typeof address === "string") {
    throw new Error("The boundary server bound no TCP address.");
  }
  process.stdout.write(
    `  Local:   http://${loopbackOnly}:${String(address.port)}/\n`,
  );
}

main().catch((error: unknown) => {
  process.stderr.write(
    `${error instanceof Error ? (error.stack ?? error.message) : String(error)}\n`,
  );
  process.exit(1);
});
