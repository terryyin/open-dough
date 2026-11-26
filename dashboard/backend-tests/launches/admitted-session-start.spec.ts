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
import { NativeDoneMarks } from "../../server/doneMarks.ts";
import { attemptRun } from "../../server/launchRun.ts";
import { machineFolder } from "../../server/localFolder.ts";
import type { NativeDispatch } from "../../server/nativeSessionRun.ts";
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
const workspaces = ["isolated", "default-checkout"] as const;
type Workspace = (typeof workspaces)[number];

type Dispatched = {
  readonly request: RecordedLaunchRequest;
  readonly cwd: string | undefined;
  readonly originMain: string;
};

let origin: StartOrigin;
let unmount: () => void;
let marks: NativeDoneMarks;
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
  marks = new NativeDoneMarks({
    terminals: { withAttachment: vi.fn(), endAttachments: vi.fn() },
    hostFor: () => undefined,
    reportingFolder: machineFolder,
  });
});

afterEach(async () => {
  await Promise.allSettled(runs);
  await marks.close();
  unmount();
  vi.unstubAllEnvs();
  origin.cleanup();
});

const attemptFor = (title: string, workspace: Workspace) =>
  makeMe.anAcceptedAttempt
    .requesting(
      makeMe.aLaunchRequest
        .adHoc()
        .withInstruction(title)
        .withPolicy({ workspace, landing: "review" })
        .please(),
    )
    .acceptedAt(new Date().toISOString())
    .please();

function run(
  attempt: ReturnType<typeof attemptFor>,
  notePublication: (receipt: PublicationReceipt) => Promise<void> = () =>
    Promise.resolve(),
) {
  const note = () => Promise.resolve();
  const running = attemptRun(
    source,
    {
      request: attempt.request,
      attempt,
      controller: new AbortController(),
      changes: 0,
    },
    notePublication,
    note,
    note,
    { progress: new StartProgress(), doneMarks: marks, native },
  );
  runs.push(running);
  return running;
}

const cwdOf = (workspace: Workspace, slug: string) =>
  workspace === "isolated" ? worktree(origin.project, slug) : origin.project;

for (const workspace of workspaces) {
  test(`a ${workspace} Start dispatches nothing while its admission is held and then opens on the published Taken story`, async () => {
    const title = "Held admission";
    const before = await originMain();
    const hold = origin.holdPushes();
    const result = run(attemptFor(title, workspace));

    await vi.waitFor(
      () => {
        expect(hold.isHeld()).toBe(true);
      },
      {
        timeout: 30_000,
      },
    );
    expect(dispatched).toEqual([]);
    expect(await originMain()).toBe(before);
    hold.release();

    expect(await result).toMatchObject({ kind: "launched" });
    const published = await admittedStory(origin, title);
    expect(dispatched).toEqual([
      {
        request: expect.objectContaining({
          storyIdentity: published.identity,
        }) as unknown,
        cwd: cwdOf(workspace, "held-admission"),
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
    const lost = await run(attempt, () =>
      Promise.reject(new Error("Cannot write the publication receipt")),
    );
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
    expect(await run(attempt, noted)).toMatchObject({ kind: "launched" });
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
