import assert from "node:assert/strict";
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { expect, onTestFinished, test, vi } from "vitest";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { LaunchAttemptOwner } from "../../server/launchAttemptOwner.ts";
import type { AttemptRun } from "../../server/launchAttemptSettlement.ts";
import { keepAttempt, keptAttempts } from "../../server/launchAttemptStore.ts";
import type { LaunchHost } from "../../server/launchHosts.ts";
import { preContinuationAnswer } from "../../server/launchPreAcceptance.ts";
import { keptRecords } from "../../server/launchRecordStore.ts";
import { attemptRun } from "../../server/launchRun.ts";
import { machineDashboardPath } from "../../server/machineHome.ts";
import {
  appendConfiguredProject,
  mountProjectConfiguration,
} from "../../server/projectConfiguration.ts";
import { StartProgress } from "../../server/startProgress.ts";
import type { AgentLaunchRequest } from "../../src/agentLaunch.ts";
import { keepLaunchStore } from "../../test-support/support/launchStore.ts";

const source = makeMe.aPublishedSource.openDough.please();
const story = {
  source: source.id,
  identity: "SEED-052#recover",
  title: "Recover this story",
  host: "codex" as const,
  instruction: "Continue with the original input.",
};
const policy = {
  tracking: "one-shot",
  workspace: "isolated",
  landing: "review",
} as const;

function machine() {
  const home = mkdtempSync(path.join(tmpdir(), "dough-interrupted-attempt-"));
  vi.stubEnv("HOME", home);
  if (process.platform === "win32") vi.stubEnv("USERPROFILE", home);
  const unmount = mountProjectConfiguration("development");
  const owner = new LaunchAttemptOwner();
  onTestFinished(async () => {
    owner.close();
    try {
      await owner.drain();
    } finally {
      unmount();
      vi.unstubAllEnvs();
      rmSync(home, { recursive: true, force: true });
    }
  });
  appendConfiguredProject(
    makeMe.aConfiguredProject.with({ ...source, localPath: home }).please(),
  );
  return { home, owner };
}

test("only the interrupted attempt recovers its original conversation, once, without a second input", async () => {
  const { home, owner } = machine();
  const request = makeMe.aLaunchRequest
    .refining(story)
    .withPolicy(policy)
    .please();
  const acceptedAt = new Date().toISOString();
  // Its worker died before the first input was confirmed.
  const attempt = makeMe.anAcceptedAttempt
    .requesting(request)
    .acceptedAt(acceptedAt)
    .workedBy({ pid: 2147483647, step: "launch", notedAt: acceptedAt })
    .please();
  await keepAttempt(attempt);
  const workspace = path.join(home, "kept-workspace");
  const pending = {
    state: "uncertain",
    instruction: story.instruction,
  } as const;
  const record = makeMe.aLaunchRecord
    .refining(story)
    .onStoryBranch({
      tracking: "one-shot",
      role: policy.workspace,
      landing: policy.landing,
      workspace,
      branch: "codex/story",
    })
    .inCodexSession({
      sessionId: "interrupted-thread",
      continuation: { workspace, endpoint: "unix:///saved-codex.sock" },
    })
    .withFirstInput(pending)
    .launchedAt(acceptedAt)
    .please();
  keepLaunchStore(home, { [source.id]: [record] });

  const confirmed = {
    ...pending,
    state: "confirmed",
    turnId: "original-turn",
  } as const;
  const atRecovery: unknown[] = [];
  const recover = vi.fn<NonNullable<LaunchHost["recover"]>>(
    async (...[kept, , evidence]) => {
      atRecovery.push(await keptRecords(source.id), await keptAttempts());
      await evidence.session(kept.session, confirmed);
      return {
        kind: "launched",
        session: kept.session,
        sessionState: { kind: "unknown" },
      };
    },
  );
  const launch = vi.fn<LaunchHost["launch"]>(() => {
    throw new Error("Unexpected new native launch.");
  });
  const progress = new StartProgress();
  const run = vi.fn<AttemptRun>((own, notes) =>
    attemptRun(source, own, {
      progress,
      notes,
      doneMarks: { reported: vi.fn() },
      native: () => ({ launch, recover }),
    }),
  );
  const before = vi.fn((id: string, kept: AgentLaunchRequest) =>
    preContinuationAnswer(source, id, kept, progress),
  );
  const continuation = (project: string, id: string) =>
    owner.continueAttempt(project, id, (kept) => before(id, kept), run);
  const file = machineDashboardPath("launch-attempts.json");
  const original = readFileSync(file, "utf8");

  expect((await owner.attempts()).attempts).toEqual([
    { ...attempt, running: false, owned: false },
  ]);
  for (const workflow of ["execution", "refinement"] as const) {
    const fresh = makeMe.aLaunchRequest
      .ofWorkflow(workflow, story)
      .withPolicy(policy)
      .please();
    expect(await owner.accept(fresh, run)).toMatchObject({
      kind: "failed",
      reason: "already-starting",
      explanation: expect.stringContaining(
        "was interrupted and needs reconciliation",
      ) as unknown,
    });
  }
  const unknown = "00000000-0000-4000-8000-00000000aaaa";
  for (const [project, id] of [
    [source.id, unknown],
    ["doughnut", attempt.id],
  ] as const) {
    expect(await continuation(project, id)).toMatchObject({
      kind: "failed",
      reason: "refused",
    });
    expect(await owner.reconcile(project, id)).toHaveProperty(
      "kind",
      "refused",
    );
  }
  // Unsettled, it is not noted reconciled either.
  expect(await owner.reconcile(source.id, attempt.id)).toHaveProperty(
    "kind",
    "refused",
  );
  expect(readFileSync(file, "utf8")).toBe(original);
  expect(before).not.toHaveBeenCalled();
  expect(run).not.toHaveBeenCalled();

  expect(await continuation(source.id, attempt.id)).toMatchObject({
    kind: "accepted",
    attempt: { id: attempt.id, acceptedAt, request, owned: true },
  });
  await owner.drain();
  expect(before).toHaveBeenCalledExactlyOnceWith(attempt.id, request);
  // Native recovery received the saved conversation of the original attempt.
  expect(recover).toHaveBeenCalledOnce();
  expect(recover.mock.calls[0]?.[0]).toEqual(record);
  expect(atRecovery).toEqual([
    [record],
    [expect.objectContaining({ id: attempt.id, acceptedAt, request })],
  ]);
  expect(launch).not.toHaveBeenCalled();
  expect(await keptRecords(source.id)).toEqual([
    { ...record, firstInput: confirmed },
  ]);
  const outcome = {
    kind: "launched",
    session: { host: "codex", sessionId: record.session.sessionId },
  };
  expect(await keptAttempts()).toMatchObject([
    { id: attempt.id, acceptedAt, request, outcome },
  ]);

  // Settled, it is no longer continued.
  expect(await continuation(source.id, attempt.id)).toMatchObject({
    kind: "failed",
    reason: "refused",
  });
  expect(run).toHaveBeenCalledOnce();

  // It is noted reconciled once; noting it again changes nothing.
  const noted = await owner.reconcile(source.id, attempt.id);
  assert.equal(noted.kind, "reconciled");
  expect(noted.attempt).toMatchObject({ id: attempt.id, outcome });
  expect(noted.attempt.reconciledAt).toMatch(/\S/);
  const reconciled = readFileSync(file, "utf8");
  expect(await owner.reconcile(source.id, attempt.id)).toEqual(noted);
  expect(readFileSync(file, "utf8")).toBe(reconciled);
});
