// A running launch stays observable as last kept until its replacement finishes.
import assert from "node:assert/strict";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { expect, onTestFinished, test, vi } from "vitest";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import * as completionReporting from "../../server/completionReporting.ts";
import { NativeDoneMarks } from "../../server/doneMarks.ts";
import { changedAttempt } from "../../server/launchAttemptChanges.ts";
import { LaunchAttemptOwner } from "../../server/launchAttemptOwner.ts";
import { keptAttempts } from "../../server/launchAttemptStore.ts";
import { launchHost } from "../../server/launchHosts.ts";
import { attemptRun } from "../../server/launchRun.ts";
import * as launchStart from "../../server/launchStart.ts";
import { localFolder, machineFolder } from "../../server/localFolder.ts";
import { machineDashboardPath } from "../../server/machineHome.ts";
import {
  appendConfiguredProject,
  mountProjectConfiguration,
} from "../../server/projectConfiguration.ts";
import { StartProgress } from "../../server/startProgress.ts";
import { startOf } from "../../server/startWorkflows.ts";
import { defaultSessionPolicy } from "../../src/agentLaunch.ts";

type HeldReplacement = {
  readonly field: "reporting" | "outcome";
  readonly reached: Promise<void>;
  readonly reach: () => void;
  readonly released: Promise<void>;
  readonly release: () => void;
};

let attemptWrite:
  | {
      readonly file: string;
      readonly holds: HeldReplacement[];
    }
  | undefined;

vi.mock(import("node:fs/promises"), async (original) => {
  const fs = await original();
  return {
    ...fs,
    rename: async (from, to) => {
      const write = attemptWrite;
      const hold = write?.holds[0];
      if (write?.file === to && hold !== undefined) {
        const contents = await fs.readFile(from, "utf8");
        if (contents.includes(`"${hold.field}":`)) {
          write.holds.shift();
          hold.reach();
          await hold.released;
        }
      }
      await fs.rename(from, to);
    },
  };
});

function holdReplacement(field: HeldReplacement["field"]): HeldReplacement {
  let reach = () => {};
  let release = () => {};
  const reached = new Promise<void>((resolve) => {
    reach = resolve;
  });
  const released = new Promise<void>((resolve) => {
    release = resolve;
  });
  return { field, reached, reach, released, release };
}

test("keeps the running answer visible through reporting and outcome replacement", async () => {
  const story = { identity: "SEED-001#kept-first", title: "Keep a launch" };
  const source = makeMe.aPublishedSource.openDough.please();
  const request = makeMe.aLaunchRequest
    .executing({ ...story, source: source.id })
    .please();
  const reportingOrigin = "http://127.0.0.1:4173";
  const home = mkdtempSync(path.join(tmpdir(), "dough-kept-first-"));
  const owner = new LaunchAttemptOwner();
  const reportingWrite = holdReplacement("reporting");
  const outcomeWrite = holdReplacement("outcome");
  onTestFinished(async () => {
    reportingWrite.release();
    outcomeWrite.release();
    owner.close();
    try {
      await owner.drain();
    } finally {
      attemptWrite = undefined;
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
  attemptWrite = {
    file: machineDashboardPath("launch-attempts.json"),
    holds: [reportingWrite, outcomeWrite],
  };

  const workspace = localFolder(home);
  const workflow = startOf("execution");
  const { start, session } = makeMe.aLaunchRecord
    .executing(story)
    .onStoryBranch({ workspace: workspace.shown, branch: "claude/kept-first" })
    .inClaudeSession({ sessionId: "kept-first-session" })
    .please();
  assert(start !== undefined && "publishedSha" in start);
  assert(workflow !== undefined);
  vi.spyOn(launchStart, "started").mockResolvedValue({
    kind: "established",
    workflow,
    policy: defaultSessionPolicy,
    handoff: { established: { start } },
    workspace,
  });
  vi.spyOn(completionReporting, "reportingContext").mockImplementation(
    (attempt) =>
      Promise.resolve({
        reporting: {
          origin: reportingOrigin,
          reference: attempt.id,
          command: "report completion",
        },
      }),
  );
  const host = launchHost("claude");
  assert(host !== undefined);
  const launchNative = vi.spyOn(host, "launch").mockResolvedValue({
    kind: "launched",
    session,
    sessionState: { kind: "unknown" },
  });
  const doneMarks = new NativeDoneMarks({
    terminals: { withAttachment: vi.fn(), endAttachments: vi.fn() },
    hostFor: () => undefined,
    reportingFolder: machineFolder,
  });
  const progress = new StartProgress();

  const accepted = await owner.accept(
    request,
    (...args) => attemptRun(source, ...args, progress, doneMarks),
    reportingOrigin,
  );
  assert.equal(accepted.kind, "accepted");
  const { id, changes } = accepted.attempt;
  assert(changes !== undefined);
  const readChange = () => changedAttempt(owner, id, 30_000, changes);
  const published = { kind: "published", revision: start.publishedSha };
  const expectReplacement = ({ field, reached }: HeldReplacement) =>
    Promise.race([
      reached,
      owner.drain().then(async () => {
        const [kept] = (await keptAttempts()) ?? [];
        throw new Error(
          `The attempt settled before its ${field} replacement: ${JSON.stringify(kept?.outcome)}`,
        );
      }),
    ]);

  await expectReplacement(reportingWrite);
  const [keptBeforeReporting] = (await keptAttempts()) ?? [];
  expect(keptBeforeReporting).toMatchObject({ id, publication: published });
  expect(keptBeforeReporting?.reporting).toBeUndefined();
  const whileReporting = await readChange();
  expect(whileReporting).toMatchObject({
    changed: true,
    attempt: { ...keptBeforeReporting, owned: true, running: true },
  });
  expect(whileReporting.attempt?.reporting).toBeUndefined();
  expect(launchNative).not.toHaveBeenCalled();

  reportingWrite.release();
  await expectReplacement(outcomeWrite);
  const [keptBeforeOutcome] = (await keptAttempts()) ?? [];
  expect(keptBeforeOutcome?.reporting?.reference).toBe(id);
  expect(keptBeforeOutcome?.outcome).toBeUndefined();
  const whileSettling = await readChange();
  expect(whileSettling).toMatchObject({
    changed: true,
    attempt: { ...keptBeforeOutcome, owned: true, running: true },
  });
  expect(whileSettling.attempt?.outcome).toBeUndefined();
  expect(launchNative).toHaveBeenCalledTimes(1);
  expect(launchNative.mock.calls[0]?.[1].reporting?.reference).toBe(id);

  outcomeWrite.release();
  await owner.drain();
  const [keptSettled] = (await keptAttempts()) ?? [];
  expect(keptSettled?.outcome).toEqual({
    kind: "launched",
    session: { host: "claude", sessionId: session.sessionId },
  });
  expect(await readChange()).toEqual({
    changed: true,
    attempt: { ...keptSettled, owned: false, running: false },
  });
});
