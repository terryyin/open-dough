// An early report from an accepted queued Claude Code execution waits for its
// native session: the reporting script's receipt stays with the attempt, binds
// when the launch settles or a Recheck confirms it, and survives later native
// writers and Mark as done. The attempt runs through production `attemptRun`
// and the real Claude Code host over the synthetic `claude`, held at its
// launch; the installed reporting script runs in process.
import { randomUUID } from "node:crypto";
import { writeFileSync } from "node:fs";
import path from "node:path";
import { afterEach, beforeAll, beforeEach, expect, test, vi } from "vitest";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { queuedReadyRepository } from "../../../Distribution/tests/support/queued-repository.mjs";
import { deliverCompletion } from "../../server/completionDelivery.ts";
import { NativeDoneMarks, type DoneLaunches } from "../../server/doneMarks.ts";
import { settleAttempt } from "../../server/launchAttemptSettlement.ts";
import { keepAttempt, keptAttempts } from "../../server/launchAttemptStore.ts";
import { launchHost } from "../../server/launchHosts.ts";
import { bindRecord } from "../../server/launchRecordBinding.ts";
import { keptRecords, updateRecord } from "../../server/launchRecordStore.ts";
import { attemptRun } from "../../server/launchRun.ts";
import { verifyLaunch } from "../../server/launchVerification.ts";
import { machineFolder } from "../../server/localFolder.ts";
import { OwnedAttempts } from "../../server/ownedAttempts.ts";
import { mountProjectConfiguration } from "../../server/projectConfiguration.ts";
import { StartProgress } from "../../server/startProgress.ts";
import { completionReceiptSchema } from "../../src/completionReport.ts";
import {
  installFakeClaude,
  type FakeClaudeControls,
} from "../../test-support/support/fakeClaude.ts";
import {
  queuedIdentity,
  queuedTitle,
  startOrigin,
  type StartOrigin,
} from "../../test-support/support/startOrigin.ts";
import { keepStartedOrigin } from "../../test-support/support/startOriginPreparation.ts";
import { reportInstalled } from "../support/installedPublisher.ts";

const source = makeMe.aPublishedSource.openDough.please();
const repository = queuedReadyRepository().please();
const reportingOrigin = "http://127.0.0.1:4173";
// The developer's Done on a host that stops without renaming.
const doneStop = vi.fn(() => Promise.resolve());

let origin: StartOrigin;
let claude: FakeClaudeControls;
let unmount: () => void;
let marks: NativeDoneMarks;

beforeAll(async () => {
  const initial = await startOrigin(repository);
  try {
    keepStartedOrigin("claude", repository, initial);
  } finally {
    initial.cleanup();
  }
});

beforeEach(async () => {
  origin = await startOrigin(repository);
  const native = installFakeClaude(
    origin.machine,
    { binDir: origin.machine, path: process.env["PATH"] ?? "" },
    {},
  );
  claude = native.controls;
  for (const [key, value] of Object.entries(native.env)) vi.stubEnv(key, value);
  unmount = mountProjectConfiguration("production");
  doneStop.mockClear();
  marks = new NativeDoneMarks({
    terminals: {
      withAttachment: () =>
        Promise.reject(new Error("This proof attaches no terminal.")),
      endAttachments: () => undefined,
    },
    hostFor: () => ({ name: "Claude Code", doneStop }),
    reportingFolder: machineFolder,
  });
});

afterEach(() => {
  unmount();
  vi.unstubAllEnvs();
  origin.cleanup();
});

const unobserved: DoneLaunches = {
  stateOf: (...[, record]) =>
    Promise.resolve({ ...record, sessionState: { kind: "unknown" } }),
};

async function heldLaunch() {
  const attempt = makeMe.anAcceptedAttempt
    .executing({ identity: queuedIdentity, title: queuedTitle })
    .withId(randomUUID())
    .acceptedAt(new Date().toISOString())
    .reportingTo(reportingOrigin)
    .please();
  await keepAttempt(attempt);
  claude.claudeScenario("held");
  const owned = new OwnedAttempts();
  const settled = settleAttempt(
    owned,
    owned.own(attempt.request, attempt),
    (own, notes) =>
      attemptRun(source, own, {
        progress: new StartProgress(),
        doneMarks: { reported: vi.fn() },
        native: launchHost,
        notes,
      }),
  );
  // The Take publication and workspace run real Git before `claude`.
  await expect
    .poll(() => claude.claudeLaunches(), { timeout: 30_000 })
    .toHaveLength(1);
  return {
    attempt,
    settled,
    instruction: claude.claudeLaunches()[0]?.instruction ?? "",
    kept: async () =>
      (await keptAttempts())?.find((entry) => entry.id === attempt.id),
  };
}
type HeldLaunch = Awaited<ReturnType<typeof heldLaunch>>;

