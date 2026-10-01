// This machine's accepted launch attempts (`../src/agentLaunch.ts`), kept by
// the launch owner (`./agentLaunches.ts`) in one file beside the launch
// records: `~/.open-dough/dashboard/launch-attempts.json`, resolved through
// `HOME`. Each catalog project's attempts are kept by project id. An attempt
// is written with its exact request before the launch has any side effect,
// then updated with its publication receipt and its outcome. It references
// the kept start, creation, or launch record that holds the native evidence;
// it never copies that evidence and is never a story fact. A settled attempt
// is dropped `launchRetentionDays` after it settled; an unsettled one is kept
// until it settles. This server's writes are made one at a time, so attempts
// accepted together are all kept; the file is read afresh, replaced
// atomically, and moved aside when unreadable as `./machineJsonStore.ts`
// describes.

import { homedir } from "node:os";
import path from "node:path";
import { z } from "zod";
import {
  launchAttemptSchema,
  launchRetentionDays,
  type LaunchAttemptRecord,
} from "../src/agentLaunch.ts";
import {
  readMachineJson,
  replaceMachineJson,
  type MachineJsonStore,
} from "./machineJsonStore.ts";

const retentionMs = launchRetentionDays * 24 * 60 * 60 * 1000;

const storeSchema = z.record(z.string(), z.array(launchAttemptSchema));

type StoredAttempts = z.infer<typeof storeSchema>;

function attemptStore(): MachineJsonStore<StoredAttempts> {
  return {
    file: path.join(
      homedir(),
      ".open-dough",
      "dashboard",
      "launch-attempts.json",
    ),
    schema: storeSchema,
    empty: {},
  };
}

let writing: Promise<unknown> = Promise.resolve();

// Applies `change` after every earlier write of this server, dropping settled
// attempts past retention first.
function replaceAttempts(
  change: (kept: StoredAttempts) => StoredAttempts,
): Promise<void> {
  const write = writing.then(() =>
    replaceMachineJson(attemptStore(), (stored) => {
      const now = Date.now();
      const kept: StoredAttempts = {};
      for (const [id, attempts] of Object.entries(stored)) {
        kept[id] = attempts.filter(
          (attempt) =>
            attempt.settledAt === undefined ||
            now - Date.parse(attempt.settledAt) <= retentionMs,
        );
      }
      return change(kept);
    }),
  );
  writing = write.catch(() => undefined);
  return write;
}

// Every kept attempt, oldest first, or undefined when the file is unreadable.
export async function keptAttempts(): Promise<
  readonly LaunchAttemptRecord[] | undefined
> {
  const read = await readMachineJson(attemptStore());
  return read.kind === "document"
    ? Object.values(read.document).flat()
    : undefined;
}

// Keeps a newly accepted attempt; a failed write means it was not accepted.
export function keepAttempt(attempt: LaunchAttemptRecord): Promise<void> {
  const sourceId = attempt.request.source;
  return replaceAttempts((kept) => ({
    ...kept,
    [sourceId]: [...(kept[sourceId] ?? []), attempt],
  }));
}

// Replaces a kept attempt with its later state; nothing when none is kept.
export function updateAttempt(attempt: LaunchAttemptRecord): Promise<void> {
  const sourceId = attempt.request.source;
  return replaceAttempts((kept) =>
    kept[sourceId] === undefined
      ? kept
      : {
          ...kept,
          [sourceId]: kept[sourceId].map((entry) =>
            entry.id === attempt.id ? attempt : entry,
          ),
        },
  );
}
