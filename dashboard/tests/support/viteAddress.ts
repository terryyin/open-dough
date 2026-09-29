// The address a Vite server that ./dashboardServer.ts spawned listens on:
// the port it is told to bind, and the address it reports having bound.

import { stripVTControlCharacters } from "node:util";
import type { spawnGroupLeader } from "./processGroup.ts";

// Any free port, bound by Vite itself (`--port 0`), so no other listener can
// take the port between choosing and binding it; or the named `port`, which
// Vite then fails to start on rather than take another.
export function listenArgs(port: number | undefined): string[] {
  return port === undefined
    ? ["--port", "0"]
    : ["--port", String(port), "--strictPort"];
}

// Vite reports the address it bound on stdout. Only this server's own report
// counts: if the process exits or stays silent, the start fails with its
// output rather than letting a test run against whatever else answers.
export async function ownAddress(
  child: ReturnType<typeof spawnGroupLeader>,
  output: () => string,
  deadlineMs: number,
): Promise<string> {
  return new Promise((resolve, reject) => {
    const settle = (finish: () => void) => {
      clearTimeout(timer);
      child.stdout.off("data", onData);
      child.off("exit", onExit);
      finish();
    };
    const onData = () => {
      const local = /Local:\s+(http:\/\/\S+)/.exec(
        stripVTControlCharacters(output()),
      );
      if (local?.[1] !== undefined) {
        const origin = new URL(local[1]).origin;
        settle(() => {
          resolve(origin);
        });
      }
    };
    const onExit = (code: number | null, signal: string | null) => {
      settle(() => {
        reject(
          new Error(
            `Vite exited (${signal ?? `code ${String(code)}`}) before reporting its address`,
          ),
        );
      });
    };
    const timer = setTimeout(() => {
      settle(() => {
        reject(
          new Error(
            `Vite did not report its address within ${String(deadlineMs)}ms`,
          ),
        );
      });
    }, deadlineMs);
    child.stdout.on("data", onData);
    child.on("exit", onExit);
  });
}
