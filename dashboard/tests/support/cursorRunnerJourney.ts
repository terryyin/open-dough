// Observations of the machine-local Cursor runner: its process group, how
// many runners a home has, and a stand-in that occupies the runner's address.
import { mkdirSync, writeFileSync } from "node:fs";
import net from "node:net";
import { spawnSync } from "node:child_process";
import path from "node:path";
import { expect } from "@playwright/test";
import {
  cursorRunnerAddressFile,
  readCursorRunnerAddress,
} from "../../server/hosts/cursor/runnerPaths.ts";
import { processRunning } from "./processGroup.ts";

export const instruction = "continue this session";

export function processGroup(pid: number): number | undefined {
  const group = Number(
    spawnSync("ps", ["-o", "pgid=", "-p", String(pid)], {
      encoding: "utf8",
    }).stdout.trim(),
  );
  return Number.isInteger(group) && group > 0 ? group : undefined;
}

function runnerPids(): number[] {
  const listing = spawnSync("ps", ["-ax", "-o", "pid=,command="], {
    encoding: "utf8",
  }).stdout;
  return listing.split("\n").flatMap((line) => {
    const match = /^(\d+)\s+.*runnerMain\.ts/.exec(line.trim());
    return match?.[1] === undefined ? [] : [Number(match[1])];
  });
}

// A wide listing of every process drops the environment, so each runner's
// own command is read back, which includes the home it was started with.
export function runnersFor(home: string): number {
  return runnerPids().filter((pid) =>
    spawnSync("ps", ["eww", "-p", String(pid), "-o", "command="], {
      encoding: "utf8",
    }).stdout.includes(home),
  ).length;
}

// The development server waits until this home's runner is accepting, so the
// address file is present once the server's URL is. The poll still covers a
// runner that publishes a moment later.
export async function liveRunner(
  home: string,
): Promise<{ port: number; pid: number }> {
  let found: { port: number; pid: number } | undefined;
  await expect
    .poll(() => {
      found = readCursorRunnerAddress(home);
      return found !== undefined && processRunning(found.pid);
    })
    .toBe(true);
  if (found === undefined) {
    throw new Error("The Cursor runner did not start.");
  }
  return found;
}

export async function occupyRunner(home: string): Promise<() => Promise<void>> {
  const directory = path.join(home, ".open-dough", "dashboard");
  mkdirSync(directory, { recursive: true });
  const open = new Set<net.Socket>();
  const dummy = net.createServer((socket) => {
    open.add(socket);
    socket.on("close", () => open.delete(socket));
    // Drop the connection. close() would otherwise wait for it forever.
    socket.destroy();
  });
  await new Promise<void>((resolve) => {
    dummy.listen(0, "127.0.0.1", () => {
      resolve();
    });
  });
  const address = dummy.address();
  if (address === null || typeof address === "string") {
    throw new Error("The stand-in runner did not bind a port.");
  }
  // Not a live runner. Cleanup must not signal this pid.
  writeFileSync(
    cursorRunnerAddressFile(home),
    JSON.stringify({ port: address.port, pid: 2_147_483_646 }),
  );
  return () =>
    new Promise((resolve) => {
      for (const socket of open) socket.destroy();
      dummy.close(() => {
        resolve();
      });
    });
}
