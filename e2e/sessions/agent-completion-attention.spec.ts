import { readFinalReport } from "../../dashboard/test-support/finalReportPages.ts";
import { completionReceiptSchema } from "../../dashboard/src/completionReport.ts";
// Real preview/launch/installed report child/store/polling/rendering. Only native transport is fake.
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { existsSync, writeFileSync, rmSync } from "node:fs";
import path from "node:path";
import {
  test,
  expect,
  stored,
} from "../../dashboard/test-support/support/codexStart.ts";
import {
  launch,
  machineSessions,
} from "../../dashboard/test-support/agentLaunchBoundary.ts";
import { makeMe } from "../../Distribution/tests/support/makeMe.mjs";
import { storyA } from "../../Distribution/tests/support/queued-repository.mjs";
import { publishCommittedOrigin } from "../../dashboard/test-support/committedOrigin.ts";
import {
  parts,
  sessionStateOf,
  sessionUnreadReportOf,
  shownDoneSessionEntriesOf,
  storyCardSessions,
} from "../../dashboard/test-support/dashboardPage.ts";
import { showColumn } from "../../dashboard/test-support/boardPage.ts";
import { expectInstalledReportingScript } from "../../dashboard/test-support/support/reportingInputAssertions.ts";
import { keepFinalReport } from "../../dashboard/test-support/support/retainedReport.ts";
import {
  buttonsAddedSince,
  messagePartOf,
  rememberButtons,
} from "../../dashboard/test-support/support/sessionMessagePart.ts";
import {
  startDashboardServer,
  sharedDashboardBuild,
} from "../../dashboard/test-support/support/dashboardServer.ts";
import { markDoneAnyway } from "../../dashboard/test-support/support/markDone.ts";
import {
  reloadUntilRead,
  untilPageRequestsAnswered,
} from "../../dashboard/test-support/pageRequestNotes.ts";
import { pausePageClockAt } from "../../dashboard/test-support/dashboardTest.ts";
import { watchRecordReads } from "../../dashboard/test-support/sessionStatePace.ts";

const exec = promisify(execFile);
const nativeReport = "The saved conversation's final report.";

