// Later substantive reporting, local intent and old-delivery recovery stay distinct.
import { readFileSync, writeFileSync, rmSync } from "node:fs";
import path from "node:path";
import type { Page } from "@playwright/test";
import { expect } from "@playwright/test";
import type { CompletionSubmission } from "../../server/completionAdmission.ts";
import type { ReportingContext } from "../../src/launchRequest.ts";
import type { LaunchRecord } from "../../src/launchRecord.ts";
import {
  completionReceiptSchema,
  type CompletionReceipt,
} from "../../src/completionReport.ts";
import type { DashboardServer } from "./dashboardServer.ts";
import { stored } from "./codexStart.ts";
import { parts } from "../dashboardPage.ts";
import { rawRequest } from "./rawHttp.ts";
import { messagePartOf } from "./sessionMessagePart.ts";
import {
  reportingChild,
  retainedSubmission,
  completionProxy,
  quote,
} from "./completionRecovery.ts";
import { markDoneAnyway } from "./markDone.ts";

export async function observeLaterCompletionIntent(options: {
  page: Page;
  receiver: DashboardServer;
  context: ReportingContext;
  record: LaunchRecord;
  cwd: string;
  env: NodeJS.ProcessEnv;
  retry: string;
  pending: string;
  receipt: CompletionReceipt;
  proxy: Awaited<ReturnType<typeof completionProxy>>;
}) {
  const {
    page,
    receiver,
    context,
    record,
    cwd,
    env,
    retry,
    pending,
    receipt,
    proxy,
  } = options;
  expect(stored(receiver.home)[0]?.doneAt).toBe(receipt.receivedAt);
  // Fresh quiet reporting transfers automatic Done to its own receipt.
  const quiet = await reportingChild(
    `${context.command} --outcome completed`,
    cwd,
    env,
  );
  expect(quiet.ok).toBe(true);
  const quietReceipt = completionReceiptSchema.parse(JSON.parse(quiet.stdout));
  expect(quietReceipt.delivery).not.toBe(receipt.delivery);
  expect(stored(receiver.home)[0]?.completion?.receipt).toBe(
    quietReceipt.receipt,
  );
  expect(stored(receiver.home)[0]?.doneAt).toBe(quietReceipt.receivedAt);
  expect(JSON.parse((await reportingChild(retry, cwd, env)).stdout)).toEqual(
    receipt,
  );
  expect(stored(receiver.home)[0]?.completion?.receipt).toBe(
    quietReceipt.receipt,
  );
  expect(stored(receiver.home)[0]?.doneAt).toBe(quietReceipt.receivedAt);
  // No pre-reopen: the newer attention itself must replace automatic Done.
  // New substantive content gets its own delivery. Lose its acknowledgment,
  // remove the original text file, then recover the saved message exactly.
  const message = path.join(cwd, "new-attention.txt");
  const text = "Publication accepted. Inspect the migration before release.";
  writeFileSync(message, text);
  proxy.dropNext();
  const attention = await reportingChild(
    `${context.command} --outcome completed --message-file ${quote(message)}`,
    cwd,
    env,
  );
  expect(attention.ok).toBe(false);
  expect(attention.stdout).toBe("");
  expect(stored(receiver.home)[0]?.completion?.message).toBe(text);
  expect(stored(receiver.home)[0]?.doneAt).toBeUndefined();
  const next = retainedSubmission(attention.stderr);
  rmSync(message);
  const newer = await reportingChild(
    `${context.command} --retry ${quote(next)}`,
    cwd,
    env,
  );
  const newerReceipt = completionReceiptSchema.parse(JSON.parse(newer.stdout));
  expect(newerReceipt.message).toBe(text);
  expect(newerReceipt.delivery).not.toBe(receipt.delivery);
  expect(JSON.parse((await reportingChild(retry, cwd, env)).stdout)).toEqual(
    receipt,
  );
  expect(stored(receiver.home)[0]?.completion?.receipt).toBe(
    newerReceipt.receipt,
  );
  expect(stored(receiver.home)[0]?.doneAt).toBeUndefined();
  await page.reload();
  const recent = parts(page)
    .recentSessions.getByRole("article")
    .filter({ hasText: record.session.sessionId });
  const part = messagePartOf(recent);
  await expect(part.text).toHaveText(text);
  await part.markRead.click();
  await expect(part.markRead).toHaveCount(0);
  await recent.getByRole("button", { name: "Read final report" }).click();
  const panel = page.getByRole("region", { name: "Final report" });
  await markDoneAnyway(panel);
  await expect.poll(() => stored(receiver.home)[0]?.doneAt).toBeDefined();
  const manualDone = stored(receiver.home)[0]?.doneAt;
  expect((await reportingChild(retry, cwd, env)).ok).toBe(true);
  expect(stored(receiver.home)[0]?.doneAt).toBe(manualDone);
  // A fresh unfinished delivery must preserve deliberate Done, including
  // persistence before a lost acknowledgment and its subsequent retry.
  const remaining = "Further work is held. Resolve the remaining decision.";
  writeFileSync(message, remaining);
  proxy.dropNext();
  const held = await reportingChild(
    `${context.command} --outcome unfinished --message-file ${quote(message)}`,
    cwd,
    env,
  );
  expect(held.ok).toBe(false);
  expect(held.stdout).toBe("");
  expect(stored(receiver.home)[0]?.completion?.message).toBe(remaining);
  expect(stored(receiver.home)[0]?.doneAt).toBe(manualDone);
  const heldPending = retainedSubmission(held.stderr);
  rmSync(message);
  const heldRetry = await reportingChild(
    `${context.command} --retry ${quote(heldPending)}`,
    cwd,
    env,
  );
  const heldReceipt = completionReceiptSchema.parse(
    JSON.parse(heldRetry.stdout),
  );
  expect(heldReceipt).toMatchObject({
    outcome: "unfinished",
    message: remaining,
  });
  expect(heldReceipt.receipt).toBe(
    stored(receiver.home)[0]?.completion?.receipt,
  );
  expect(stored(receiver.home)[0]?.doneAt).toBe(manualDone);
  expect(JSON.parse((await reportingChild(retry, cwd, env)).stdout)).toEqual(
    receipt,
  );
  expect(stored(receiver.home)[0]?.completion?.receipt).toBe(
    heldReceipt.receipt,
  );
  expect(stored(receiver.home)[0]?.doneAt).toBe(manualDone);
  await page.reload();
  await expect(recent).toContainText("Done");
  // Done, the message is collapsed under its label until expanded.
  await recent.getByRole("button", { name: "Unfinished work" }).click();
  await expect(part.text).toHaveText(remaining);
  const malformedRetry = await rawRequest({
    url: `${context.origin}/__agent-launch/completion`,
    method: "POST",
    headers: { Origin: context.origin, "Content-Type": "application/json" },
    body: JSON.stringify({
      ...(JSON.parse(readFileSync(pending, "utf8")) as CompletionSubmission),
      origin: undefined,
      message: "Changed old completion",
    }),
  });
  expect(malformedRetry.status).toBe(409);
}