// The installed script at the launch's reporting command reports early.
async function reportEarly(launch: HeldLaunch, quiet: boolean) {
  const command = /^- reporting command: (.+)$/m.exec(launch.instruction)?.[1];
  if (command === undefined) throw new Error("No reporting command");
  // `node <script> ...argv`, as the host's shell splits the command.
  const [, script = "", ...argv] = Array.from(
    command.matchAll(/'((?:[^']|'\\'')*)'/g),
    ([, part = ""]) => part.replaceAll("'\\''", "'"),
  );
  const message = path.join(origin.machine, "early.txt");
  writeFileSync(message, "Work unfinished: a decision needs the maintainer.");
  const receipt = completionReceiptSchema.parse(
    await reportInstalled(
      script,
      quiet
        ? [...argv, "--outcome", "completed"]
        : [...argv, "--outcome", "unfinished", "--message-file", message],
      { reported: vi.fn() },
    ),
  );
  expect(receipt.state).toBe("pending-native-session");
  expect(receipt).not.toHaveProperty("session");
  expect((await launch.kept())?.completion?.receipt).toBe(receipt.receipt);
  expect(await keptRecords("open-dough")).toEqual([]);
  return receipt.receipt;
}

async function expectBoundReceiptSurvives(launch: HeldLaunch, receipt: string) {
  const reference = launch.attempt.id;
  const [bound] = await keptRecords("open-dough");
  if (bound === undefined) throw new Error("No bound record");
  expect(bound.completion).toMatchObject({ receipt, reference });
  expect(bound.request.reporting?.reference).toBe(reference);
  expect(bound.session.host).toBe("claude");
  expect(bound.doneAt).toBeUndefined();
  expect(bound.doneProblem).toBeUndefined();

  // Later native writers carry a record from before the report.
  const stale = { ...bound, completion: undefined, doneAt: undefined };
  for (const write of [updateRecord, bindRecord]) {
    await write("open-dough", stale);
    const [current] = await keptRecords("open-dough");
    expect(current?.completion?.receipt).toBe(receipt);
    expect(current?.doneAt).toBeUndefined();
  }

  const done = await marks.markDone(source, bound, machineFolder(), unobserved);
  expect(done.doneAt).toBeDefined();
  expect(doneStop).toHaveBeenCalledTimes(1);
  const [marked] = await keptRecords("open-dough");
  expect(marked?.completion?.receipt).toBe(receipt);
  expect((await launch.kept())?.completion?.receipt).toBe(receipt);
}

test("a held Claude Code execution's first input names its reporting command, and a report for a not-yet-known session is refused", async () => {
  const launch = await heldLaunch();
  expect(launch.instruction).toContain(
    `- launch reference: ${launch.attempt.id}`,
  );
  expect(launch.instruction).toMatch(/^- reporting command: /m);
  expect(claude.claudeLaunches()[0]?.name).toBe(
    "Open Dough · Execution · Prepare the queued start",
  );
  expect(claude.claudeLaunchCalls()[0]?.argv).not.toContain(
    "--permission-mode",
  );
  await expect(
    deliverCompletion(
      makeMe.aCompletionSubmission
        .reportingFor({ host: "claude", reference: launch.attempt.id })
        .fromSession("not-yet-known")
        .withOutcome("unfinished")
        .saying("No false session receipt")
        .please(),
      reportingOrigin,
      { reported: vi.fn() },
    ),
  ).rejects.toMatchObject({ status: 409 });
  claude.releaseHeldClaude();
  await launch.settled;
});

for (const quiet of [false, true]) {
  const kind = quiet ? "quiet completion" : "attention report";
  test(`an early ${kind} binds when its launch settles and survives later native writers and Mark as done`, async () => {
    const launch = await heldLaunch();
    const receipt = await reportEarly(launch, quiet);
    claude.releaseHeldClaude();
    await launch.settled;
    expect((await launch.kept())?.outcome?.kind).toBe("launched");
    await expectBoundReceiptSurvives(launch, receipt);
  });

  test(`an early ${kind} binds through a Recheck after an uncertain settlement and survives later native writers and Mark as done`, async () => {
    const launch = await heldLaunch();
    const receipt = await reportEarly(launch, quiet);
    claude.claudeListingFails(true);
    claude.releaseHeldClaude();
    await launch.settled;
    const uncertain = await launch.kept();
    expect(uncertain?.outcome?.kind).toBe("uncertain");
    if (uncertain?.request.workflow !== "execution")
      throw new Error("No kept execution attempt");
    claude.claudeListingFails(false);
    const rechecked = { ...uncertain, request: uncertain.request };
    expect(
      await verifyLaunch(source, rechecked, AbortSignal.timeout(10_000), marks),
    ).toMatchObject({ kind: "launched" });
    await expectBoundReceiptSurvives(launch, receipt);
  });
}

test("binding preserves a legacy quiet receipt without closing an unbound session", async () => {
  const completion = makeMe.aCompletionReport.saying("").please();
  const record = makeMe.aLaunchRecord
    .adHoc({ instruction: "Legacy session", title: "Legacy session" })
    .inCodexSession({ sessionId: "legacy-session" })
    .please();
  await bindRecord("open-dough", { ...record, completion });
  const [bound] = await keptRecords("open-dough");
  expect(bound?.completion).toEqual(completion);
  expect(bound?.doneAt).toBeUndefined();
});