// Accepted cost: one real launch with the installed report command, a
// workspace removal and a dashboard restart. Only this journey carries an
// attention report through column change, retirement, restart, Mark as read
// and Mark as done; its refused deliveries are proved in
// ../../dashboard/backend-tests/sessions/agent-completion-identity.spec.ts.
test("installed attention report stays open, durable and readable through column change, retirement, restart, Mark as read and Mark as done", async ({
  page,
  dashboard,
  origin,
  codexProtocol: native,
}) => {
  if (native === undefined) throw new Error("Missing native fixture");
  const published = await publishCommittedOrigin(page, {
    repoDir: origin.origin,
    revision: (await origin.originGit("rev-parse", "main")).trim(),
    repository: "terryyin/open-dough",
  });
  const started = await launch(
    dashboard,
    makeMe.aLaunchRequest.executing({ ...storyA, host: "codex" }).please(),
  );
  expect(started.status).toBe(200);
  const records = stored(dashboard.home);
  expect(records).toHaveLength(1);
  const [record] = records;
  expect(record?.firstInput?.state).toBe("confirmed");
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

  // Keep the Board on the queued revision and observe its settled read
  // before reporting. Each later receipt reaches it on one steady pace.
  await pausePageClockAt(page, new Date());
  const { passOnePace } = await watchRecordReads(page);
  await page.goto("/");
  const queued = parts(page).backlog.getByRole("article", {
    name: storyA.title,
    exact: true,
  });
  await expect(sessionStateOf(queued)).toHaveText("Working");
  await untilPageRequestsAnswered(page);
  const queuedReport = messagePartOf(queued);
  await expect(queuedReport.part).toHaveCount(0);
  const text =
    "Publication finished. Reminder: inspect the migration before release.\n<script>must remain text</script>";
  const message = path.join(origin.machine, "attention.txt");
  writeFileSync(message, text);
  // Reports through the installed command, from outside the workspace.
  const report = async (outcome: "completed" | "unfinished") => {
    const command = `${context.command} --outcome ${outcome} --message-file '${message}'`;
    const child = await exec("bash", ["-c", command], { cwd: origin.machine });
    return completionReceiptSchema.parse(JSON.parse(child.stdout));
  };
  const steering = ["turn/interrupt", "thread/name/set", "turn/start"];
  const nativeSince = (from: number, methods: readonly string[] = steering) =>
    native.calls.slice(from).filter((call) => methods.includes(call.method));
  const before = native.calls.length;
  const receipt = await report("completed");
  expect(receipt).toMatchObject({
    reference: context.reference,
    outcome: "completed",
    message: text,
    state: "recorded",
    session: { host: "codex", sessionId: native.threadId },
  });
  expect(stored(dashboard.home)[0]?.completion).toMatchObject({
    receipt: receipt.receipt,
    outcome: "completed",
    message: text,
  });
  expect(stored(dashboard.home)[0]?.doneAt).toBeUndefined();
  await passOnePace();
  await expect(queuedReport.text).toHaveText(text);
  await expect(queuedReport.part.locator("script")).toHaveCount(0);
  await expect(sessionStateOf(queued)).toHaveText("Working");
  await expect(sessionUnreadReportOf(queued)).toHaveText(
    "Unread report: Completed with attention",
  );
  await expect(queuedReport.markRead).toBeVisible();
  expect(nativeSince(before)).toEqual([]);
  const unfinished = await report("unfinished");
  expect(unfinished.outcome).toBe("unfinished");
  expect(stored(dashboard.home)[0]?.completion).toMatchObject({
    receipt: unfinished.receipt,
    outcome: "unfinished",
    message: text,
  });
  expect(stored(dashboard.home)[0]?.doneAt).toBeUndefined();
  await passOnePace();
  await expect(queuedReport.heading).toHaveAccessibleName("Unfinished work");
  const revision = (await origin.originGit("rev-parse", "main")).trim();
  published.advanceTo(revision);
  await reloadUntilRead(page);
  const claimed = parts(page).taken.getByRole("article", {
    name: storyA.title,
    exact: true,
  });
  await expect(messagePartOf(claimed).text).toHaveText(text);
  await expect(queued).toHaveCount(0);
  rmSync(workspace, { recursive: true, force: true });
  // The prepared installed copy remains callable after workspace removal.
  expect(existsSync(workspace)).toBe(false);
  const { receipt: retainedReceipt } = await report("unfinished");
  const port = Number(new URL(dashboard.baseURL).port);
  await dashboard.close();
  const restarted = await startDashboardServer({
    mode: "preview",
    prebuilt: sharedDashboardBuild,
    machine: origin.machine,
    github: dashboard.github,
    codexProtocol: native,
    port,
  });
  try {
    await reloadUntilRead(page);
    await expect(messagePartOf(claimed).text).toHaveText(text);
    expect(stored(restarted.home)[0]?.completion).toMatchObject({
      receipt: retainedReceipt,
      message: text,
    });
    keepFinalReport(native, workspace, nativeReport);
    // The final report is Codex's own; the message stays on the entry.
    const { panel, reportText } = await readFinalReport(claimed);
    await expect(reportText).toHaveText(nativeReport);
    await expect(panel).not.toContainText("Reminder: inspect the migration");
    await expect(
      panel.getByRole("button", { name: "Mark as read" }),
    ).toHaveCount(0);
    // Reading keeps the session open and adds no panel control. Mark as done
    // renames it and interrupts its observed in-progress turn.
    native.observations.set(native.threadId, {
      status: { type: "active", activeFlags: [] },
      turns: [{ id: "observed-turn", status: "inProgress" }],
    });
    const nativeBeforeDone = native.calls.length;
    await rememberButtons(panel);
    await showColumn(page, "Taken");
    await messagePartOf(claimed).markRead.click();
    await expect(messagePartOf(claimed).markRead).toHaveCount(0);
    await expect
      .poll(() => stored(restarted.home)[0]?.reportRead)
      .toBe(retainedReceipt);
    expect(stored(restarted.home)[0]?.doneAt).toBeUndefined();
    expect(await buttonsAddedSince(panel)).toEqual([]);
    await markDoneAnyway(panel);
    await expect(panel).toHaveCount(0);
    await expect(
      storyCardSessions(claimed).locator(".session-attention-message"),
    ).toHaveCount(0);
    expect(stored(restarted.home)[0]?.doneAt).toBeDefined();
    expect(stored(restarted.home)[0]?.doneProblem).toBeUndefined();
    const doneName = `done-${stored(restarted.home)[0]?.session.name ?? ""}`;
    await machineSessions(restarted);
    await reloadUntilRead(page);
    const doneEntry = await shownDoneSessionEntriesOf(
      page,
      storyA.title,
      native.threadId,
    );
    await expect(sessionStateOf(doneEntry)).toHaveText("Done");
    await expect(doneEntry).toContainText(`Named ${doneName}`);
    // Done, the message is collapsed under its label until expanded.
    const heading = doneEntry.getByRole("button", { name: "Unfinished work" });
    await expect(heading).toHaveAttribute("aria-expanded", "false");
    await heading.click();
    await expect(messagePartOf(doneEntry).text).toHaveText(text);
    await readFinalReport(doneEntry);
    await expect(reportText).toHaveText(nativeReport);
    expect(
      nativeSince(nativeBeforeDone, [...steering, "thread/resume"]),
    ).toEqual([
      {
        method: "thread/name/set",
        params: { threadId: native.threadId, name: doneName },
      },
      {
        method: "turn/interrupt",
        params: { threadId: native.threadId, turnId: "observed-turn" },
      },
    ]);
  } finally {
    await restarted.close();
  }
});
