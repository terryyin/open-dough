import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { expect, onTestFinished, test, vi } from "vitest";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { LaunchAttemptOwner } from "../../server/launchAttemptOwner.ts";
import type { AttemptRun } from "../../server/launchAttemptSettlement.ts";
import { keepAttempt, keptAttempts } from "../../server/launchAttemptStore.ts";
import {
  preAcceptanceAnswer,
  preContinuationAnswer,
} from "../../server/launchPreAcceptance.ts";
import { machineDashboardPath } from "../../server/machineHome.ts";
import {
  appendConfiguredProject,
  mountProjectConfiguration,
} from "../../server/projectConfiguration.ts";
import { StartProgress } from "../../server/startProgress.ts";
import type { AgentLaunchRequest } from "../../src/agentLaunch.ts";
import {
  keepLaunchStore,
  launchStoreFile,
} from "../../test-support/support/launchStore.ts";

let unwritable: string | undefined;
vi.mock(import("node:fs/promises"), async (original) => {
  const fs = await original();
  return {
    ...fs,
    rename: async (from, to) => {
      if (to === unwritable) throw new Error("Attempt replacement denied.");
      await fs.rename(from, to);
    },
  };
});

const source = makeMe.aPublishedSource.openDough.please();
const story = {
  source: source.id,
  identity: "SEED-052#continue",
  title: "Continue this story",
};

function machine(missingCheckout = false) {
  const home = mkdtempSync(path.join(tmpdir(), "dough-confirmed-attempt-"));
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
      unwritable = undefined;
      vi.unstubAllEnvs();
      rmSync(home, { recursive: true, force: true });
    }
  });
  appendConfiguredProject(
    makeMe.aConfiguredProject
      .with({
        ...source,
        localPath: missingCheckout ? path.join(home, "missing") : home,
      })
      .please(),
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
    file: machineDashboardPath("launch-attempts.json"),
    continueAttempt: (id: string) =>
      owner.continueAttempt(
        source.id,
        id,
        (request) => before(id, request),
        run,
      ),
  };
}

async function ownRecordCase(
  workflow: "execution" | "refinement",
  state: "interrupted" | "uncertain",
  home: string,
  confirmed = true,
) {
  const request = makeMe.aLaunchRequest.ofWorkflow(workflow, story).please();
  const when = Date.now();
  const at = new Date(when).toISOString();
  const builder = makeMe.anAcceptedAttempt
    .requesting(request)
    .acceptedAt(at)
    .workedBy({ pid: 2147483647, step: "launch", notedAt: at })
    .slowSince(at);
  if (state === "uncertain")
    builder
      .ended({
        kind: "uncertain",
        reason: "unconfirmed",
        explanation: "Interrupted handoff.",
      })
      .settledAt(at);
  const attempt = builder.please();
  await keepAttempt(attempt);

  const launch = (
    offset: number,
    selected = workflow,
    identity = story.identity,
  ) =>
    makeMe.aLaunchRecord
      .ofWorkflow(selected, { ...story, identity })
      .launchedAt(new Date(when + offset).toISOString());
  // A record from before explicit first-input state counts as delivered.
  const ownLaunch = launch(2).inCodexSession({ sessionId: "latest-eligible" });
  const own = (
    confirmed ? ownLaunch.withFirstInput({ state: "confirmed" }) : ownLaunch
  ).please();
  const records = keepLaunchStore(home, {
    [source.id]: [
      launch(1).please(),
      launch(3, workflow === "execution" ? "refinement" : "execution").please(),
      own,
      launch(4, workflow, "SEED-053#other").please(),
      launch(-1).please(),
    ],
  });
  return { attempt, own, records };
}

