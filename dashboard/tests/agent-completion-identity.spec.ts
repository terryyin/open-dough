// Real receiver/store and installed CLI, with native provider answers substituted.
import { chmodSync, readFileSync, mkdirSync, rmSync } from "node:fs";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { rawRequest } from "./support/rawHttp.ts";
import { test, expect, stored } from "./support/codexStart.ts";
import { keptAttempts } from "./acceptedAttempts.ts";
import { completionReceiptSchema } from "../src/completionReport.ts";
import type { CompletionSubmission } from "../server/completionAdmission.ts";
import { launch, markDone } from "./agentLaunchBoundary.ts";
import {
  reportingChild,
  quote,
  recordOperation,
} from "./support/completionRecovery.ts";

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
  const directory = path.join(dashboard.home, ".open-dough/dashboard");
  const attempts = readFileSync(
    path.join(directory, "launch-attempts.json"),
    "utf8",
  );
  const records = readFileSync(
    path.join(directory, "agent-launches.json"),
    "utf8",
  );
  chmodSync(directory, 0o500);
  try {
    const duplicate = await reportingChild(retry, origin.machine);
    expect(duplicate.ok).toBe(true);
    expect(JSON.parse(duplicate.stdout)).toEqual(receipt);
    expect(
      readFileSync(path.join(directory, "launch-attempts.json"), "utf8"),
    ).toBe(attempts);
    expect(
      readFileSync(path.join(directory, "agent-launches.json"), "utf8"),
    ).toBe(records);
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
  const lock = path.join(directory, "agent-launches.json.lock");
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
