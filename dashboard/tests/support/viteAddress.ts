// The Vite server a test launches, directly (./dashboardServer.ts) or through
// the public npm command (./dashboardCommand.ts): the port it is told to bind,
// and the address it reports having bound.

import path from "node:path";
import { stripVTControlCharacters } from "node:util";
import { startOnChosenPort } from "../../server/chosenPort.mjs";
import {
  endGroup,
  spawnGroupLeader,
  type GroupLeader,
} from "./processGroup.ts";
import { repoRoot } from "./repositoryRoot.ts";

const viteBin = path.join(repoRoot, "node_modules", ".bin", "vite");

// Any free port, chosen by Vite itself (`--port 0`), which probes one and then
// binds it, failing with "Port N is already in use" if another listener took
// it in between; or the named `port`, which Vite then fails to start on rather
// than take another.
export function listenArgs(port: number | undefined): string[] {
  return port === undefined
    ? ["--port", "0"]
    : ["--port", String(port), "--strictPort"];
}

// Vite in its own process group, so stopping it can wait for every `gh` it
// launched.
export function spawnVite(args: readonly string[], env: NodeJS.ProcessEnv) {
  const child = spawnGroupLeader(viteBin, args, { cwd: repoRoot, env });
  const output: Buffer[] = [];
  const collect = (chunk: Buffer) => {
    output.push(chunk);
  };
  child.stdout.on("data", collect);
  child.stderr.on("data", collect);
  return {
    child,
    output: () => Buffer.concat(output).toString("utf8"),
    stop: () => endGroup(child),
  };
}

type Launch = {
  readonly child: GroupLeader;
  output(): string;
  stop(): Promise<void>;
};

// A launch on `port` with the address it reports. A launch that fails to
// report one is stopped and the start fails with its output, after starting
// again when it only lost a port Vite chose (../../server/chosenPort.mjs).
export async function startOnOwnAddress<L extends Launch>(
  port: number | undefined,
  launch: () => L,
  failure: string,
): Promise<{ launched: L; url: string }> {
  return startOnChosenPort(port, async () => {
    const launched = launch();
    try {
      return {
        launched,
        url: await ownAddress(launched.child, () => launched.output(), 20_000),
      };
    } catch (error) {
      await launched.stop();
      throw new Error(`${failure}:\n${launched.output()}`, { cause: error });
    }
  });
}

// Vite reports the address it bound on stdout. Only this server's own report
// counts: if the process exits or stays silent, the start fails with its
// output rather than letting a test run against whatever else answers.
async function ownAddress(
  child: GroupLeader,
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
