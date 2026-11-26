// An isolated session start kept after establishment
// (../../server/sessionStartStore.ts) is resumed by Continue in its workspace,
// branch and landing choice without a second installed start. The attempt run
// (../../server/launchRun.ts) runs the installed start against a real bare
// origin and dispatches through a recording native collaborator, and the same
// attempt run again is its Continue. A start that stops before establishment:
// ./isolated-start-before-establishment.spec.ts. Execution checkout:
// ./execution-checkout-start-stops.spec.ts. The page's recovery:
// ../../../e2e/launches/agent-launch-start-session-failed.spec.ts and
// ../../../e2e/launches/agent-launch-start-session-recovery.spec.ts.
import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { afterEach, beforeAll, beforeEach, expect, test, vi } from "vitest";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { queuedReadyRepository } from "../../../Distribution/tests/support/queued-repository.mjs";
import { installedSkillPath } from "../../server/launchHosts.ts";
import { attemptRun } from "../../server/launchRun.ts";
import type { NativeDispatch } from "../../server/nativeSessionRun.ts";
import { OwnedAttempts } from "../../server/ownedAttempts.ts";
import { mountProjectConfiguration } from "../../server/projectConfiguration.ts";
import { StartProgress } from "../../server/startProgress.ts";
import type {
  LaunchResult,
  RecordedLaunchRequest,
} from "../../src/agentLaunch.ts";
import { isolatedAdmissionFlags } from "../../test-support/support/isolatedSessionAdmissionProof.ts";
import { keptSessionStarts } from "../../test-support/support/keptSessionStart.ts";
import {
  startOrigin,
  type StartOrigin,
} from "../../test-support/support/startOrigin.ts";
import { keepStartedOrigin } from "../../test-support/support/startOriginPreparation.ts";
import {
  git,
  isolatedSession,
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
let dispatched: Dispatched[];
let refusals: number;

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
  origin = await startOrigin(repository);
  // Kept attempts, starts and records live in this test's own machine.
  vi.stubEnv("HOME", path.join(origin.machine, "home"));
  unmount = mountProjectConfiguration("production");
});

afterEach(() => {
  unmount();
  vi.unstubAllEnvs();
  origin.cleanup();
});

const formatterPath = () =>
  installedSkillPath(
    "claude",
    { path: origin.project, shown: origin.project },
    "dough-execute-plan",
    "scripts",
    "established-session.mjs",
  );

const isolatedAttempt = (landing: "review" | "auto-land") =>
  makeMe.anAcceptedAttempt
    .adHocStart({ workspace: "isolated", landing }, { instruction: "Session" })
    .please();

const run = (
  attempt: ReturnType<typeof isolatedAttempt>,
): Promise<LaunchResult> => {
  return attemptRun(source, new OwnedAttempts().own(attempt.request, attempt), {
    progress: new StartProgress(),
    doneMarks: { reported: vi.fn() },
    native,
  });
};

test("a native stop keeps the established start, and Continue resumes its workspace, branch, landing and input", async () => {
  const starts = recordStarts(origin);
  const before = await originMain();
  refusals = 1;
  const attempt = isolatedAttempt("auto-land");

  expect(await run(attempt)).toMatchObject({
    kind: "failed",
    reason: "refused",
    sessionStartKept: true,
    explanation: expect.stringContaining(
      "The established start was kept in workspace ~/git/open-dough/.worktrees/session on branch claude/session",
    ) as unknown,
  });
  const revision = await originMain();
  expect(revision).not.toBe(before);
  const session = isolatedSession(
    origin.project,
    "session",
    "auto-land",
    revision,
  );
  expect(keptSessionStarts(origin)[attempt.id]?.["session"]).toEqual(session);

  expect(await run(attempt)).toMatchObject({
    kind: "launched",
    record: { establishedSession: session },
  });
  const [refused, resumed] = dispatched;
  expect(dispatched).toHaveLength(2);
  expect(resumed?.established).toMatchObject({
    handoff: { established: { establishedSession: session } },
    publication: { kind: "published", revision },
  });
  // The same story, input and policy reach the resumed effect.
  expect(resumed?.request).toEqual(refused?.request);
  expect(resumed?.request).toMatchObject({
    instruction: "Session",
    storyIdentity: expect.any(String) as unknown,
    policy: { workspace: "isolated", landing: "auto-land" },
  });
  expect(starts().map(({ argv }) => argv)).toEqual([
    expect.arrayContaining(isolatedAdmissionFlags(origin.project, "session")),
  ]);
  expect(worktrees(origin.project)).toEqual(["session"]);
  expect(keptSessionStarts(origin)).toEqual({});
  expect(await originMain()).toBe(revision);
});

test("a formatter stop keeps the established workspace, and once repaired Continue launches without a second start", async () => {
  const starts = recordStarts(origin);
  const formatter = readFileSync(formatterPath(), "utf8");
  // Published, so the execution checkout stays clean and level with origin.
  writeFileSync(formatterPath(), "export {\n");
  git(origin.project, "commit", "-qam", "install a broken formatter");
  git(origin.project, "push", "-q", "origin", "main");
  const attempt = isolatedAttempt("review");

  expect(await run(attempt)).toMatchObject({
    kind: "failed",
    reason: "start-refused",
    sessionStartKept: true,
    explanation: expect.stringContaining(
      "The session's place was established, but the installed skill's formatter could not be read, so no session was started. The Taken story was published.",
    ) as unknown,
  });
  const revision = await originMain();
  const session = isolatedSession(
    origin.project,
    "session",
    "review",
    revision,
  );
  expect(keptSessionStarts(origin)[attempt.id]?.["session"]).toEqual(session);
  expect(dispatched).toEqual([]);

  // Repaired in place: an isolated Continue asks nothing of execution checkout.
  writeFileSync(formatterPath(), formatter);
  expect(await run(attempt)).toMatchObject({
    kind: "launched",
    record: { establishedSession: session },
  });
  expect(dispatched).toHaveLength(1);
  expect(starts().map(({ argv }) => argv)).toEqual([
    expect.arrayContaining(isolatedAdmissionFlags(origin.project, "session")),
  ]);
  expect(worktrees(origin.project)).toEqual(["session"]);
  expect(keptSessionStarts(origin)).toEqual({});
});
