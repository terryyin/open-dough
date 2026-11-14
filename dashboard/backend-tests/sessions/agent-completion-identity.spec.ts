// Real receiver/store and installed CLI, with native provider answers substituted.
import {
  chmodSync,
  existsSync,
  readFileSync,
  mkdirSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import path from "node:path";
import { launchStoreFile } from "../../tests/support/launchStore.ts";
import { randomUUID } from "node:crypto";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { rawRequest } from "../../tests/support/rawHttp.ts";
import { test, expect, stored } from "../../tests/support/codexStart.ts";
import { keptAttempts } from "../../tests/acceptedAttempts.ts";
import { completionReceiptSchema } from "../../src/completionReport.ts";
import type { CompletionSubmission } from "../../server/completionAdmission.ts";
import { launch, markDone } from "../../tests/agentLaunchBoundary.ts";
import {
  reportingChild,
  quote,
  recordOperation,
} from "../../tests/support/completionRecovery.ts";

test.use({ serverMode: "boundary" });

test("older launch delivery cannot close another session and durable duplicates need no store rewrite", async ({
  dashboard,
  origin,
  codexProtocol: native,
}) => {
  if (native === undefined) throw new Error("No native fixture");
  const start = async (instruction: string) => {
    expect(
      (
        await launch(dashboard, {
          source: "open-dough",
          host: "codex",
          workflow: "ad-hoc",
          instruction,
        })
      ).status,
    ).toBe(200);
    const record = stored(dashboard.home).find(
      (entry) => entry.session.sessionId === native.threadId,
    );
    if (record?.request.reporting === undefined)
      throw new Error("No real reporting context");
    return record;
  };
  const nativeSession = native;
  const older = await start("Complete first bounded work.");
  nativeSession.threadId = "later-native-session";
  const newer = await start("Complete later bounded work.");
  const oldContext = older.request.reporting;
  if (oldContext === undefined) throw new Error("No earlier reporting context");
  const oldCommand = oldContext.command;
  const accepted = await reportingChild(
    `${oldCommand} --outcome completed`,
    origin.machine,
  );
  expect(accepted.ok).toBe(true);
  const receipt = completionReceiptSchema.parse(JSON.parse(accepted.stdout));
  expect(receipt.session?.sessionId).toBe(older.session.sessionId);
  expect(
    stored(dashboard.home).find(
      (entry) => entry.session.sessionId === newer.session.sessionId,
    )?.doneAt,
  ).toBeUndefined();
  const pending = path.join(
    dashboard.home,
    ".open-dough/dashboard/reporting",
    receipt.reference,
    `completion-${receipt.delivery}.json`,
  );
  const retry = `${oldCommand} --retry ${quote(pending)}`;
  const recordsFile = launchStoreFile(dashboard);
  const directory = path.dirname(recordsFile);
  const lock = `${recordsFile}.lock`;
  // The report's receipt follows a store write naming its native Done
  // pending; that Done then clears the problem in a later store write. Let
  // that write finish and release the store before it goes read-only.
  await expect
    .poll(() => ({
      doneProblem: stored(dashboard.home).find(
        (entry) => entry.session.sessionId === older.session.sessionId,
      )?.doneProblem,
      locked: existsSync(lock),
    }))
    .toEqual({ doneProblem: undefined, locked: false });
  const attempts = readFileSync(
    path.join(directory, "launch-attempts.json"),
    "utf8",
  );
  const records = readFileSync(recordsFile, "utf8");
  chmodSync(directory, 0o500);
  try {
    const duplicate = await reportingChild(retry, origin.machine);
    expect(duplicate.ok).toBe(true);
    expect(JSON.parse(duplicate.stdout)).toEqual(receipt);
    expect(
      readFileSync(path.join(directory, "launch-attempts.json"), "utf8"),
    ).toBe(attempts);
    expect(readFileSync(recordsFile, "utf8")).toBe(records);
  } finally {
    chmodSync(directory, 0o700);
  }
  await recordOperation(dashboard, "setRecordDoneAt", [
    "open-dough",
    older.session,
    undefined,
  ]);
  const submission = JSON.parse(
    readFileSync(pending, "utf8"),
  ) as CompletionSubmission & { origin: string };
  const body = { ...submission, origin: undefined, delivery: randomUUID() };
  const post = () =>
    rawRequest({
      url: `${dashboard.origin}/__agent-launch/completion`,
      method: "POST",
      headers: { Origin: dashboard.origin, "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  mkdirSync(lock);
  const first = post();
  await expect
    .poll(
      () =>
        keptAttempts(dashboard).find((entry) => entry.id === receipt.reference)
          ?.completionReceipts?.length,
    )
    .toBe(2);
  // This real user-intent writer competes with completion after its durable reservation.
  const reopened = recordOperation(dashboard, "setRecordDoneAt", [
    "open-dough",
    older.session,
    undefined,
  ]);
  const duplicateInitial = post();
  rmSync(lock, { recursive: true });
  const [fresh, duplicateFresh] = await Promise.all([
    first,
    duplicateInitial,
    reopened,
  ]);
  expect(fresh.status).toBe(200);
  expect(duplicateFresh.status).toBe(200);
  expect(JSON.parse(fresh.body)).toEqual(JSON.parse(duplicateFresh.body));
  expect(
    completionReceiptSchema.parse(JSON.parse(fresh.body)).delivery,
  ).not.toBe(receipt.delivery);
  expect(
    stored(dashboard.home).find(
      (entry) => entry.session.sessionId === older.session.sessionId,
    )?.doneAt,
  ).toBeUndefined();
  const done = await markDone(dashboard, {
    source: "open-dough",
    host: "codex",
    session: older.session.sessionId,
  });
  expect(done.status).toBe(200);
  const manual = stored(dashboard.home).find(
    (entry) => entry.session.sessionId === older.session.sessionId,
  )?.doneAt;
  expect((await reportingChild(retry, origin.machine)).ok).toBe(true);
  expect(
    stored(dashboard.home).find(
      (entry) => entry.session.sessionId === older.session.sessionId,
    )?.doneAt,
  ).toBe(manual);
  expect(
    stored(dashboard.home).find(
      (entry) => entry.session.sessionId === newer.session.sessionId,
    )?.doneAt,
  ).toBeUndefined();
});

test("refused deliveries keep the earlier completion message", async ({
  dashboard,
  origin,
  codexProtocol: native,
}) => {
  if (native === undefined) throw new Error("No native fixture");
  expect(
    (
      await launch(dashboard, {
        source: "open-dough",
        host: "codex",
        workflow: "ad-hoc",
        instruction: "Complete bounded work.",
      })
    ).status,
  ).toBe(200);
  const record = () =>
    stored(dashboard.home).find(
      (entry) => entry.session.sessionId === native.threadId,
    );
  const completion = () => record()?.completion;
  const context = record()?.request.reporting;
  if (context === undefined) throw new Error("No real reporting context");
  const earlier = "Publication finished. Reminder: inspect the migration.";
  const messageFile = path.join(origin.machine, "attention.txt");
  writeFileSync(messageFile, earlier);
  expect(
    (
      await reportingChild(
        `${context.command} --outcome completed --message-file ${quote(messageFile)}`,
        origin.machine,
      )
    ).ok,
  ).toBe(true);
  expect(completion()?.message).toBe(earlier);
  const refused = (body: unknown, headers = { Origin: dashboard.origin }) =>
    rawRequest({
      url: `${dashboard.origin}/__agent-launch/completion`,
      method: "POST",
      headers: { "Content-Type": "application/json", ...headers },
      body: JSON.stringify(body),
    });
  const valid = makeMe.aCompletionSubmission
    .reportingFor({ host: "codex", reference: context.reference })
    .withOutcome("unfinished")
    .saying("Required retirement is held; resolve ownership.")
    .please();
  for (const [change, headers, status] of [
    [{ source: "unknown-project" }, undefined, 404],
    [{ source: "doughnut" }, undefined, 404],
    [{ host: "claude" }, undefined, 404],
    [{ reference: "00000000-0000-4000-8000-000000000000" }, undefined, 404],
    [{ session: "another-session" }, undefined, 409],
    [{ message: "" }, undefined, 400],
    [{ outcome: "quiet" }, undefined, 400],
    [{ extra: true }, undefined, 400],
    [{}, { Origin: "https://elsewhere.test" }, 403],
  ] as const) {
    expect((await refused({ ...valid, ...change }, headers)).status).toBe(
      status,
    );
    expect(completion()).toMatchObject({
      outcome: "completed",
      message: earlier,
    });
  }
});
