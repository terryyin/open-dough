// The launch records and attempts of the Sessions replay
// (./sessionsReplaySeed.ts), at the scale production held on 2026-11-03:
// 1,000 done and five open sessions (production 1,023) and 1,034 attempts
// (production 1,034). Four records in fifteen are Codex ones (production
// 270 of 1,033); the rest are Claude ones. Cursor records (production 170)
// are Claude ones here: the replay starts no Cursor runner. Field sizes
// follow production's averages, so the regular answer is about the size
// production sent (9.67 MB). Every value derives from its index, so each run
// makes the same records except for times, which stay relative to the run so
// retention keeps every done record.

import path from "node:path";
import {
  launchAttemptSchema,
  launchRecordSchema,
  type HostSession,
  type LaunchAttemptRecord,
  type LaunchRecord,
} from "../../src/agentLaunch.ts";
import { replayProjectIds } from "./sessionsReplayProjects.ts";
import { commitOf, indices, prose, uuidOf } from "./sessionsReplayValues.ts";

export const replayScale = {
  done: 1_000,
  open: 5,
  failedAttempts: 29,
  // Claude's listing, with sessions no record names, as other launches
  // leave them.
  listed: 1_191,
} as const;

const origin = "http://127.0.0.1:5173/";
const minute = 60_000;
const codexShare = (index: number) => index % 15 < 4;

const identityAt = (index: number) =>
  `SEED-${String(1_000 + index)}#replay-story-${String(index)}`;

function sessionAt(
  index: number,
  workspace: string,
  codexEndpoint: string,
  name: string,
): HostSession {
  const sessionId = uuidOf(`session:${String(index)}`);
  return codexShare(index)
    ? {
        host: "codex",
        sessionId,
        name,
        continuation: {
          workspace,
          endpoint: codexEndpoint,
          args: ["codex", "resume", sessionId],
        },
      }
    : { host: "claude", sessionId, shortId: sessionId.slice(0, 8), name };
}

function recordAt(
  home: string,
  codexEndpoint: string,
  index: number,
  now: number,
): LaunchRecord {
  const open = index >= replayScale.done;
  const source =
    replayProjectIds[index % replayProjectIds.length] ?? "open-dough";
  const identity = identityAt(index);
  const launchedAt = now - (index % (28 * 24 * 60)) * minute - 60 * minute;
  const at = (offset: number) => new Date(launchedAt + offset).toISOString();
  const repository = `replay/${source}`;
  const workspace = path.join(
    home,
    "git",
    source,
    ".worktrees",
    `story-${String(index)}`,
  );
  const branch = `claude/replay-story-${String(index)}`;
  const target = "refs/heads/main";
  const session = sessionAt(
    index,
    workspace,
    codexEndpoint,
    `Execute ${identity} ${prose(`name:${String(index)}`, 20)}`,
  );
  const landing = {
    repository,
    identity,
    remote: "origin",
    target,
    reference: uuidOf(`landing-reference:${String(index)}`),
    delivery: uuidOf(`landing-delivery:${String(index)}`),
    receipt: uuidOf(`landing-receipt:${String(index)}`),
    base: commitOf(`base:${String(index)}`),
    revision: commitOf(`revision:${String(index)}`),
    receivedAt: at(50 * minute),
  };
  return {
    request: {
      source,
      identity,
      title: `Replay story ${String(index)} ${prose(`title:${String(index)}`, 24)}`,
      workflow: "execution",
      host: session.host,
      reporting: {
        origin,
        reference: uuidOf(`reporting:${String(index)}`),
        command: `node ~/.claude/skills/dough-execute-plan/scripts/report.mjs ${prose(`command:${String(index)}`, 180)}`,
        landingContext: prose(`landing-context:${String(index)}`, 105),
      },
    },
    session,
    start: {
      identity,
      publisherId: uuidOf(`publisher:${String(index)}`),
      workspace,
      branch,
      mode: "story-branch",
      remote: "origin",
      target: "main",
      publishedSha: commitOf(`published:${String(index)}`),
      agent: "Tsubomi-chan",
      plan: `.planning/slice-plans/${String(index)}-replay/PLAN.md`,
      startingRevision: commitOf(`starting:${String(index)}`),
    },
    launchedAt: at(0),
    firstInput: {
      state: "confirmed",
      instruction: prose(`instruction:${String(index)}`, 1_250),
    },
    ...(open
      ? {}
      : {
          completion: {
            delivery: uuidOf(`completion-delivery:${String(index)}`),
            receipt: uuidOf(`completion-receipt:${String(index)}`),
            reference: uuidOf(`reporting:${String(index)}`),
            outcome: "completed" as const,
            message: prose(`message:${String(index)}`, 560),
            receivedAt: at(45 * minute),
          },
          landing,
          landingReporting: {
            origin,
            authority: {
              repository,
              workspace,
              branch,
              identity,
              remote: "origin",
              target,
            },
            preparations: [landing],
            settledAt: at(55 * minute),
          },
          doneAt: at(60 * minute),
        }),
  };
}

function attemptAt(
  index: number,
  records: readonly LaunchRecord[],
): LaunchAttemptRecord {
  const record = records[index];
  const acceptedAt = new Date(
    Date.parse(records[index % records.length]?.launchedAt ?? "") - minute,
  ).toISOString();
  const request = {
    source: record?.request.source ?? "open-dough",
    identity: identityAt(index),
    title: record?.request.title ?? `Replay failed ${String(index)}`,
    workflow: "execution" as const,
    host: record?.session.host ?? "claude",
    instruction: prose(`attempt-instruction:${String(index)}`, 71),
  };
  const id = uuidOf(`attempt:${String(index)}`);
  if (record === undefined)
    return {
      id,
      request,
      acceptedAt,
      publication: { kind: "none" },
      outcome: {
        kind: "failed",
        reason: "start-refused",
        explanation: prose(`refused:${String(index)}`, 120),
      },
      settledAt: acceptedAt,
      reconciledAt: acceptedAt,
    };
  const { completion, landing, landingReporting } = record;
  const session = {
    host: record.session.host,
    sessionId: record.session.sessionId,
  };
  return {
    id,
    reportingOrigin: origin,
    ...(record.request.reporting && { reporting: record.request.reporting }),
    ...(completion && {
      completion,
      completionReceipts: [
        { ...completion, state: "pending-native-session" as const },
        { ...completion, state: "recorded" as const, session },
      ],
    }),
    ...(landingReporting && {
      landingRepository: landingReporting.authority,
      landingPreparations: landingReporting.preparations,
    }),
    ...(landing && { landing }),
    request,
    acceptedAt,
    publication: {
      kind: "published",
      revision: commitOf(`published:${String(index)}`),
    },
    outcome: { kind: "launched", session },
    settledAt: record.launchedAt,
    reconciledAt: record.launchedAt,
  };
}

// The replay's records, Codex ones naming `codexEndpoint`, and attempts,
// each validated as the server will read it.
export function replayRecords(
  home: string,
  codexEndpoint: string,
  now: number,
) {
  const total = replayScale.done + replayScale.open;
  const records = indices(total).map((index) =>
    launchRecordSchema.parse(recordAt(home, codexEndpoint, index, now)),
  );
  const attempts = indices(total + replayScale.failedAttempts).map((index) =>
    launchAttemptSchema.parse(attemptAt(index, records)),
  );
  return { records, attempts };
}
