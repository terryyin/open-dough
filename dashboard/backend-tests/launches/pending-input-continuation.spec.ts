// A kept Codex conversation whose first input is uncertain
// (../../server/launchRecordStore.ts) is recovered by the same Start choices
// without a second send, and a different landing choice starts its own
// session instead. The attempt run (../../server/launchRun.ts) dispatches
// through a recording native collaborator against a real bare origin. The
// real native recovery: ../../../e2e/launches/agent-launch-ad-hoc-codex-recovery.spec.ts.
import path from "node:path";
import { afterEach, beforeAll, beforeEach, expect, test, vi } from "vitest";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { queuedReadyRepository } from "../../../Distribution/tests/support/queued-repository.mjs";
import { NativeDoneMarks } from "../../server/doneMarks.ts";
import { keepRecord, keptRecords } from "../../server/launchRecordStore.ts";
import { attemptRun } from "../../server/launchRun.ts";
import { machineFolder } from "../../server/localFolder.ts";
import type { NativeDispatch } from "../../server/nativeSessionRun.ts";
import { mountProjectConfiguration } from "../../server/projectConfiguration.ts";
import { StartProgress } from "../../server/startProgress.ts";
import type { LaunchRecord } from "../../src/launchRecord.ts";
import {
  startOrigin,
  type StartOrigin,
} from "../../test-support/support/startOrigin.ts";
import { keepStartedOrigin } from "../../test-support/support/startOriginPreparation.ts";
import {
  recordStarts,
  worktree,
  worktrees,
} from "../../test-support/support/startSessionLanding.ts";

const source = makeMe.aPublishedSource.openDough.please();
const repository = queuedReadyRepository().please();

let origin: StartOrigin;
let unmount: () => void;
let marks: NativeDoneMarks;
let launched: number;
let recovered: LaunchRecord[];

const session = makeMe.aHostSession.codex({ sessionId: "new-thread" }).please();

// Records each native launch and recovery, and opens or recovers it.
const native: NativeDispatch = () => ({
  launch() {
    launched += 1;
    return Promise.resolve({
      kind: "launched",
      session,
      sessionState: makeMe.aSessionState.loaded("working").please(),
    });
  },
  recover(pending) {
    recovered.push(pending);
    return Promise.resolve({
      kind: "launched",
      session: pending.session,
      sessionState: makeMe.aSessionState.loaded("working").please(),
    });
  },
});

beforeAll(async () => {
  const initial = await startOrigin(repository, { host: "codex" });
  try {
    keepStartedOrigin("codex", repository, initial);
  } finally {
    initial.cleanup();
  }
});

beforeEach(async () => {
  launched = 0;
  recovered = [];
  origin = await startOrigin(repository, { host: "codex" });
  vi.stubEnv("HOME", path.join(origin.machine, "home"));
  unmount = mountProjectConfiguration("production");
  marks = new NativeDoneMarks({
    terminals: { withAttachment: vi.fn(), endAttachments: vi.fn() },
    hostFor: () => undefined,
    reportingFolder: machineFolder,
  });
});

afterEach(async () => {
  await marks.close();
  unmount();
  vi.unstubAllEnvs();
  origin.cleanup();
});

// A Codex conversation in its isolated workspace, waiting for review, whose
// first input's acknowledgment was lost.
const pendingConversation = () =>
  makeMe.aLaunchRecord
    .adHoc({
      instruction: "Session",
      title: "Session",
      storyIdentity: "SEED-001#ad-hoc-work",
    })
    .inCodexSession({ sessionId: "pending-thread" })
    .inIsolatedWorkspace({
      workspace: worktree(origin.project, "session"),
      branch: "codex/session",
    })
    .withFirstInput({ state: "uncertain", instruction: "Session" })
    .please();

const run = (landing: "review" | "auto-land") => {
  const attempt = makeMe.anAcceptedAttempt
    .requesting(
      makeMe.aLaunchRequest
        .adHoc({ host: "codex" })
        .withInstruction("Session")
        .withPolicy({ workspace: "isolated", landing })
        .please(),
    )
    .acceptedAt(new Date().toISOString())
    .please();
  const note = () => Promise.resolve();
  return attemptRun(
    source,
    {
      request: attempt.request,
      attempt,
      controller: new AbortController(),
      changes: 0,
    },
    note,
    note,
    note,
    { progress: new StartProgress(), doneMarks: marks, native },
  );
};

test("the same choices recover the uncertain conversation without a start or a second send", async () => {
  const starts = recordStarts(origin, "codex");
  const pending = pendingConversation();
  await keepRecord(source.id, pending, marks);

  expect(await run("review")).toMatchObject({
    kind: "launched",
    record: { session: pending.session },
  });
  expect(recovered).toEqual([
    expect.objectContaining({ session: pending.session }),
  ]);
  expect(launched).toBe(0);
  expect(starts()).toEqual([]);
  expect(worktrees(origin.project)).toEqual([]);
});

test("a different landing choice starts its own session and leaves the uncertain conversation waiting", async () => {
  const starts = recordStarts(origin, "codex");
  const pending = pendingConversation();
  await keepRecord(source.id, pending, marks);

  expect(await run("auto-land")).toMatchObject({
    kind: "launched",
    record: { session },
  });
  expect(recovered).toEqual([]);
  expect(launched).toBe(1);
  expect(starts()).toHaveLength(1);
  expect(await keptRecords(source.id)).toContainEqual(pending);
});
