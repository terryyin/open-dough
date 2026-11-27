// The Playwright runner owns preparation and cleanup. Workers and intentionally
// inherited inner runs can only request the keys registered for this run.
import { randomUUID } from "node:crypto";
import { appendFileSync, rmSync } from "node:fs";
import { createServer } from "node:http";
import type { AddressInfo } from "node:net";

const artifactTraceVariable = "OPEN_DOUGH_DASHBOARD_ARTIFACT_TRACE";

type Artifact = {
  create(): string;
  prepare(directory: string, signal: AbortSignal): Promise<void>;
};

// The run's demand for its registered artifacts: the first request for a key
// prepares it once and every waiter for that key receives the same directory
// or the same failure; a failed or interrupted preparation leaves no
// directory. `close` interrupts preparations in flight.
export function artifactDemand(
  artifacts: ReadonlyMap<string, Artifact>,
  trace: (event: string, key: string, directory?: string) => void = () => {},
) {
  const controller = new AbortController();
  const pending = new Map<string, Promise<string>>();
  const paths = new Set<string>();

  async function prepare(key: string, artifact: Artifact) {
    const directory = artifact.create();
    paths.add(directory);
    try {
      trace("start", key, directory);
      await artifact.prepare(directory, controller.signal);
      controller.signal.throwIfAborted();
      trace("complete", key, directory);
      return directory;
    } catch (error) {
      rmSync(directory, { recursive: true, force: true });
      paths.delete(directory);
      throw error;
    }
  }

  return {
    closing: () => controller.signal.aborted,
    // Undefined for a key this run does not register.
    request(key: string): Promise<string> | undefined {
      const artifact = artifacts.get(key);
      if (artifact === undefined) return undefined;
      trace("request", key);
      let result = pending.get(key);
      if (result === undefined) {
        result = prepare(key, artifact);
        pending.set(key, result);
      }
      return result;
    },
    // Interrupts preparations in flight and settles once they have ended.
    async close() {
      controller.abort();
      await Promise.allSettled(pending.values());
    },
    abort: () => {
      controller.abort();
    },
    remove() {
      for (const directory of paths) {
        rmSync(directory, { recursive: true, force: true });
      }
    },
  };
}

export async function startRunArtifacts(
  artifacts: ReadonlyMap<string, Artifact>,
) {
  const route = `/${randomUUID()}/`;
  const tracePath = process.env[artifactTraceVariable];
  const demand = artifactDemand(artifacts, (event, key, directory) => {
    if (tracePath === undefined) return;
    appendFileSync(
      tracePath,
      `${JSON.stringify({
        event,
        key,
        directory,
        pid: process.pid,
        at: Date.now(),
      })}\n`,
    );
  });

  const server = createServer((request, response) => {
    // One connection per request. A kept-alive connection's idle timer can
    // fire, once this runner resumes from a synchronous stall, before the
    // request a worker has already sent on it is read; closing it then resets
    // that worker's request.
    response.setHeader("Connection", "close");
    const url = request.url ?? "";
    const key = url.slice(route.length);
    if (request.method !== "POST" || !url.startsWith(route)) {
      response.writeHead(404).end();
      return;
    }
    // A runner registers only what its own group's specs request.
    if (!artifacts.has(key)) {
      response.writeHead(404).end("this run's setup does not register it.");
      return;
    }
    if (demand.closing()) {
      response.writeHead(503).end("Dashboard artifact preparation is closing.");
      return;
    }
    void demand.request(key)?.then(
      (directory) => response.end(directory),
      (error: unknown) =>
        response
          .writeHead(500)
          .end(error instanceof Error ? error.message : String(error)),
    );
  });
  await new Promise<void>((resolve, reject) => {
    server.once("error", reject);
    server.listen(0, "127.0.0.1", () => {
      server.off("error", reject);
      resolve();
    });
  });
  const { port } = server.address() as AddressInfo;
  const inheritedOwner = process.env["OPEN_DOUGH_DASHBOARD_ARTIFACT_OWNER"];
  process.env["OPEN_DOUGH_DASHBOARD_ARTIFACT_OWNER"] =
    `http://127.0.0.1:${String(port)}${route}`;

  function onExit() {
    demand.abort();
    demand.remove();
  }
  process.once("exit", onExit);
  return async () => {
    const closed = new Promise<void>((resolve, reject) => {
      server.close((error) => {
        if (error) reject(error);
        else resolve();
      });
    });
    const [serverClose] = await Promise.allSettled([closed, demand.close()]);
    try {
      demand.remove();
      process.off("exit", onExit);
    } finally {
      if (inheritedOwner === undefined)
        delete process.env["OPEN_DOUGH_DASHBOARD_ARTIFACT_OWNER"];
      else process.env["OPEN_DOUGH_DASHBOARD_ARTIFACT_OWNER"] = inheritedOwner;
    }
    if (serverClose.status === "rejected") throw serverClose.reason;
  };
}

export async function requestRunArtifact(
  key: string,
): Promise<string | undefined> {
  const owner = process.env["OPEN_DOUGH_DASHBOARD_ARTIFACT_OWNER"];
  if (owner === undefined) return undefined;
  const response = await fetch(new URL(key, owner), { method: "POST" });
  const answer = await response.text();
  if (!response.ok)
    throw new Error(`Could not prepare dashboard artifact ${key}: ${answer}`);
  return answer;
}
