// An isolated ad hoc Start whose provisional claim loses to a competitor's
// installed admission opens no native session, leaves the competitor intact,
// and drafts a fresh story on Continue. The attempt run
// (../../server/launchRun.ts) dispatches through a recording native
// collaborator. Held, mismatched and lost-reply admissions are
// ./admitted-session-start.spec.ts.
import { execFile } from "node:child_process";
import { chmodSync, existsSync, writeFileSync } from "node:fs";
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
const title = "Retry admission";

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

const accepted = makeMe.anAcceptedAttempt
  .requesting(
    makeMe.aLaunchRequest
      .adHoc()
      .withInstruction(title)
      .withPolicy({ workspace: "isolated", landing: "review" })
      .please(),
  )
  .acceptedAt(new Date().toISOString())
  .please();

const git = async (cwd: string, ...args: string[]) =>
  (await exec("git", ["-C", cwd, ...args])).stdout.trim();

function run() {
  const note = () => Promise.resolve();
  const running = attemptRun(
    source,
    {
      request: accepted.request,
      attempt: accepted,
      controller: new AbortController(),
      changes: 0,
    },
    note,
    note,
    note,
    { progress: new StartProgress(), doneMarks: marks, native },
  );
  runs.push(running);
  return running;
}

// Two installed starts and a rival draft run in sequence past the default.
test(
  "Continue drafts a new story after a competing claim wins the admission",
  { timeout: 30_000 },
  async () => {
    const branch = "claude/retry-admission";
    const workspace = worktree(origin.project, "retry-admission");
    const held = path.join(origin.machine, "contender-held");
    const release = path.join(origin.machine, "contender-released");
    const hooks = path.join(origin.project, ".git", "hooks");
    const hook = path.join(hooks, "pre-push");
    await git(origin.project, "config", "core.hooksPath", hooks);
    writeFileSync(
      hook,
      `#!/bin/sh
if [ "$(git branch --show-current)" = '${branch}' ]; then
  touch '${held}'
  while [ ! -e '${release}' ]; do sleep 0.05; done
fi
`,
    );
    chmodSync(hook, 0o755);
    const first = run();
    try {
      await vi.waitFor(
        () => {
          expect(existsSync(held)).toBe(true);
        },
        {
          timeout: 30_000,
        },
      );
      const losingHead = await git(workspace, "rev-parse", "HEAD");
      const script = path.join(
        origin.project,
        ".claude/skills/dough-execute-plan/scripts/execution-start.mjs",
      );
      const target = ["--repository", origin.project, "--target", "main"];
      const draft = JSON.parse(
        (
          await exec(process.execPath, [
            script,
            "draft",
            ...target,
            "--title",
            "A competing admission",
            "--goal",
            "A competing admission",
          ])
        ).stdout,
      ) as {
        identity: string;
        link: string;
        title: string;
        ownedDraft: unknown;
      };
      await exec(process.execPath, [
        script,
        "start",
        ...target,
        "--workspace",
        path.join(origin.machine, "rival"),
        "--branch",
        "exec/rival",
        "--mode",
        "trunk",
        "--push-authorized",
        "--workspace-authorized",
        "--admit",
        "--identity",
        draft.identity,
        "--link",
        draft.link,
        "--title",
        draft.title,
        "--owned-draft",
        JSON.stringify(draft.ownedDraft),
        "--publisher-id",
        "competing-owner",
      ]);
      const winner = await originMain();
      writeFileSync(release, "");

      expect(await first).toMatchObject({
        kind: "failed",
        reason: "start-refused",
        explanation: expect.stringContaining(
          "Taken by another agent",
        ) as unknown,
      });
      expect(dispatched).toEqual([]);
      expect(await originMain()).toBe(winner);
      expect(keptSessionStarts(origin)[accepted.id]).toMatchObject({
        claim: { retained: { candidateSha: losingHead } },
      });

      expect(await run()).toMatchObject({ kind: "launched" });
      const published = await admittedStory(origin, title);
      expect(published.identity).not.toBe(draft.identity);
      expect((await admittedStory(origin, draft.title)).identity).toBe(
        draft.identity,
      );
      expect((await origin.originGit("rev-parse", "main^")).trim()).toBe(
        winner,
      );
      expect(dispatched).toEqual([
        {
          request: expect.objectContaining({
            storyIdentity: published.identity,
          }) as unknown,
          cwd: workspace,
          originMain: published.revision,
        },
      ]);
      const preserved = `refs/worktree/dough/rejected-admission/${losingHead}`;
      expect(await git(workspace, "rev-parse", preserved)).toBe(losingHead);
    } finally {
      writeFileSync(release, "");
    }
  },
);
