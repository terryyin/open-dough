// An execution checkout session start that stops before establishment keeps
// nothing and publishes nothing. One kept after its native stop
// (../../server/sessionStartStore.ts) asks about changes made since on
// Continue (../../server/launchPreAcceptance.ts), and once the checkout is
// clean continues there without a second start. The attempt run
// (../../server/launchRun.ts) runs the installed start against a real bare
// origin and dispatches through a recording native collaborator. An isolated
// start: ./isolated-start-before-establishment.spec.ts and
// ./isolated-start-after-establishment.spec.ts. A start that outlasts its wait
// and the page's Continue: ../../../e2e/launches/agent-launch-start-session-recovery.spec.ts.
import { rmSync, writeFileSync } from "node:fs";
import path from "node:path";
import { afterEach, beforeAll, beforeEach, expect, test, vi } from "vitest";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { queuedReadyRepository } from "../../../Distribution/tests/support/queued-repository.mjs";
import { NativeDoneMarks } from "../../server/doneMarks.ts";
import { installedSkillPath } from "../../server/launchHosts.ts";
import { attemptRun } from "../../server/launchRun.ts";
import { preContinuationAnswer } from "../../server/launchPreAcceptance.ts";
import { machineFolder } from "../../server/localFolder.ts";
import type { NativeDispatch } from "../../server/nativeSessionRun.ts";
import { mountProjectConfiguration } from "../../server/projectConfiguration.ts";
import { StartProgress } from "../../server/startProgress.ts";
import type {
  LaunchResult,
  RecordedLaunchRequest,
} from "../../src/agentLaunch.ts";
import { keptSessionStarts } from "../../test-support/support/keptSessionStart.ts";
import {
  startOrigin,
  type StartOrigin,
} from "../../test-support/support/startOrigin.ts";
import { keepStartedOrigin } from "../../test-support/support/startOriginPreparation.ts";
import {
  executionCheckoutSession,
  git,
  recordStarts,
  worktrees,
} from "../../test-support/support/startSessionLanding.ts";

const source = makeMe.aPublishedSource.openDough.please();
const repository = queuedReadyRepository().please();

type Dispatched = {
  readonly request: RecordedLaunchRequest;
  readonly established: unknown;
};

let origin: StartOrigin;
let unmount: () => void;
let marks: NativeDoneMarks;
let dispatched: Dispatched[];
let refusals: number;
let progress: StartProgress;

// Records each native dispatch, refusing the first `refusals` of them.
const native: NativeDispatch = () => ({
  launch(...[, request, , , established]) {
    dispatched.push({ request, established });
    if (refusals > 0) {
      refusals -= 1;
      return Promise.resolve({
        kind: "failed",
        reason: "refused",
        explanation: "The native host refused the session.",
      });
    }
    return Promise.resolve({
      kind: "launched",
      session: makeMe.aHostSession.claude({ sessionId: "claude-1" }).please(),
      sessionState: makeMe.aSessionState.loaded("working").please(),
    });
  },
});

const originMain = async () =>
  (await origin.originGit("rev-parse", "main")).trim();

beforeAll(async () => {
  const initial = await startOrigin(repository);
  try {
    keepStartedOrigin("claude", repository, initial);
  } finally {
    initial.cleanup();
  }
});

beforeEach(async () => {
  dispatched = [];
  refusals = 0;
  progress = new StartProgress();
  origin = await startOrigin(repository);
  // Kept attempts, starts and records live in this test's own machine.
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

const attempt = () =>
  makeMe.anAcceptedAttempt
    .requesting(
      makeMe.aLaunchRequest
        .adHoc()
        .withPolicy({ workspace: "default-checkout", landing: "auto-land" })
        .please(),
    )
    .acceptedAt(new Date().toISOString())
    .please();

const run = (kept: ReturnType<typeof attempt>): Promise<LaunchResult> => {
  const note = () => Promise.resolve();
  return attemptRun(
    source,
    {
      request: kept.request,
      attempt: kept,
      controller: new AbortController(),
      changes: 0,
    },
    note,
    note,
    note,
    { progress, doneMarks: marks, native },
  );
};

test("a kept execution checkout start asks about changes made since, then continues there without a second start", async () => {
  const starts = recordStarts(origin);
  const before = await originMain();
  refusals = 1;
  const kept = attempt();
  expect(await run(kept)).toMatchObject({
    kind: "failed",
    sessionStartKept: true,
  });
  const session = executionCheckoutSession(origin.project, "auto-land", before);
  expect(keptSessionStarts(origin)[kept.id]).toMatchObject({
    workspace: origin.project,
    branch: "main",
    session,
  });

  const firstStarts = starts();
  const note = path.join(origin.project, "note.txt");
  writeFileSync(note, "later\n");
  expect(
    await preContinuationAnswer(source, kept.id, kept.request, progress),
  ).toMatchObject({ kind: "existing-changes" });
  rmSync(note);
  expect(
    await preContinuationAnswer(source, kept.id, kept.request, progress),
  ).toBeUndefined();

  expect(await run(kept)).toMatchObject({
    kind: "launched",
    record: { establishedSession: session },
  });
  expect(dispatched).toHaveLength(2);
  expect(dispatched[1]?.request).not.toHaveProperty("instruction");
  // Continue ran no installed start of its own.
  expect(starts()).toEqual(firstStarts);
  expect(worktrees(origin.project)).toEqual([]);
  expect(keptSessionStarts(origin)).toEqual({});
});

test("a start that stops before establishment keeps nothing and says so in the session's words", async () => {
  git(origin.project, "switch", "-qc", "topic");

  expect(await run(attempt())).toMatchObject({
    kind: "failed",
    reason: "start-refused",
    explanation: expect.stringMatching(
      /^The workspace could not be set up: .*on branch topic, not the target branch main.* Nothing was launched\.$/,
    ) as unknown,
  });
  expect(keptSessionStarts(origin)).toEqual({});
  expect(dispatched).toEqual([]);
});

test("a start that answers nothing readable launches nothing and publishes nothing", async () => {
  // Published, so the execution checkout stays clean and level with origin.
  writeFileSync(
    installedSkillPath(
      "claude",
      { path: origin.project, shown: origin.project },
      "dough-execute-plan",
      "scripts",
      "execution-start.mjs",
    ),
    "\n",
  );
  git(origin.project, "commit", "-qam", "install an unreadable start");
  git(origin.project, "push", "-q", "origin", "main");
  const before = await originMain();

  expect(await run(attempt())).toMatchObject({
    kind: "failed",
    reason: "start-refused",
    explanation:
      "The start command gave no result this dashboard could read. A session's start publishes nothing. Nothing was launched.",
  });
  expect(keptSessionStarts(origin)).toEqual({});
  expect(dispatched).toEqual([]);
  expect(await originMain()).toBe(before);
});
