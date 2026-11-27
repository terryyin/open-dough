// An admitted ad hoc Start opens its native session only after the installed
// start's admission verified the Taken story it actually published to the bare
// origin. The attempt run (../../server/launchRun.ts) dispatches through a
// recording native collaborator, so a held admission, an origin mismatch and a
// lost publication reply are each read against the dispatches it made. A claim
// lost to a competitor is ./admitted-session-competing-claim.spec.ts. Real cwd,
// one worktree and first input stay with
// ../../../e2e/launches/agent-launch-start-session-isolated.spec.ts.
import { execFile } from "node:child_process";
import path from "node:path";
import { promisify } from "node:util";
import { afterEach, beforeAll, beforeEach, expect, test, vi } from "vitest";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { queuedReadyRepository } from "../../../Distribution/tests/support/queued-repository.mjs";
import { attemptRun, type AttemptRunServices } from "../../server/launchRun.ts";
import type { NativeDispatch } from "../../server/nativeSessionRun.ts";
import { OwnedAttempts } from "../../server/ownedAttempts.ts";
import { mountProjectConfiguration } from "../../server/projectConfiguration.ts";
import { StartProgress } from "../../server/startProgress.ts";
import type {
  LaunchResult,
  PublicationReceipt,
  RecordedLaunchRequest,
} from "../../src/agentLaunch.ts";
import { admittedStory } from "../../test-support/support/isolatedSessionAdmissionProof.ts";
import { keptSessionStarts } from "../../test-support/support/keptSessionStart.ts";
import {
  startOrigin,
  type StartOrigin,
} from "../../test-support/support/startOrigin.ts";
import { keepStartedOrigin } from "../../test-support/support/startOriginPreparation.ts";
import { worktree } from "../../test-support/support/startSessionLanding.ts";

const exec = promisify(execFile);
const source = makeMe.aPublishedSource.openDough.please();
const repository = queuedReadyRepository().please();
const workspaces = [
  {
    workspace: "isolated",
    openedIn: (project: string) => worktree(project, "held-admission"),
  },
  { workspace: "default-checkout", openedIn: (project: string) => project },
] as const;
type Workspace = (typeof workspaces)[number]["workspace"];

type Dispatched = {
  readonly request: RecordedLaunchRequest;
  readonly cwd: string | undefined;
  readonly originMain: string;
};

let origin: StartOrigin;
let unmount: () => void;
let dispatched: Dispatched[];
let runs: Promise<LaunchResult>[];

// Records each native dispatch with the origin trunk it saw, and opens it.
const native: NativeDispatch = () => ({
  async launch(...[, request, , , established]) {
    dispatched.push({
      request,
      cwd: established?.workspace.path,
      originMain: await originMain(),
    });
    return {
      kind: "launched",
      session: makeMe.aHostSession.claude({ sessionId: "claude-1" }).please(),
      sessionState: makeMe.aSessionState.loaded("working").please(),
    };
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
  runs = [];
  origin = await startOrigin(repository);
  // Kept attempts, starts and records live in this test's own machine.
  vi.stubEnv("HOME", path.join(origin.machine, "home"));
  unmount = mountProjectConfiguration("production");
});

afterEach(async () => {
  await Promise.allSettled(runs);
  unmount();
  vi.unstubAllEnvs();
  origin.cleanup();
});

const attemptFor = (title: string, workspace: Workspace) =>
  makeMe.anAcceptedAttempt
    .adHocStart({ workspace, landing: "review" }, { instruction: title })
    .please();

function run(
  attempt: ReturnType<typeof attemptFor>,
  notes: AttemptRunServices["notes"] = {},
) {
  const running = attemptRun(
    source,
    new OwnedAttempts().own(attempt.request, attempt),
    {
      progress: new StartProgress(),
      doneMarks: { reported: vi.fn() },
      native,
      notes,
    },
  );
  runs.push(running);
  return running;
}

for (const { workspace, openedIn } of workspaces) {
  test(`a ${workspace} Start dispatches nothing while its admission is held and then opens on the published Taken story`, async () => {
    const title = "Held admission";
    const before = await originMain();
    const hold = origin.holdPushes();
    const result = run(attemptFor(title, workspace));

    try {
      await hold.whenHeld();
      expect(dispatched).toEqual([]);
      expect(await originMain()).toBe(before);
    } finally {
      hold.release();
    }

    expect(await result).toMatchObject({ kind: "launched" });
    const published = await admittedStory(origin, title);
    expect(dispatched).toEqual([
      {
        request: expect.objectContaining({
          storyIdentity: published.identity,
        }) as unknown,
        cwd: openedIn(origin.project),
        originMain: published.revision,
      },
    ]);
  });

  test(`a ${workspace} Start whose checkout publishes to another repository opens no native session`, async () => {
    await exec("git", [
      "-C",
      origin.project,
      "remote",
      "set-url",
      "origin",
      "https://github.com/another-owner/elsewhere.git",
    ]);
    const before = await originMain();

    expect(
      await run(attemptFor("Mismatched admission", workspace)),
    ).toMatchObject({
      kind: "failed",
      reason: "start-refused",
      explanation: expect.stringContaining(
        "where this story would be published. Nothing was launched.",
      ) as unknown,
    });
    expect(dispatched).toEqual([]);
    expect(await originMain()).toBe(before);
  });

  test(`a ${workspace} Start whose publication reply was lost reconciles that claim on Continue`, async () => {
    const title = "Retry admission";
    const attempt = attemptFor(title, workspace);
    const lost = await run(attempt, {
      publication: () =>
        Promise.reject(new Error("Cannot write the publication receipt")),
    });
    const published = await admittedStory(origin, title);

    expect(lost).toMatchObject({
      kind: "failed",
      reason: "unrecorded",
      explanation: expect.stringContaining(published.revision) as unknown,
    });
    expect(keptSessionStarts(origin)[attempt.id]).toMatchObject({
      claim: { publishedSha: published.revision },
    });
    expect(dispatched).toEqual([]);

    const noted = vi.fn<(receipt: PublicationReceipt) => Promise<void>>(() =>
      Promise.resolve(),
    );
    expect(await run(attempt, { publication: noted })).toMatchObject({
      kind: "launched",
    });
    expect(noted).toHaveBeenCalledWith({
      kind: "published",
      identity: published.identity,
      revision: published.revision,
    });
    expect(await originMain()).toBe(published.revision);
    expect(dispatched).toEqual([
      expect.objectContaining({ originMain: published.revision }),
    ]);
  });
}
