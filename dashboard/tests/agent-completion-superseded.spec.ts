// A later failed delivery remains open; an older retry cannot finish it.
import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { completionReceiptSchema } from "../src/completionReport.ts";
import { test, expect, stored } from "./support/codexStart.ts";
import { launch } from "./agentLaunchBoundary.ts";
import {
  startDashboardServer,
  builtDashboardDir,
} from "./support/dashboardServer.ts";
import { keptAttempts } from "./acceptedAttempts.ts";
import {
  reportingChild,
  completionWriteFault,
  retainedSubmission,
  quote,
} from "./support/completionRecovery.ts";

test("older quiet retry cannot close a newer attention submission whose record write failed", async ({
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
  const context = stored(dashboard.home)[0]?.request.reporting;
  if (context === undefined) throw new Error("No supplied channel");
  await dashboard.close();
  const fault = completionWriteFault(origin.machine);
  const receiver = await startDashboardServer({
    mode: "preview",
    prebuilt: builtDashboardDir,
    machine: origin.machine,
    github: dashboard.github,
    codexProtocol: native,
    port: Number(new URL(dashboard.origin).port),
    extraEnv: fault.env,
  });
  try {
    fault.arm();
    const first = await reportingChild(
      `${context.command} --outcome completed`,
      origin.machine,
    );
    expect(first.ok).toBe(false);
    expect(first.stdout).toBe("");
    const firstPending = retainedSubmission(first.stderr);
    const original = keptAttempts(receiver).find(
      (entry) => entry.id === context.reference,
    )?.completionReceipts?.[0];
    if (original === undefined)
      throw new Error("No actual first reserved receipt");
    const message = path.join(origin.machine, "newer-issue.txt");
    const text = "Retirement is held. Resolve ownership before continuing.";
    writeFileSync(message, text);
    fault.arm();
    const newer = await reportingChild(
      `${context.command} --outcome unfinished --message-file ${quote(message)}`,
      origin.machine,
    );
    expect(newer.ok).toBe(false);
    expect(newer.stdout).toBe("");
    const newerPending = retainedSubmission(newer.stderr);
    expect(readFileSync(newerPending, "utf8")).toContain(text);
    expect(stored(receiver.home)[0]?.completion).toBeUndefined();
    expect(stored(receiver.home)[0]?.doneAt).toBeUndefined();
    const olderRetry = `${context.command} --retry ${quote(firstPending)}`;
    const old = await reportingChild(olderRetry, origin.machine);
    expect(old.ok).toBe(true);
    expect(completionReceiptSchema.parse(JSON.parse(old.stdout))).toEqual(
      original,
    );
    expect(stored(receiver.home)[0]?.completion).toBeUndefined();
    expect(stored(receiver.home)[0]?.doneAt).toBeUndefined();
    const recovered = await reportingChild(
      `${context.command} --retry ${quote(newerPending)}`,
      origin.machine,
    );
    expect(recovered.ok).toBe(true);
    const receipt = completionReceiptSchema.parse(JSON.parse(recovered.stdout));
    expect(receipt).toMatchObject({ outcome: "unfinished", message: text });
    expect(stored(receiver.home)[0]?.completion?.receipt).toBe(receipt.receipt);
    expect(stored(receiver.home)[0]?.doneAt).toBeUndefined();
    expect((await reportingChild(olderRetry, origin.machine)).ok).toBe(true);
    expect(stored(receiver.home)[0]?.completion?.receipt).toBe(receipt.receipt);
    expect(stored(receiver.home)[0]?.doneAt).toBeUndefined();
  } finally {
    await receiver.close();
  }
});
