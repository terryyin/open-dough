// Later substantive reporting, local intent and old-delivery recovery stay distinct.
import { readFileSync, writeFileSync, rmSync } from "node:fs";
import path from "node:path";
import { expect } from "@playwright/test";
import {
  submissionSchema,
  type CompletionSubmission,
} from "../../server/completionAdmission.ts";
import type { ReportingContext } from "../../src/launchRequest.ts";
import type { LaunchRecord } from "../../src/launchRecord.ts";
import {
  completionReceiptSchema,
  type CompletionReceipt,
} from "../../src/completionReport.ts";
import type { DashboardServer } from "./dashboardServer.ts";
import { stored } from "./codexStart.ts";
import { rawRequest } from "./rawHttp.ts";
import {
  reportingChild,
  retainedSubmission,
  completionProxy,
  quote,
} from "./completionRecovery.ts";
import type { FakeCodex } from "./fakeCodex.ts";
import { markDone, machineSessions } from "../agentLaunchBoundary.ts";

export async function observeLaterCompletionIntent(options: {
  receiver: DashboardServer;
  native: FakeCodex;
  context: ReportingContext;
  record: LaunchRecord;
  cwd: string;
  env: NodeJS.ProcessEnv;
  retry: string;
  pending: string;
  receipt: CompletionReceipt;
  proxy: Awaited<ReturnType<typeof completionProxy>>;
  restart: () => Promise<void>;
}) {
  const {
    receiver,
    native,
    context,
    record,
    cwd,
    env,
    retry,
    pending,
    receipt,
    proxy,
    restart,
  } = options;
  // The producer persists before delivery; --retry only reads this same file.
  // Receiver-state replays use its exact payload, as the real CLI sends it.
  const retained = JSON.parse(
    readFileSync(pending, "utf8"),
  ) as CompletionSubmission & { origin?: string };
  delete retained.origin;
  const original = submissionSchema.parse(retained);
  const replayOld = async () => {
    const answer = await rawRequest({
      url: `${context.origin}/__agent-launch/completion`,
      method: "POST",
      headers: { Origin: context.origin, "Content-Type": "application/json" },
      body: JSON.stringify(original),
    });
    expect(answer.status).toBe(200);
    return completionReceiptSchema.parse(JSON.parse(answer.body));
  };
  expect(stored(receiver.home)[0]?.doneAt).toBe(receipt.receivedAt);
  // Fresh unfinished attention replaces automatic Done without controlling
  // the native conversation; the next quiet submission can close it again.
  const nativeBefore = native.calls.length;
  const openMessage = path.join(cwd, "remaining.txt");
  const openText = "Remaining ownership decision is held before release.";
  writeFileSync(openMessage, openText);
  const unfinished = await reportingChild(
    `${context.command} --outcome unfinished --message-file ${quote(openMessage)}`,
    cwd,
    env,
  );
  expect(unfinished.ok).toBe(true);
  expect(stored(receiver.home)[0]?.completion).toMatchObject({
    outcome: "unfinished",
    message: openText,
  });
  expect(stored(receiver.home)[0]?.doneAt).toBeUndefined();
  expect(await machineSessions(receiver)).toMatchObject([
    { sessionState: { kind: "available", activity: "working" } },
  ]);
  expect(
    native.calls
      .slice(nativeBefore)
      .filter((call) =>
        ["turn/start", "turn/interrupt", "thread/resume"].includes(call.method),
      ),
  ).toEqual([]);
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
  expect(await replayOld()).toEqual(receipt);
  expect(stored(receiver.home)[0]?.completion?.receipt).toBe(
    quietReceipt.receipt,
  );
  expect(stored(receiver.home)[0]?.doneAt).toBe(quietReceipt.receivedAt);
  // The old receipt remains idempotent across a real receiver restart, without
  // replacing the newer automatic Done that came from a distinct submission.
  await restart();
  expect(await replayOld()).toEqual(receipt);
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
  expect(await replayOld()).toEqual(receipt);
  expect(stored(receiver.home)[0]?.completion?.receipt).toBe(
    newerReceipt.receipt,
  );
  expect(stored(receiver.home)[0]?.doneAt).toBeUndefined();
  const done = await markDone(receiver, {
    source: "open-dough",
    host: record.session.host,
    session: record.session.sessionId,
  });
  expect(done.status).toBe(200);
  expect(stored(receiver.home)[0]?.doneAt).toBeDefined();
  const manualDone = stored(receiver.home)[0]?.doneAt;
  expect(await replayOld()).toEqual(receipt);
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
  expect(await replayOld()).toEqual(receipt);
  expect(stored(receiver.home)[0]?.completion?.receipt).toBe(
    heldReceipt.receipt,
  );
  expect(stored(receiver.home)[0]?.doneAt).toBe(manualDone);
  // A second restart preserves deliberate Done and the newest unfinished
  // message even when the installed CLI retries the original quiet receipt.
  await restart();
  expect(JSON.parse((await reportingChild(retry, cwd, env)).stdout)).toEqual(
    receipt,
  );
  expect(stored(receiver.home)[0]?.completion?.receipt).toBe(
    heldReceipt.receipt,
  );
  expect(stored(receiver.home)[0]?.completion?.message).toBe(remaining);
  expect(stored(receiver.home)[0]?.doneAt).toBe(manualDone);
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
