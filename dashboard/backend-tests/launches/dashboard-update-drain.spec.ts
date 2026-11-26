// An update drain closes launch admission and waits for the accepted launch's
// published start, native confirmation and durable outcome.
import assert from "node:assert/strict";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { expect, onTestFinished, test, vi } from "vitest";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { AgentLaunches } from "../../server/agentLaunches.ts";
import * as baseCi from "../../server/baseCiJudgment.ts";
import * as completionReporting from "../../server/completionReporting.ts";
import { NativeDoneMarks } from "../../server/doneMarks.ts";
import { keptAttempts } from "../../server/launchAttemptStore.ts";
import { launchHost } from "../../server/launchHosts.ts";
import { keptRecords } from "../../server/launchRecordStore.ts";
import * as launchStart from "../../server/launchStart.ts";
import { localFolder, machineFolder } from "../../server/localFolder.ts";
import { machineDashboardPath } from "../../server/machineHome.ts";
import {
  appendConfiguredProject,
  mountProjectConfiguration,
} from "../../server/projectConfiguration.ts";
import { startOf } from "../../server/startWorkflows.ts";
import { defaultSessionPolicy } from "../../src/agentLaunch.ts";

type Hold = {
  readonly reached: Promise<void>;
  readonly reach: () => void;
  readonly released: Promise<void>;
  readonly release: () => void;
};

// Attempt-file replacements held, in order, until the one containing `field`.
let heldWrites:
  { readonly file: string; readonly holds: [string, Hold][] } | undefined;

vi.mock(import("node:fs/promises"), async (original) => {
  const fs = await original();
  return {
    ...fs,
    rename: async (from, to) => {
      const writes = heldWrites;
      const [field, hold] = writes?.holds[0] ?? [];
      if (writes?.file === to && hold !== undefined) {
        const contents = await fs.readFile(from, "utf8");
        if (contents.includes(`"${field}":`)) {
          writes.holds.shift();
          hold.reach();
          await hold.released;
        }
      }
      await fs.rename(from, to);
    },
  };
});

function hold(): Hold {
  let reach = () => {};
  let release = () => {};
  const reached = new Promise<void>((resolve) => {
    reach = resolve;
  });
  const released = new Promise<void>((resolve) => {
    release = resolve;
  });
  return { reached, reach, released, release };
}

test("update drain closes admission and waits through published start and durable native confirmation", async () => {
  const story = { identity: "SEED-001#update-drain", title: "Drain a launch" };
  const source = makeMe.aPublishedSource.openDough.please();
  const request = makeMe.aLaunchRequest
    .executing({ ...story, source: source.id })
    .please();
  const home = mkdtempSync(path.join(tmpdir(), "dough-update-drain-"));
  const admission = hold();
  const publication = hold();
  const confirmation = hold();
  const outcomeWrite = hold();
  const marks = new NativeDoneMarks({
    terminals: { withAttachment: vi.fn(), endAttachments: vi.fn() },
    hostFor: () => undefined,
    reportingFolder: machineFolder,
  });
  const launches = new AgentLaunches(marks);
  onTestFinished(async () => {
    for (const each of [admission, publication, confirmation, outcomeWrite])
      each.release();
    launches.close();
    try {
      await launches.drain();
      await marks.close();
    } finally {
      heldWrites = undefined;
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
  heldWrites = {
    file: machineDashboardPath("launch-attempts.json"),
    holds: [
      ["request", admission],
      ["outcome", outcomeWrite],
    ],
  };

  const workspace = localFolder(home);
  const workflow = startOf("execution");
  const { start, session } = makeMe.aLaunchRecord
    .executing(story)
    .onStoryBranch({ workspace: workspace.shown, branch: "claude/drain" })
    .inClaudeSession({ sessionId: "drain-session" })
    .please();
  assert(start !== undefined && "publishedSha" in start);
  assert(workflow !== undefined);
  vi.spyOn(baseCi, "judgeBranchCi").mockResolvedValue({
    state: "pass",
    revision: start.publishedSha,
    subject: "Drained base",
    laterWithoutResult: 0,
  });
  const established = vi
    .spyOn(launchStart, "started")
    .mockImplementation(async () => {
      publication.reach();
      await publication.released;
      return {
        kind: "established",
        workflow,
        policy: defaultSessionPolicy,
        handoff: { established: { start } },
        workspace,
      };
    });
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
  const host = launchHost("claude");
  assert(host !== undefined);
  const launchNative = vi.spyOn(host, "launch").mockImplementation(async () => {
    confirmation.reach();
    await confirmation.released;
    return { kind: "launched", session, sessionState: { kind: "unknown" } };
  });

  const acceptance = launches.accept(source, request, "http://127.0.0.1:4173");
  await admission.reached;
  let drained = false;
  const drain = launches.drain().then(() => {
    drained = true;
  });
  await expect(launches.accept(source, request)).rejects.toMatchObject({
    status: 503,
  });
  admission.release();
  const accepted = await acceptance;
  assert.equal(accepted.kind, "accepted");
  const { id } = accepted.attempt;
  await expect(launches.continueAttempt(source, id)).rejects.toMatchObject({
    status: 503,
  });

  await publication.reached;
  expect(drained).toBe(false);
  publication.release();
  await confirmation.reached;
  expect(drained).toBe(false);
  confirmation.release();
  await outcomeWrite.reached;
  expect(drained).toBe(false);
  expect((await keptAttempts())?.[0]?.outcome).toBeUndefined();
  outcomeWrite.release();

  await drain;
  const kept = (await keptAttempts()) ?? [];
  expect(kept.find((attempt) => attempt.id === id)?.outcome).toEqual({
    kind: "launched",
    session: { host: "claude", sessionId: session.sessionId },
  });
  expect(await keptRecords(source.id)).toHaveLength(1);
  expect(established).toHaveBeenCalledTimes(1);
  expect(launchNative).toHaveBeenCalledTimes(1);
});
