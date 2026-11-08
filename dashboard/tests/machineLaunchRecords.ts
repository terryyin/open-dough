// Launch-record persistence fixtures for an isolated machine directory.
// Seeding and reading use the machine launch store dashboard servers read
// (./support/launchStore.ts), in the machine's `home`.

import path from "node:path";
import { launchRequest, title } from "./agentLaunchBoundary.ts";
import type { LaunchRecord } from "../src/agentLaunch.ts";
import {
  changeLaunchStore,
  keepLaunchStoreText,
  keptLaunchStore,
  launchStoreFile,
} from "./support/launchStore.ts";

// The home directory of an isolated machine directory.
export const machineHome = (machine: string) => path.join(machine, "home");

export function storeFile(machine: string): string {
  return launchStoreFile(machineHome(machine));
}

// Writes exactly `text` as the machine's store.
export function seedStore(machine: string, text: string): void {
  keepLaunchStoreText(machineHome(machine), text);
}

// The project's records as the store file holds them, before any retention.
export function storedRecords(machine: string): unknown[] {
  return keptLaunchStore(machineHome(machine))["open-dough"] ?? [];
}

// ISO times measured from the server's real clock. Launch retention drops a
// Done mark after `launchRetentionDays` (30); fixtures that must still list
// in Recently done use a small age so calendar drift cannot expire them.
export function daysAgo(days: number): string {
  return new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
}

// A Done mark still inside launch retention (lists under Recently done).
export function retainedDoneAt(): string {
  return daysAgo(1);
}

// Marks this session's stored launch done a day ago with this problem, as an
// earlier Mark as done that could not finish natively left it.
export function seedEarlierDoneMark(
  machine: string,
  sessionId: string,
  doneProblem: string,
): void {
  changeLaunchStore(machineHome(machine), (store) => {
    const stored = Object.values(store)
      .flat()
      .find(
        (record) =>
          "session" in record && record.session.sessionId === sessionId,
      );
    if (stored === undefined || !("session" in stored))
      throw new Error("The launch was not stored.");
    stored.doneAt = retainedDoneAt();
    stored.doneProblem = doneProblem;
    return store;
  });
}

export function recordLaunchedDaysAgo(
  days: number,
  sessionId: string,
  doneDaysAgo?: number,
): LaunchRecord {
  return {
    request: launchRequest as LaunchRecord["request"],
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
): LaunchRecord {
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
  } as LaunchRecord;
}
