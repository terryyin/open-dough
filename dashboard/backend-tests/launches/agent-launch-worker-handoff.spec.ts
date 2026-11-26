// The persisted worker keeps a second owner out before the start script's note
// and between the script's exit and the native worker's replacement.
import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { expect, onTestFinished, test, vi } from "vitest";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import * as completionReporting from "../../server/completionReporting.ts";
import { LaunchAttemptOwner } from "../../server/launchAttemptOwner.ts";
import type { AttemptRun } from "../../server/launchAttemptSettlement.ts";
import type { LaunchHost } from "../../server/launchHosts.ts";
import { attemptRun } from "../../server/launchRun.ts";
import * as launchStart from "../../server/launchStart.ts";
import { localFolder } from "../../server/localFolder.ts";
import { machineDashboardPath } from "../../server/machineHome.ts";
import {
  appendConfiguredProject,
  mountProjectConfiguration,
} from "../../server/projectConfiguration.ts";
import { StartProgress } from "../../server/startProgress.ts";
import { startOf } from "../../server/startWorkflows.ts";
import { defaultSessionPolicy } from "../../src/agentLaunch.ts";

function held() {
  let release = () => {};
  const released = new Promise<void>((resolve) => {
    release = resolve;
  });
  return { released, release };
}

// Holds the attempt-file replacement that records the native worker.
let nativeNote:
  | {
      readonly file: string;
      readonly reach: () => void;
      released: Promise<void>;
    }
  | undefined;

vi.mock(import("node:fs/promises"), async (original) => {
  const fs = await original();
  return {
    ...fs,
    rename: async (from, to) => {
      const hold = nativeNote;
      if (hold?.file === to) {
        const contents = await fs.readFile(from, "utf8");
        if (/"step":\s*"launch"/.test(contents)) {
          nativeNote = undefined;
          hold.reach();
          await hold.released;
        }
      }
      await fs.rename(from, to);
    },
  };
});

test("a live recorded server refuses a second owner before the script note and after the script exits", async () => {
  const story = { identity: "SEED-001#handoff", title: "Hand off a worker" };
  const source = makeMe.aPublishedSource.openDough.please();
  const request = makeMe.aLaunchRequest
    .executing({ ...story, source: source.id })
    .please();
  const home = mkdtempSync(path.join(tmpdir(), "dough-worker-handoff-"));
  const first = new LaunchAttemptOwner();
  const second = new LaunchAttemptOwner();
  const beforeScript = held();
  const afterExit = held();
  let reachNative = () => {};
  const nativeReached = new Promise<void>((resolve) => {
    reachNative = resolve;
  });
  let scriptReached = () => {};
  const scriptHeld = new Promise<void>((resolve) => {
    scriptReached = resolve;
  });
  onTestFinished(async () => {
    beforeScript.release();
    afterExit.release();
    first.close();
    second.close();
    try {
      await first.drain();
    } finally {
      nativeNote = undefined;
      vi.restoreAllMocks();
      vi.unstubAllEnvs();
      rmSync(home, { recursive: true, force: true });
    }
  });
  vi.stubEnv("HOME", home);
  if (process.platform === "win32") vi.stubEnv("USERPROFILE", home);
  onTestFinished(mountProjectConfiguration("development"));
  appendConfiguredProject(
    makeMe.aConfiguredProject.with({ ...source, localPath: home }).please(),
  );
  nativeNote = {
    file: machineDashboardPath("launch-attempts.json"),
    reach: reachNative,
    released: afterExit.released,
  };

  const workspace = localFolder(home);
  const workflow = startOf("execution");
  const { start, session } = makeMe.aLaunchRecord
    .executing(story)
    .onStoryBranch({ workspace: workspace.shown, branch: "claude/handoff" })
    .inClaudeSession({ sessionId: "handoff-session" })
    .please();
  assert(start !== undefined && "publishedSha" in start);
  assert(workflow !== undefined);
  let scriptPid: number | undefined;
  vi.spyOn(launchStart, "started").mockImplementation(
    async (...[, , , , , , , noteWorker]) => {
      scriptReached();
      await beforeScript.released;
      const script = spawn(process.execPath, ["-e", ""], { stdio: "ignore" });
      const exited = new Promise((resolve) => {
        script.once("exit", resolve);
      });
      assert(script.pid !== undefined);
      scriptPid = script.pid;
      await noteWorker?.(script.pid);
      await exited;
      return {
        kind: "established",
        workflow,
        policy: defaultSessionPolicy,
        handoff: { established: { start } },
        workspace,
      };
    },
  );
  vi.spyOn(completionReporting, "reportingContext").mockImplementation(
    (attempt) =>
      Promise.resolve({
        reporting: {
          origin: "http://127.0.0.1:4173",
          reference: attempt.id,
          command: "report completion",
        },
      }),
  );
  const launch = vi.fn<LaunchHost["launch"]>(() =>
    Promise.resolve({
      kind: "launched",
      session,
      sessionState: makeMe.aSessionState.unknown().please(),
    }),
  );
  const recover = vi.fn<NonNullable<LaunchHost["recover"]>>(() => {
    throw new Error("Unexpected recovery.");
  });
  const progress = new StartProgress();
  const run: AttemptRun = (own, notes) =>
    attemptRun(source, own, {
      progress,
      notes,
      doneMarks: { reported: vi.fn() },
      native: () => ({ launch, recover }),
    });
  const competitor = vi.fn<AttemptRun>(() => {
    throw new Error("Unexpected competing dispatch.");
  });

  const accepted = await first.accept(request, run);
  assert.equal(accepted.kind, "accepted");
  const { id } = accepted.attempt;
  const refusesBoth = async (worker: object) => {
    expect((await second.attempts()).attempts).toMatchObject([
      { id, owned: false, running: true, worker },
    ]);
    expect(
      await second.continueAttempt(
        source.id,
        id,
        () => Promise.resolve(undefined),
        competitor,
      ),
    ).toMatchObject({
      kind: "uncertain",
      explanation: expect.stringContaining("already running") as unknown,
    });
    expect(await second.accept(request, competitor)).toMatchObject({
      kind: "failed",
      reason: "already-starting",
    });
  };

  await scriptHeld;
  await refusesBoth({
    pid: process.pid,
    serverPid: process.pid,
    step: "start",
  });
  beforeScript.release();

  await nativeReached;
  assert(scriptPid !== undefined);
  expect(() => process.kill(scriptPid ?? 0, 0)).toThrow();
  await refusesBoth({ pid: scriptPid, serverPid: process.pid, step: "start" });
  expect(launch).not.toHaveBeenCalled();
  afterExit.release();

  await first.drain();
  expect(launch).toHaveBeenCalledTimes(1);
  expect(competitor).not.toHaveBeenCalled();
  const [settled] = (await second.attempts()).attempts;
  expect(settled).toMatchObject({
    id,
    running: false,
    outcome: { kind: "launched" },
  });
  expect(settled?.worker).toBeUndefined();
});
