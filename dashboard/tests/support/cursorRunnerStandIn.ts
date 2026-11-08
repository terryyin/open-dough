// A loopback stand-in for the machine-local Cursor runner when a dashboard
// fixture does not prove Cursor operations. It accepts the startup probe and
// the ordinary handoff-release request on shutdown, writes the same address
// file a live runner would, and records any other Cursor protocol work so the
// owning fixture can fail with that cause after cleanup. Unlike
// ./cursorRunnerJourney.ts `occupyRunner`, connections are not dropped.
import http from "node:http";
import { mkdirSync, rmSync, writeFileSync } from "node:fs";
import path from "node:path";
import {
  cursorRunnerAddressFile,
  readCursorRunnerAddress,
} from "../../server/hosts/cursor/runnerPaths.ts";

type UnexpectedCursorProtocol = {
  readonly method: string;
  readonly pathname: string;
};

export type CursorRunnerStandIn = {
  readonly port: number;
  // Fixture-close failure when unexpected protocol work was recorded.
  failureAfterCleanup(): Error | undefined;
  // Removes only the address this stand-in wrote when it still matches.
  withdrawAddress(): void;
  // Withdraws the address, then closes the listener.
  release(): Promise<void>;
};

function drain(req: http.IncomingMessage): Promise<void> {
  return new Promise((resolve) => {
    req.resume();
    req.on("end", () => {
      resolve();
    });
  });
}

export async function standInCursorRunner(
  home: string,
): Promise<CursorRunnerStandIn> {
  const unexpected: UnexpectedCursorProtocol[] = [];
  const open = new Set<http.IncomingMessage>();
  const server = http.createServer((req, res) => {
    open.add(req);
    req.on("close", () => open.delete(req));
    void (async () => {
      const pathname = new URL(req.url ?? "/", "http://127.0.0.1").pathname;
      await drain(req);
      if (req.method === "POST" && pathname === "/release-handoffs") {
        res.writeHead(200, { "content-type": "application/json" });
        res.end(JSON.stringify({ kind: "kept" }));
        return;
      }
      unexpected.push({
        method: req.method ?? "?",
        pathname,
      });
      res.writeHead(500, { "content-type": "application/json" });
      res.end(
        JSON.stringify({
          kind: "failed",
          error: `Unexpected Cursor protocol: ${req.method ?? "?"} ${pathname}`,
        }),
      );
    })().catch(() => {
      if (!res.headersSent) res.destroy();
    });
  });
  await new Promise<void>((resolve, reject) => {
    server.once("error", reject);
    server.listen(0, "127.0.0.1", () => {
      resolve();
    });
  });
  const address = server.address();
  if (address === null || typeof address === "string") {
    server.close();
    throw new Error("The Cursor runner stand-in did not bind a port.");
  }
  mkdirSync(path.dirname(cursorRunnerAddressFile(home)), { recursive: true });
  // Live pid of this test worker so ensureCursorRunner sees an accepting
  // address. Cleanup must never treat this pid as a native runner.
  writeFileSync(
    cursorRunnerAddressFile(home),
    JSON.stringify({ port: address.port, pid: process.pid }),
  );
  const withdrawAddress = () => {
    const standing = readCursorRunnerAddress(home);
    if (standing?.port === address.port && standing.pid === process.pid) {
      rmSync(cursorRunnerAddressFile(home), { force: true });
    }
  };
  return {
    port: address.port,
    failureAfterCleanup: () => {
      if (unexpected.length === 0) return undefined;
      const details = unexpected
        .map((entry) => `${entry.method} ${entry.pathname}`)
        .join(", ");
      return new Error(
        `Unexpected Cursor protocol work on the runner stand-in: ${details}`,
      );
    },
    withdrawAddress,
    release: () => {
      withdrawAddress();
      for (const req of open) req.destroy();
      return new Promise((resolve) => {
        server.close(() => {
          resolve();
        });
      });
    },
  };
}