async function expectOwnSettlement(
  boundary: ReturnType<typeof machine>,
  { attempt, own, records }: Awaited<ReturnType<typeof ownRecordCase>>,
) {
  const { id, acceptedAt } = attempt;
  const outcome = {
    kind: "launched",
    session: { host: "codex", sessionId: own.session.sessionId },
  };
  const answered = await boundary.continueAttempt(id);
  expect(answered).toMatchObject({
    kind: "accepted",
    attempt: { id, acceptedAt, outcome, owned: false, running: false },
  });
  const answeredAttempt = "attempt" in answered ? answered.attempt : undefined;
  expect(answeredAttempt?.worker).toBeUndefined();
  expect(answeredAttempt?.slowSince).toBeUndefined();
  const kept = await keptAttempts();
  expect(kept).toHaveLength(1);
  const [settled] = kept ?? [];
  expect(settled).toMatchObject({ id, acceptedAt, outcome });
  expect(settled?.settledAt).toMatch(/\S/);
  expect(settled?.worker).toBeUndefined();
  expect(settled?.slowSince).toBeUndefined();
  expect(boundary.before).not.toHaveBeenCalled();
  expect(boundary.run).not.toHaveBeenCalled();
  expect(readFileSync(launchStoreFile(boundary.home), "utf8")).toBe(records);
}

test.each([
  ["execution", "uncertain", true],
  ["refinement", "uncertain", false],
  ["refinement", "interrupted", true],
] as const)(
  "Continue settles the %s attempt left %s with its newest eligible record (explicit first input: %s)",
  async (workflow, state, confirmed) => {
    const boundary = machine();
    await expectOwnSettlement(
      boundary,
      await ownRecordCase(workflow, state, boundary.home, confirmed),
    );
  },
);

test("Continue settles an interrupted execution from its record even if its checkout is missing", async () => {
  const boundary = machine(true);
  const evidence = await ownRecordCase(
    "execution",
    "interrupted",
    boundary.home,
    false,
  );
  expect(
    await preAcceptanceAnswer(source, evidence.attempt.request),
  ).toMatchObject({
    kind: "failed",
    reason: "folder-not-found",
  });

  await expectOwnSettlement(boundary, evidence);
});

test("Continue refuses an unwritable settlement and leaves both files intact", async () => {
  const boundary = machine();
  const { attempt, records } = await ownRecordCase(
    "execution",
    "interrupted",
    boundary.home,
  );
  const initial = readFileSync(boundary.file, "utf8");
  unwritable = boundary.file;

  expect(await boundary.continueAttempt(attempt.id)).toMatchObject({
    kind: "failed",
    reason: "unrecorded",
  });
  expect(readFileSync(boundary.file, "utf8")).toBe(initial);
  expect(readFileSync(launchStoreFile(boundary.home), "utf8")).toBe(records);
  expect(boundary.before).not.toHaveBeenCalled();
  expect(boundary.run).not.toHaveBeenCalled();
});

test("a matching record from before acceptance cannot settle Continue", async () => {
  const boundary = machine(true);
  const when = Date.now();
  const attempt = makeMe.anAcceptedAttempt
    .executing(story)
    .acceptedAt(new Date(when).toISOString())
    .please();
  const prior = makeMe.aLaunchRecord
    .executing(story)
    .launchedAt(new Date(when - 1).toISOString())
    .withFirstInput({ state: "confirmed" })
    .please();
  await keepAttempt(attempt);
  const initial = readFileSync(boundary.file, "utf8");
  const records = keepLaunchStore(boundary.home, { [source.id]: [prior] });

  expect(await boundary.continueAttempt(attempt.id)).toMatchObject({
    kind: "failed",
    reason: "folder-not-found",
  });
  expect(boundary.before).toHaveBeenCalledExactlyOnceWith(
    attempt.id,
    attempt.request,
  );
  expect(boundary.run).not.toHaveBeenCalled();
  expect(readFileSync(boundary.file, "utf8")).toBe(initial);
  expect(readFileSync(launchStoreFile(boundary.home), "utf8")).toBe(records);
});
