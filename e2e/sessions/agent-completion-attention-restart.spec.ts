// The installed reporting entry point keeps attention across a Take and restart.
import { execFile } from "node:child_process";
import { existsSync, writeFileSync, rmSync } from "node:fs";
import path from "node:path";
import { promisify } from "node:util";
import { makeMe } from "../../Distribution/tests/support/makeMe.mjs";
import { storyA } from "../../Distribution/tests/support/queued-repository.mjs";
import { completionReceiptSchema } from "../../dashboard/src/completionReport.ts";
import { launch } from "../../dashboard/test-support/agentLaunchBoundary.ts";
import { publishCommittedOrigin } from "../../dashboard/test-support/committedOrigin.ts";
import { pausePageClockAt } from "../../dashboard/test-support/dashboardTest.ts";
import {
  parts,
  sessionStateOf,
  sessionUnreadReportOf,
} from "../../dashboard/test-support/dashboardPage.ts";
import {
  reloadUntilRead,
  untilPageRequestsAnswered,
} from "../../dashboard/test-support/pageRequestNotes.ts";
import { defaultRepository } from "../../dashboard/test-support/publishedOriginBasics.ts";
import { storyCard } from "../../dashboard/test-support/storyCardControls.ts";
import { watchRecordReads } from "../../dashboard/test-support/sessionStatePace.ts";
import {
  expect,
  stored,
  test,
} from "../../dashboard/test-support/support/codexStart.ts";
import {
  startDashboardServer,
  sharedDashboardBuild,
} from "../../dashboard/test-support/support/dashboardServer.ts";
import {
  expectServedHomesReach,
  routeServedHomesToPublication,
} from "../../dashboard/test-support/support/fixtureOriginRoute.ts";
import { expectInstalledReportingScript } from "../../dashboard/test-support/support/reportingInputAssertions.ts";
import { originMain } from "../../dashboard/test-support/support/sessionDialog.ts";
import { messagePartOf } from "../../dashboard/test-support/support/sessionMessagePart.ts";

const exec = promisify(execFile);
const changesThread = ({ method }: { method: string }) =>
  /^(turn\/(start|interrupt)|thread\/(resume|name\/set))$/.test(method);

// Refused installed reports are proved in
// ../../dashboard/backend-tests/sessions/agent-completion-identity.spec.ts.
test("Installed attention survives restart", async ({
  page,
  dashboard,
  origin,
}) => {
  const native = dashboard.codex;
  const queuedRevision = await originMain(origin);
  await publishCommittedOrigin(page, {
    repoDir: origin.origin,
    revision: queuedRevision,
    repository: defaultRepository,
    follows: true,
  });
  const started = await launch(
    dashboard,
    makeMe.aLaunchRequest.executing({ ...storyA, host: "codex" }).please(),
  );
  expect(started.status).toBe(200);
  const records = () => stored(dashboard.home);
  expect(records()).toMatchObject([{ firstInput: { state: "confirmed" } }]);
  const [record] = records();
  if (record?.request.reporting === undefined)
    throw new Error("No actual reporting context");
  const context = record.request.reporting;
  const input = native.calls.find((call) => call.method === "turn/start")
    ?.params["input"];
  expect(JSON.stringify(input)).toContain(context.command);
  expect(context.origin).toBe(dashboard.origin);
  const workspace = record.start?.workspace;
  if (workspace === undefined) throw new Error("No selected workspace");
  expectInstalledReportingScript(workspace);

  // Keep the queued Board snapshot observable after the native Take.
  const snapshot = path.join(origin.machine, "board-origin.git");
  await exec("git", ["clone", "--quiet", "--bare", origin.origin, snapshot]);
  const published = await publishCommittedOrigin(page, {
    repoDir: snapshot,
    revision: queuedRevision,
    repository: defaultRepository,
  });
  routeServedHomesToPublication(dashboard.github, defaultRepository);
  expectServedHomesReach(dashboard.github, defaultRepository, queuedRevision);
  await pausePageClockAt(page, new Date());
  const { passOnePace } = await watchRecordReads(page);
  await page.goto("/");
  const { backlog, taken } = parts(page);
  const queued = storyCard(backlog, storyA.title);
  await expect(sessionStateOf(queued)).toHaveText("Working");
  await untilPageRequestsAnswered(page);
  const queuedReport = messagePartOf(queued);
  await expect(queuedReport.part).toHaveCount(0);
  const text =
    "Publication finished. Reminder: inspect the migration before release.\n<script>must remain text</script>";
  const message = path.join(origin.machine, "attention.txt");
  writeFileSync(message, text);
  const report = async (outcome: "completed" | "unfinished") => {
    const command = `${context.command} --outcome ${outcome} --message-file '${message}'`;
    const { stdout } = await exec("bash", ["-c", command], {
      cwd: origin.machine,
    });
    return completionReceiptSchema.parse(JSON.parse(stdout));
  };
  const before = native.calls.length;
  const receipt = await report("completed");
  expect(receipt).toMatchObject({
    reference: context.reference,
    outcome: "completed",
    message: text,
    state: "recorded",
    session: { host: "codex", sessionId: native.threadId },
  });
  expect(records()[0]?.completion).toMatchObject({
    receipt: receipt.receipt,
    outcome: "completed",
    message: text,
  });
  expect(records()[0]?.doneAt).toBeUndefined();
  await passOnePace();
  await expect(queuedReport.text).toHaveText(text);
  await expect(queuedReport.part.locator("script")).toHaveCount(0);
  await expect(sessionStateOf(queued)).toHaveText("Working");
  await expect(sessionUnreadReportOf(queued)).toHaveText(
    "Unread report: Completed with attention",
  );
  await expect(queuedReport.markRead).toBeVisible();
  expect(native.calls.slice(before).filter(changesThread)).toEqual([]);
  const unfinished = await report("unfinished");
  expect(unfinished.outcome).toBe("unfinished");
  expect(records()[0]?.completion).toMatchObject({
    receipt: unfinished.receipt,
    outcome: "unfinished",
    message: text,
  });
  expect(records()[0]?.doneAt).toBeUndefined();
  await passOnePace();
  await expect(queuedReport.heading).toHaveAccessibleName("Unfinished work");
  const revision = await originMain(origin);
  expect(revision).not.toBe(queuedRevision);
  published.advanceTo(revision);
  expectServedHomesReach(dashboard.github, defaultRepository, revision);
  await reloadUntilRead(page);
  const claimed = storyCard(taken, storyA.title);
  await expect(messagePartOf(claimed).text).toHaveText(text);
  await expect(queued).toHaveCount(0);
  rmSync(workspace, { recursive: true, force: true });
  // The prepared installed copy remains callable after workspace removal.
  expect(existsSync(workspace)).toBe(false);
  const { receipt: retainedReceipt } = await report("unfinished");
  await dashboard.close();
  const restarted = await startDashboardServer({
    mode: "preview",
    prebuilt: sharedDashboardBuild,
    machine: origin.machine,
    github: dashboard.github,
    codexProtocol: native,
    port: Number(new URL(dashboard.baseURL).port),
  });
  try {
    expectServedHomesReach(restarted.github, defaultRepository, revision);
    await reloadUntilRead(page);
    await expect(messagePartOf(claimed).text).toHaveText(text);
    expect(stored(restarted.home)[0]?.completion).toMatchObject({
      receipt: retainedReceipt,
      message: text,
    });
  } finally {
    await restarted.close();
  }
});
