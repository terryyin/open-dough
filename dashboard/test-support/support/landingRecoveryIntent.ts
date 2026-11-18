// Native writers, newer completion and a separate launch preserve the old landing.
import { writeFileSync } from "node:fs";
import path from "node:path";
import { expect } from "@playwright/test";
import type { LaunchRecord } from "../../src/launchRecord.ts";
import type { LandingReceipt, LaunchLanding } from "../../src/launchLanding.ts";
import { completionSchema } from "../../src/completionReport.ts";
import type { DashboardServer } from "./dashboardServer.ts";
import type { FakeCodex } from "./fakeCodex.ts";
import { launch } from "../agentLaunchBoundary.ts";
import { stored } from "./codexStart.ts";
import {
  reportingChild,
  recordOperation,
  quote,
} from "./completionRecovery.ts";

export async function observeLandingRecoveryIntent(options: {
  receiver: DashboardServer;
  original: LaunchRecord;
  stale: LaunchRecord;
  native: FakeCodex;
  cwd: string;
  retry: string;
  first: LandingReceipt;
  reserved: LaunchLanding | undefined;
  env: NodeJS.ProcessEnv;
}) {
  const { receiver, original, stale, cwd, retry, first, reserved, env } =
    options;
  const native = options.native;
  const reporting = original.request.reporting;
  if (reporting === undefined) throw new Error("No reporting context");
  const message = path.join(cwd, "landing-attention.txt");
  writeFileSync(
    message,
    "Publication accepted. Inspect the release migration.",
  );
  const completion = await reportingChild(
    `${reporting.command} --outcome completed --message-file ${quote(message)}`,
    cwd,
  );
  expect(completion.ok, completion.stderr).toBe(true);
  const completed = stored(receiver.home)[0]?.completion;
  if (completed === undefined) throw new Error("No newer completion");
  await recordOperation(receiver, "setRecordReportRead", [
    "open-dough",
    original.session,
    completed.receipt,
  ]);
  await recordOperation(receiver, "setRecordDoneAt", [
    "open-dough",
    original.session,
    new Date().toISOString(),
  ]);
  const durable = stored(receiver.home)[0];
  native.threadId = "a-newer-launch";
  const launched = await launch(receiver, {
    source: "open-dough",
    host: "codex",
    workflow: "ad-hoc",
    instruction: "A new independent assignment",
  });
  expect(JSON.parse(launched.body)).toMatchObject({ kind: "launched" });
  const newer = stored(receiver.home).at(-1);
  await Promise.all([
    recordOperation(receiver, "bindRecord", ["open-dough", stale]),
    recordOperation(receiver, "updateRecord", ["open-dough", stale]),
  ]);
  expect(JSON.parse((await reportingChild(retry, cwd, env)).stdout)).toEqual(
    first,
  );
  const final = stored(receiver.home).find(
    (entry) => entry.request.reporting?.reference === reporting.reference,
  );
  expect(final).toMatchObject({
    landing: reserved,
    completion: completionSchema.parse(completed),
    doneAt: durable?.doneAt,
    dispositionChangedAt: durable?.dispositionChangedAt,
    reportRead: completed.receipt,
    firstInput: { explanation: "Later native input evidence" },
  });
  expect(
    stored(receiver.home).find(
      (entry) => entry.session.sessionId === newer?.session.sessionId,
    ),
  ).toEqual(newer);
}
