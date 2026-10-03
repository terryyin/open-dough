// Launch-record persistence fixtures for an isolated machine directory.
// Seeding and reading use the actual JSON file consumed by dashboard servers.

import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { launchRequest, title } from "./agentLaunchBoundary.ts";

export function storeFile(machine: string): string {
  return path.join(
    machine,
    "home",
    ".open-dough",
    "dashboard",
    "agent-launches.json",
  );
}

export function seedStore(machine: string, text: string): void {
  mkdirSync(path.dirname(storeFile(machine)), { recursive: true });
  writeFileSync(storeFile(machine), text);
}

// The project's records as the store file holds them, before any retention.
export function storedRecords(machine: string): unknown[] {
  const store = JSON.parse(readFileSync(storeFile(machine), "utf8")) as Record<
    string,
    unknown[]
  >;
  return store["open-dough"] ?? [];
}

function daysAgo(days: number): string {
  return new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
}

export function recordLaunchedDaysAgo(
  days: number,
  sessionId: string,
  doneDaysAgo?: number,
): object {
  return {
    request: launchRequest,
    session: {
      host: "claude",
      sessionId,
      shortId: sessionId.slice(0, 8),
      name: `Open Dough · Execution · ${title}`,
    },
    launchedAt: daysAgo(days),
    ...(doneDaysAgo === undefined ? {} : { doneAt: daysAgo(doneDaysAgo) }),
  };
}

// An open launch record for a story, shaped for Claude, Codex, or Cursor so
// acceptance tests can seed the machine store without launching.
export function openStoryRecord(
  host: "claude" | "codex" | "cursor",
  sessionId: string,
  story: {
    readonly source: string;
    readonly identity: string;
    readonly title: string;
    readonly workflow: string;
  } = launchRequest,
): object {
  const name = `Open Dough · Execution · ${story.title}`;
  const session =
    host === "claude"
      ? {
          host,
          sessionId,
          shortId: sessionId.slice(0, 8),
          name,
        }
      : host === "codex"
        ? { host, sessionId, name }
        : {
            host,
            sessionId,
            name,
            continuation: {
              workspace: "/tmp",
              args: ["agent", "--resume", sessionId],
            },
          };
  return {
    request: {
      source: story.source,
      identity: story.identity,
      title: story.title,
      workflow: story.workflow,
      host,
    },
    session,
    launchedAt: new Date().toISOString(),
  };
}
