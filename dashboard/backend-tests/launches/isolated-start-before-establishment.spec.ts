// An isolated session start that stops before establishment launches
// nothing. A definite stop keeps nothing, so a later Start chooses its
// workspace afresh; a start whose result is unreadable after it began keeps
// its workspace, branch and original claim (../../server/sessionStartStore.ts),
// and Continue runs the start again there. The attempt run
// (../../server/launchRun.ts) runs the installed start against a real bare
// origin and dispatches through a recording native collaborator, and the same
// attempt run again is its Continue. A start kept after establishment:
// ./isolated-start-after-establishment.spec.ts. Execution checkout:
// ./execution-checkout-start-stops.spec.ts. The page's recovery:
// ../../../e2e/launches/agent-launch-start-session-recovery.spec.ts.
import path from "node:path";
import { afterEach, beforeAll, beforeEach, expect, test, vi } from "vitest";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { queuedReadyRepository } from "../../../Distribution/tests/support/queued-repository.mjs";
import { NativeDoneMarks } from "../../server/doneMarks.ts";
import { attemptRun } from "../../server/launchRun.ts";
import { machineFolder } from "../../server/localFolder.ts";
import type { NativeDispatch } from "../../server/nativeSessionRun.ts";
import { mountProjectConfiguration } from "../../server/projectConfiguration.ts";
import { StartProgress } from "../../server/startProgress.ts";
import type {
  LaunchResult,
  RecordedLaunchRequest,
} from "../../src/agentLaunch.ts";
import { isolatedAdmissionFlags } from "../../test-support/support/isolatedSessionAdmissionProof.ts";
import {
  dirty,
  status,
} from "../../test-support/support/executionCheckoutChanges.ts";
import {
  holdStarts,
  keptSessionStarts,
} from "../../test-support/support/keptSessionStart.ts";
import {
  startOrigin,
  type StartOrigin,
} from "../../test-support/support/startOrigin.ts";
import { keepStartedOrigin } from "../../test-support/support/startOriginPreparation.ts";
import {
  git,
  isolatedSession,
  recordStarts,
  worktree,
  worktrees,
} from "../../test-support/support/startSessionLanding.ts";

const source = makeMe.aPublishedSource.openDough.please();
const repository = queuedReadyRepository().please();

let origin: StartOrigin;
let unmount: () => void;
let marks: NativeDoneMarks;
let dispatched: RecordedLaunchRequest[];

// Records each native dispatch and opens it.
const native: NativeDispatch = () => ({
  launch(...[, request]) {
    dispatched.push(request);
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

const attemptFor = (landing: "review" | "auto-land") =>
  makeMe.anAcceptedAttempt
    .requesting(
      makeMe.aLaunchRequest
        .adHoc()
        .withInstruction("Session")
        .withPolicy({ workspace: "isolated", landing })
        .please(),
    )
    .acceptedAt(new Date().toISOString())
    .please();

const run = (
  attempt: ReturnType<typeof attemptFor>,
  noteWorker: (worker: { readonly pid: number }) => Promise<void> = () =>
    Promise.resolve(),
): Promise<LaunchResult> => {
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
    noteWorker,
    { progress: new StartProgress(), doneMarks: marks, native },
  );
};

test("a start that stops before any workspace existed keeps nothing, and a later Start chooses its workspace afresh", async () => {
  const starts = recordStarts(origin);
  const before = await originMain();
  // The origin cannot be fetched, so the start stops before a workspace.
  const remote = git(origin.project, "config", "--get", "remote.origin.url");
  git(origin.project, "remote", "set-url", "origin", `${origin.origin}-gone`);

  expect(await run(attemptFor("review"))).toMatchObject({
    kind: "failed",
    reason: "start-refused",
    explanation: expect.stringMatching(/Nothing was launched\.$/) as unknown,
  });
  expect(worktrees(origin.project)).toEqual([]);
  expect(keptSessionStarts(origin)).toEqual({});
  expect(dispatched).toEqual([]);
  expect(await originMain()).toBe(before);

  // Another host's branch has taken the slug since.
  git(origin.project, "remote", "set-url", "origin", remote);
  git(origin.project, "branch", "codex/session");
  const later = await run(attemptFor("review"));
  const revision = await originMain();
  const session = isolatedSession(
    origin.project,
    "session-2",
    "review",
    revision,
  );
  expect(later).toMatchObject({
    kind: "launched",
    record: { establishedSession: session },
  });
  expect(starts().map(({ argv }) => argv)).toEqual([
    expect.arrayContaining(isolatedAdmissionFlags(origin.project, "session-2")),
  ]);
  expect(worktrees(origin.project)).toEqual(["session-2"]);
  expect(keptSessionStarts(origin)).toEqual({});
});

for (const when of ["before", "after"] as const) {
  const made = when === "after";
  test(`a start stopped ${when} it made its worktree is resumed by Continue in the kept workspace and branch`, async () => {
    const starts = recordStarts(origin);
    const hold = holdStarts(origin, when);
    const attempt = attemptFor("review");
    const workers: number[] = [];
    const stopping = run(attempt, (worker) => {
      workers.push(worker.pid);
      return Promise.resolve();
    });
    await vi.waitFor(
      () => {
        expect(hold.reached()).toBe(true);
      },
      { timeout: 30_000 },
    );
    expect(worktrees(origin.project)).toEqual(made ? ["session"] : []);
    // The held start worker dies before it answers.
    process.kill(workers.at(-1) ?? 0, "SIGKILL");
    hold.release();
    expect(await stopping).toMatchObject({
      kind: "failed",
      reason: "start-refused",
      sessionStartKept: true,
      explanation: expect.stringMatching(
        /^The start command gave no result this dashboard could read, so the story may or may not be Taken\. .*Nothing was launched\./,
      ) as unknown,
    });
    // The original claim guards the retry: its draft identity is kept.
    const kept = keptSessionStarts(origin)[attempt.id];
    expect(kept).toMatchObject({
      workspace: worktree(origin.project, "session"),
      branch: "claude/session",
      claim: { draft: { identity: expect.any(String) as unknown } },
    });
    expect(kept).not.toHaveProperty("session");
    const claim = kept?.["claim"] as { draft: { identity: string } };
    expect(dispatched).toEqual([]);
    // An isolated recovery leaves execution checkout's changes unasked.
    dirty(origin.project);
    const changes = status(origin.project);

    const launched = await run(attempt);
    const revision = await originMain();
    const session = isolatedSession(
      origin.project,
      "session",
      "review",
      revision,
    );
    expect(launched).toMatchObject({
      kind: "launched",
      record: { establishedSession: session },
    });
    const startsForWorkspace = isolatedAdmissionFlags(
      origin.project,
      "session",
    );
    expect(starts().map(({ argv }) => argv)).toEqual([
      expect.arrayContaining(startsForWorkspace),
      expect.arrayContaining(
        made
          ? [...startsForWorkspace, "--candidate-sha", revision]
          : startsForWorkspace,
      ),
    ]);
    expect(worktrees(origin.project)).toEqual(["session"]);
    expect(dispatched).toEqual([
      expect.objectContaining({ storyIdentity: claim.draft.identity }),
    ]);
    expect(keptSessionStarts(origin)).toEqual({});
    expect(status(origin.project)).toBe(changes);
  });
}
