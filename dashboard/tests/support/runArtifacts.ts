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

export async function startRunArtifacts(
  artifacts: ReadonlyMap<string, Artifact>,
) {
  const controller = new AbortController();
  const pending = new Map<string, Promise<string>>();
  const paths = new Set<string>();
  const route = `/${randomUUID()}/`;
  const tracePath = process.env[artifactTraceVariable];
  function trace(event: string, key: string, directory?: string) {
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
  }

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

  async function getArtifact(key: string, artifact: Artifact) {
    trace("request", key);
    let result = pending.get(key);
    if (result === undefined) {
      result = prepare(key, artifact);
      pending.set(key, result);
    }
    return result;
  }

  const server = createServer((request, response) => {
    const url = request.url ?? "";
    const key = url.slice(route.length);
    const artifact = artifacts.get(key);
    if (request.method !== "POST" || !url.startsWith(route) || !artifact) {
      response.writeHead(404).end();
      return;
    }
    if (controller.signal.aborted) {
      response.writeHead(503).end("Dashboard artifact preparation is closing.");
      return;
    }
    void getArtifact(key, artifact).then(
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

  function remove() {
    for (const directory of paths) {
      rmSync(directory, { recursive: true, force: true });
    }
  }
  function onExit() {
    controller.abort();
    remove();
  }
  process.once("exit", onExit);
  return async () => {
    controller.abort();
    const closed = new Promise<void>((resolve, reject) => {
      server.close((error) => {
        if (error) reject(error);
        else resolve();
      });
    });
    const [serverClose] = await Promise.allSettled([
      closed,
      ...pending.values(),
    ]);
    try {
      remove();
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
