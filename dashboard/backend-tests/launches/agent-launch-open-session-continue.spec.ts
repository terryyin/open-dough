import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { expect, onTestFinished, test, vi } from "vitest";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { LaunchAttemptOwner } from "../../server/launchAttemptOwner.ts";
import type { AttemptRun } from "../../server/launchAttemptSettlement.ts";
import { keepAttempt, keptAttempts } from "../../server/launchAttemptStore.ts";
import { preContinuationAnswer } from "../../server/launchPreAcceptance.ts";
import { machineDashboardPath } from "../../server/machineHome.ts";
import {
  appendConfiguredProject,
  mountProjectConfiguration,
} from "../../server/projectConfiguration.ts";
import { StartProgress } from "../../server/startProgress.ts";
import type {
  AgentLaunchRequest,
  LaunchRecord,
} from "../../src/agentLaunch.ts";
import {
  keepLaunchStore,
  launchStoreFile,
} from "../../test-support/support/launchStore.ts";

const source = makeMe.aPublishedSource.openDough.please();
const story = {
  source: source.id,
  identity: "SEED-052#open",
  title: "Open story",
};
const request = makeMe.aLaunchRequest.refining(story).please();

function continuation() {
  const home = mkdtempSync(path.join(tmpdir(), "dough-open-continue-"));
  const owner = new LaunchAttemptOwner();
  vi.stubEnv("HOME", home);
  if (process.platform === "win32") vi.stubEnv("USERPROFILE", home);
  const unmount = mountProjectConfiguration("development");
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
  const progress = new StartProgress();
  const before = vi.fn((id: string, request: AgentLaunchRequest) =>
    preContinuationAnswer(source, id, request, progress),
  );
  const run = vi.fn<AttemptRun>(() => {
    throw new Error("Unexpected launch dispatch.");
  });
  return {
    home,
    before,
    run,
    continueAttempt: (id: string) =>
      owner.continueAttempt(
        source.id,
        id,
        (request) => before(id, request),
        run,
      ),
  };
}

test("refuses Continue for a different workflow's open session of the same story", async () => {
  const boundary = continuation();
  const when = new Date();
  const attempt = makeMe.anAcceptedAttempt
    .requesting(request)
    .acceptedAt(when.toISOString())
    .ended({
      kind: "uncertain",
      reason: "timed-out",
      explanation: "The launch wait expired.",
    })
    .settledAt(when.toISOString())
    .please();
  await keepAttempt(attempt);
  const open = makeMe.aLaunchRecord
    .executing(story)
    .launchedAt(new Date(when.getTime() + 1).toISOString())
    .please();
  const records = keepLaunchStore(boundary.home, { [source.id]: [open] });
  const attemptFile = machineDashboardPath("launch-attempts.json");
  const before = readFileSync(attemptFile, "utf8");

  expect(await boundary.continueAttempt(attempt.id)).toMatchObject({
    kind: "failed",
    reason: "session-open",
  });
  expect(boundary.before).toHaveBeenCalledExactlyOnceWith(attempt.id, request);
  expect(boundary.run).not.toHaveBeenCalled();
  expect(readFileSync(attemptFile, "utf8")).toBe(before);
  expect(readFileSync(launchStoreFile(boundary.home), "utf8")).toBe(records);
});

test.each([
  {
    state: "interrupted",
    arrange: (attempt: typeof makeMe.anAcceptedAttempt, at: string) =>
      attempt
        .workedBy({ pid: 2147483647, step: "launch", notedAt: at })
        .slowSince(at),
  },
  {
    state: "launched with publication unknown",
    arrange: (
      attempt: typeof makeMe.anAcceptedAttempt,
      at: string,
      session: LaunchRecord["session"],
    ) => attempt.launched(session).settledAt(at),
  },
])(
  "Continue settles its own confirmed session when $state without dispatch",
  async ({ arrange }) => {
    const boundary = continuation();
    const when = new Date();
    const record = makeMe.aLaunchRecord
      .refining(story)
      .launchedAt(new Date(when.getTime() + 1).toISOString())
      .withFirstInput({ state: "confirmed" })
      .please();
    const at = when.toISOString();
    const attempt = arrange(
      makeMe.anAcceptedAttempt
        .requesting(request)
        .acceptedAt(at)
        .publicationUnknown(),
      at,
      record.session,
    ).please();
    await keepAttempt(attempt);
    const records = keepLaunchStore(boundary.home, { [source.id]: [record] });
    const outcome = {
      kind: "launched",
      session: {
        host: record.session.host,
        sessionId: record.session.sessionId,
      },
    };

    expect(await boundary.continueAttempt(attempt.id)).toMatchObject({
      kind: "accepted",
      attempt: {
        id: attempt.id,
        request,
        outcome,
        owned: false,
        running: false,
      },
    });
    const [settled] = (await keptAttempts()) ?? [];
    expect(settled).toMatchObject({
      id: attempt.id,
      acceptedAt: attempt.acceptedAt,
      outcome,
    });
    expect(settled?.settledAt).toMatch(/\S/);
    expect(settled?.worker).toBeUndefined();
    expect(settled?.slowSince).toBeUndefined();
    expect(boundary.before).not.toHaveBeenCalled();
    expect(boundary.run).not.toHaveBeenCalled();
    expect(readFileSync(launchStoreFile(boundary.home), "utf8")).toBe(records);
  },
);
