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
import { makeMe } from "../../../tests/support/makeMe.mjs";
import {
  launchAttemptSchema,
  launchRecordSchema,
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
  const workspace = path.join(
    home,
    "git",
    source,
    ".worktrees",
    `story-${String(index)}`,
  );
  const branch = `claude/replay-story-${String(index)}`;
  const sessionId = uuidOf(`session:${String(index)}`);
  const reference = uuidOf(`reporting:${String(index)}`);
  const execution = makeMe.aLaunchRecord.executing({
    identity,
    title: `Replay story ${String(index)} ${prose(`title:${String(index)}`, 24)}`,
    source,
  });
  const launch = (
    codexShare(index)
      ? execution.inCodexSession({
          sessionId,
          continuation: {
            workspace,
            endpoint: codexEndpoint,
            args: ["codex", "resume", sessionId],
          },
        })
      : execution.inClaudeSession({ sessionId })
  )
    .reportingThrough({
      origin,
      reference,
      command: `node ~/.claude/skills/dough-execute-plan/scripts/report.mjs ${prose(`command:${String(index)}`, 180)}`,
      landingContext: prose(`landing-context:${String(index)}`, 105),
    })
    .onStoryBranch({
      workspace,
      branch,
      publisherId: uuidOf(`publisher:${String(index)}`),
      publishedSha: commitOf(`published:${String(index)}`),
      agent: "Tsubomi-chan",
      plan: `.planning/slice-plans/${String(index)}-replay/PLAN.md`,
      startingRevision: commitOf(`starting:${String(index)}`),
    })
    .launchedAt(at(0))
    .withFirstInput({
      state: "confirmed",
      instruction: prose(`instruction:${String(index)}`, 1_250),
    });
  if (open) return launch.please();
  // A done session's report, landing and landing reporting, each with its
  // own receipts, as production keeps them.
  const authority = makeMe.aLandingAuthority
    .ofRepository(`replay/${source}`)
    .inWorktree({ workspace, branch })
    .forStory(identity)
    .please();
  // Captured from the launch's authority for its reporting reference.
  const landing = makeMe.aLaunchLanding
    .capturedFrom(authority)
    .forLaunch(reference)
    .deliveredAs({
      delivery: uuidOf(`landing-delivery:${String(index)}`),
      receipt: uuidOf(`landing-receipt:${String(index)}`),
    })
    .comparing({
      base: commitOf(`base:${String(index)}`),
      revision: commitOf(`revision:${String(index)}`),
    })
    .receivedAt(at(50 * minute))
    .please();
  return launch
    .completedWith({
      message: prose(`message:${String(index)}`, 560),
      receipt: uuidOf(`completion-receipt:${String(index)}`),
      reference,
      delivery: uuidOf(`completion-delivery:${String(index)}`),
      receivedAt: at(45 * minute),
    })
    .withCapturedLanding(landing)
    .withLandingReporting({
      origin,
      authority,
      preparations: [landing],
      settledAt: at(55 * minute),
    })
    .markedDoneAt(at(60 * minute))
    .please();
}

function attemptAt(
  index: number,
  records: readonly LaunchRecord[],
): LaunchAttemptRecord {
  const record = records[index];
  const acceptedAt = new Date(
    Date.parse(records[index % records.length]?.launchedAt ?? "") - minute,
  ).toISOString();
  const request = makeMe.aLaunchRequest
    .executing({
      identity: identityAt(index),
      title: record?.request.title ?? `Replay failed ${String(index)}`,
      source: record?.request.source ?? "open-dough",
      host: record?.session.host ?? "claude",
    })
    .withInstruction(prose(`attempt-instruction:${String(index)}`, 71))
    .please();
  const attempt = makeMe.anAcceptedAttempt
    .withId(uuidOf(`attempt:${String(index)}`))
    .requesting(request)
    .acceptedAt(acceptedAt);
  if (record === undefined)
    return attempt
      .ended({
        kind: "failed",
        reason: "start-refused",
        explanation: prose(`refused:${String(index)}`, 120),
      })
      .settledAt(acceptedAt)
      .reconciledAt(acceptedAt)
      .please();
  const { completion, landing, landingReporting } = record;
  const session = {
    host: record.session.host,
    sessionId: record.session.sessionId,
  };
  const settled = attempt
    .reportingTo(origin)
    .published(commitOf(`published:${String(index)}`))
    .launched(session)
    .settledAt(record.launchedAt)
    .reconciledAt(record.launchedAt);
  if (completion)
    settled.withCompletion(completion, [
      { ...completion, state: "pending-native-session" as const },
      { ...completion, state: "recorded" as const, session },
    ]);
  if (record.request.reporting || landingReporting || landing)
    settled.capturingLanding({
      ...(record.request.reporting && { reporting: record.request.reporting }),
      ...(landingReporting && {
        landingRepository: landingReporting.authority,
        landingPreparations: landingReporting.preparations,
      }),
      ...(landing && { landing }),
    });
  return settled.please();
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
