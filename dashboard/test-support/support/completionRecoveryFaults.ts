// Observe real receiver faults after closure; fixtures supply no completion state.
import { readFileSync, existsSync } from "node:fs";
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

export async function unacknowledgedCompletion(
  context: ReportingContext,
  cwd: string,
  home: string,
  env: NodeJS.ProcessEnv,
) {
  const unacknowledged = await reportingChild(
    `${context.command} --outcome completed`,
    cwd,
    env,
  );
  expect(unacknowledged.ok).toBe(false);
  expect(unacknowledged.stdout).toBe("");
  expect(unacknowledged.stderr).toContain(
    "Completion delivery was not acknowledged",
  );
  // Incomplete completion after accepted work stays a reporting-only recovery:
  // identify the unfinished completion operation and keep the exact pending input.
  expect(unacknowledged.stderr).toMatch(/Retained completion: /);
  expect(unacknowledged.stderr).toMatch(
    /Retry reporting only: .+['"]--retry['"] /,
  );
  expect(unacknowledged.stderr).toContain(
    "Keep the message and retry without repeating the work.",
  );
  const pending = retainedSubmission(unacknowledged.stderr);
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

// A real initial-server write failure leaves the installed exact retry callable
// from a surviving directory after actual worktree retirement.
export async function failedCompletionRetry(
  context: ReportingContext,
  cwd: string,
  home: string,
  fault: ReturnType<typeof completionWriteFault>,
  env: NodeJS.ProcessEnv,
) {
  const previous = stored(home)[0]?.completion;
  fault.arm();
  const saved = await unacknowledgedCompletion(context, cwd, home, env);
  expect(existsSync(fault.marker)).toBe(false);
  expect(stored(home)[0]?.completion).toEqual(previous);
  return saved.retry;
}

export async function observeCompletionFaults(options: {
  receiver: DashboardServer;
  record: LaunchRecord;
  cwd: string;
  env: NodeJS.ProcessEnv;
  retry: string;
  delivery: string;
  proxy: Awaited<ReturnType<typeof completionProxy>>;
  fault: ReturnType<typeof completionWriteFault>;
}): Promise<CompletionReceipt> {
  const { receiver, record, cwd, env, retry, delivery, proxy, fault } = options;
  fault.arm();
  const failedWrite = await reportingChild(retry, cwd, env);
  expect(failedWrite.ok).toBe(false);
  expect(failedWrite.stdout).toBe("");
  expect(failedWrite.stderr).toContain("not acknowledged");
  expect(existsSync(fault.marker)).toBe(false);
  expect(stored(receiver.home)[0]?.completion).toBeUndefined();
  expect(stored(receiver.home)[0]?.doneAt).toBeUndefined();
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
  return receipt;
}
