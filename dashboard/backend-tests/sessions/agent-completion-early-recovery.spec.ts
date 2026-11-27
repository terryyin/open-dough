// An early Claude Code binding deleted before its attempt settles stays
// deleted: a late native bind is refused, the attempt keeps that its
// reporting was deleted, and a later report is refused. The attempt runs
// through production `attemptRun` and the real Claude Code host over the
// synthetic `claude`; its settlement is held after the native binding, and
// the installed reporting script runs in process.
import { randomUUID } from "node:crypto";
import { afterEach, beforeAll, beforeEach, expect, test, vi } from "vitest";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { queuedReadyRepository } from "../../../Distribution/tests/support/queued-repository.mjs";
import { settleAttempt } from "../../server/launchAttemptSettlement.ts";
import { keepAttempt, keptAttempts } from "../../server/launchAttemptStore.ts";
import { launchHost } from "../../server/launchHosts.ts";
import { bindRecord } from "../../server/launchRecordBinding.ts";
import { deleteRecord, keptRecords } from "../../server/launchRecordStore.ts";
import { attemptRun } from "../../server/launchRun.ts";
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
import {
  reportInstalled,
  reportingInvocation,
} from "../support/installedReporting.ts";

const source = makeMe.aPublishedSource.openDough.please();
const repository = queuedReadyRepository().please();

let origin: StartOrigin;
let claude: FakeClaudeControls;
let unmount: () => void;

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
});

afterEach(() => {
  unmount();
  vi.unstubAllEnvs();
  origin.cleanup();
});

test("a deleted early Claude Code binding cannot be resurrected before its attempt settles", async () => {
  const attempt = makeMe.anAcceptedAttempt
    .executing({ identity: queuedIdentity, title: queuedTitle })
    .withId(randomUUID())
    .acceptedAt(new Date().toISOString())
    .reportingTo("http://127.0.0.1:4173")
    .please();
  await keepAttempt(attempt);
  const kept = async () =>
    (await keptAttempts())?.find((entry) => entry.id === attempt.id);
  claude.claudeScenario("held");
  let bindingKept = false;
  let releaseSettlement = () => {};
  const settlementHeld = new Promise<void>((resolve) => {
    releaseSettlement = resolve;
  });
  const owned = new OwnedAttempts();
  const settled = settleAttempt(
    owned,
    owned.own(attempt.request, attempt),
    async (own, notes) => {
      const result = await attemptRun(source, own, {
        progress: new StartProgress(),
        doneMarks: { reported: vi.fn() },
        native: launchHost,
        notes,
      });
      bindingKept = true;
      await settlementHeld;
      return result;
    },
  );
  // The Take publication and workspace run real Git before `claude`.
  await vi.waitFor(
    () => {
      expect(claude.claudeLaunches()).toHaveLength(1);
    },
    { timeout: 30_000 },
  );
  const command = /^- reporting command: (.+)$/m.exec(
    claude.claudeLaunches()[0]?.instruction ?? "",
  )?.[1];
  if (command === undefined) throw new Error("No reporting command");
  const { script, argv } = reportingInvocation(command);
  const report = () =>
    reportInstalled(script, [...argv, "--outcome", "completed"], {
      reported: vi.fn(),
    });
  const receipt = completionReceiptSchema.parse(await report());
  expect(receipt.state).toBe("pending-native-session");

  claude.releaseHeldClaude();
  await vi.waitFor(
    () => {
      expect(bindingKept).toBe(true);
    },
    { timeout: 10_000 },
  );
  expect((await kept())?.outcome).toBeUndefined();
  const [record] = await keptRecords("open-dough");
  if (record === undefined) throw new Error("No early binding");
  expect(record.completion?.receipt).toBe(receipt.receipt);

  expect(await deleteRecord("open-dough", record.session)).toBe(true);
  await expect(
    bindRecord("open-dough", {
      ...record,
      completion: undefined,
      doneAt: undefined,
    }),
  ).rejects.toThrow("The reporting session was deleted");
  expect(await keptRecords("open-dough")).toEqual([]);
  expect((await kept())?.reportingDeletedAt).toBeDefined();
  expect((await kept())?.outcome).toBeUndefined();

  releaseSettlement();
  await settled;
  await expect(report()).rejects.toThrow();
  expect(await keptRecords("open-dough")).toEqual([]);
});
