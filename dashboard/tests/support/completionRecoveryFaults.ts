// Observe real receiver faults after closure; fixtures supply no completion state.
import { readFileSync } from "node:fs";
import type { Page } from "@playwright/test";
import { expect } from "@playwright/test";
import type { ReportingContext } from "../../src/launchRequest.ts";
import type { LaunchRecord } from "../../src/launchRecord.ts";
import {
  completionReceiptSchema,
  type CompletionReceipt,
} from "../../src/completionReport.ts";
import type { DashboardServer } from "./dashboardServer.ts";
import { stored } from "./codexStart.ts";
import {
  reportingChild,
  retainedSubmission,
  recordOperation,
  completionProxy,
  completionWriteFault,
  quote,
} from "./completionRecovery.ts";

export async function unavailableCompletion(
  context: ReportingContext,
  cwd: string,
  home: string,
  env: NodeJS.ProcessEnv,
) {
  const unavailable = await reportingChild(
    `${context.command} --outcome completed`,
    cwd,
    env,
  );
  expect(unavailable.ok).toBe(false);
  expect(unavailable.stdout).toBe("");
  expect(unavailable.stderr).toContain(
    "Completion delivery was not acknowledged",
  );
  const pending = retainedSubmission(unavailable.stderr);
  const submission = JSON.parse(readFileSync(pending, "utf8")) as {
    delivery: string;
    message: string;
    outcome: string;
  };
  expect(submission).toMatchObject({ message: "", outcome: "completed" });
  expect(stored(home)[0]?.doneAt).toBeUndefined();
  return {
    pending,
    delivery: submission.delivery,
    retry: `${context.command} --retry ${quote(pending)}`,
  };
}

export async function observeCompletionFaults(options: {
  page: Page;
  receiver: DashboardServer;
  record: LaunchRecord;
  cwd: string;
  env: NodeJS.ProcessEnv;
  retry: string;
  delivery: string;
  proxy: Awaited<ReturnType<typeof completionProxy>>;
  fault: ReturnType<typeof completionWriteFault>;
}): Promise<CompletionReceipt> {
  const { page, receiver, record, cwd, env, retry, delivery, proxy, fault } =
    options;
  fault.arm();
  const failedWrite = await reportingChild(retry, cwd, env);
  expect(failedWrite.ok).toBe(false);
  expect(failedWrite.stdout).toBe("");
  expect(failedWrite.stderr).toContain("not acknowledged");
  expect(stored(receiver.home)[0]?.completion).toBeUndefined();
  expect(stored(receiver.home)[0]?.doneAt).toBeUndefined();
  await page.reload();
  const recent = page
    .locator(".dashboard-columns .session-entry")
    .filter({ hasText: record.session.sessionId });
  await expect(recent).not.toContainText("Done");
  const stale = {
    ...record,
    firstInput: {
      ...record.firstInput,
      state: "confirmed",
      explanation: "Concurrent native evidence",
    },
  };
  // Neither late writer may import the reserved but unapplied receipt.
  await Promise.all([
    recordOperation(receiver, "bindRecord", ["open-dough", stale]),
    recordOperation(receiver, "updateRecord", ["open-dough", stale]),
  ]);
  expect(stored(receiver.home)[0]?.completion).toBeUndefined();
  expect(stored(receiver.home)[0]?.doneAt).toBeUndefined();
  proxy.dropNext();
  const [lost] = await Promise.all([
    reportingChild(retry, cwd, env),
    recordOperation(receiver, "updateRecord", ["open-dough", stale]),
  ]);
  expect(lost.ok).toBe(false);
  expect(lost.stdout).toBe("");
  expect(proxy.lost()).toBe(1);
  const durable = stored(receiver.home)[0];
  expect(durable?.completion?.delivery).toBe(delivery);
  expect(durable?.doneAt).toBe(durable?.completion?.receivedAt);
  expect(durable?.firstInput?.explanation).toBe("Concurrent native evidence");
  const recovered = await reportingChild(retry, cwd, env);
  expect(recovered.ok).toBe(true);
  const receipt = completionReceiptSchema.parse(JSON.parse(recovered.stdout));
  expect(receipt).toMatchObject(durable?.completion ?? {});
  const duplicates = await Promise.all([
    reportingChild(retry, cwd, env),
    reportingChild(retry, cwd, env),
  ]);
  for (const duplicate of duplicates)
    expect(JSON.parse(duplicate.stdout)).toEqual(receipt);
  await page.reload();
  await expect(recent).toContainText("Done");
  return receipt;
}
