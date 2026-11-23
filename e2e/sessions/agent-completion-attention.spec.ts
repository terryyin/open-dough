// Real dashboard, published Git and store. Codex answers through a fake native transport.
import { readFinalReport } from "../../dashboard/test-support/finalReportPages.ts";
import { completionReceiptSchema } from "../../dashboard/src/completionReport.ts";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { existsSync, writeFileSync, rmSync } from "node:fs";
import path from "node:path";
import { test as start } from "../../dashboard/test-support/support/codexStart.ts";
import {
  expect,
  stored,
  test,
} from "../../dashboard/test-support/support/codexLaunch.ts";
import { codexEndpoint } from "../../dashboard/test-support/support/fakeCodex.ts";
import { keepLaunchRecords } from "../../dashboard/test-support/support/launchStore.ts";
import { launch } from "../../dashboard/test-support/agentLaunchBoundary.ts";
import { makeMe } from "../../Distribution/tests/support/makeMe.mjs";
import {
  storyA,
  storyB,
} from "../../Distribution/tests/support/queued-repository.mjs";
import { publishCommittedOrigin } from "../../dashboard/test-support/committedOrigin.ts";
import { publishStoryColumnsJourney } from "../../dashboard/test-support/launchJourney.ts";
import { storyCard } from "../../dashboard/test-support/storyCardControls.ts";
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
  expectCollapsed,
  messagePartOf,
  rememberButtons,
} from "../../dashboard/test-support/support/sessionMessagePart.ts";
import {
  startDashboardServer,
  sharedDashboardBuild,
} from "../../dashboard/test-support/support/dashboardServer.ts";
import { markDoneAnyway } from "../../dashboard/test-support/support/markDone.ts";
import {
  openUntilRead,
  reloadUntilRead,
  untilPageRequestsAnswered,
} from "../../dashboard/test-support/pageRequestNotes.ts";
import { pausePageClockAt } from "../../dashboard/test-support/dashboardTest.ts";
import { watchRecordReads } from "../../dashboard/test-support/sessionStatePace.ts";

const exec = promisify(execFile);
const repository = "terryyin/open-dough";
const changesThread = ({ method }: { method: string }) =>
  /^(turn\/(start|interrupt)|thread\/(resume|name\/set))$/.test(method);

// Refused installed reports are proved in
// ../../dashboard/backend-tests/sessions/agent-completion-identity.spec.ts.
start(
  "Installed attention survives restart",
  async ({ page, dashboard, origin }) => {
    const native = dashboard.codex;
    const published = await publishCommittedOrigin(page, {
      repoDir: origin.origin,
      revision: (await origin.originGit("rev-parse", "main")).trim(),
      repository,
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

    // Keep the Board on the queued revision and observe its settled read
    // before reporting. Each later receipt reaches it on one steady pace.
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
    const revision = (await origin.originGit("rev-parse", "main")).trim();
    published.advanceTo(revision);
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
      await reloadUntilRead(page);
      await expect(messagePartOf(claimed).text).toHaveText(text);
      expect(stored(restarted.home)[0]?.completion).toMatchObject({
        receipt: retainedReceipt,
        message: text,
      });
    } finally {
      await restarted.close();
    }
  },
);

test.use({ projectFolders: ["open-dough"] });
test("Read leaves the session open for Done", async ({ page, dashboard }) => {
  const native = dashboard.codex;
  const { threadId } = native;
  const { origin: repoDir, taken: revision } =
    await publishStoryColumnsJourney();
  await publishCommittedOrigin(page, { repoDir, revision, repository });
  const workspace = path.join(dashboard.home, "retired-workspace");
  const reminder = "Inspect the migration before release.";
  const nativeReport = "The saved conversation's final report.";
  const turnId = "observed-turn";
  const record = makeMe.aLaunchRecord
    .executing(storyB)
    .inCodexSession({
      sessionId: threadId,
      continuation: { workspace, endpoint: codexEndpoint(native) },
    })
    .onStoryBranch({
      workspace,
      branch: "codex/story-b",
      publishedSha: revision,
    })
    .launchedAt(new Date().toISOString())
    .withFirstInput({ state: "confirmed", turnId })
    .completedWith({ outcome: "unfinished", message: reminder })
    .please();
  keepLaunchRecords(dashboard, [record]);
  keepFinalReport(native, workspace, nativeReport);
  native.observations.set(threadId, {
    status: { type: "active", activeFlags: [] },
    turns: [{ id: turnId, status: "inProgress" }],
  });
  await openUntilRead(page);
  const claimed = storyCard(parts(page).taken, storyB.title);
  const { panel, reportText } = await readFinalReport(claimed);
  await expect(reportText).toHaveText(nativeReport);
  await expect(panel).not.toContainText(reminder);
  await expect(panel.getByRole("button", { name: "Mark as read" })).toHaveCount(
    0,
  );
  await rememberButtons(panel);
  await showColumn(page, "Taken");
  const { text, markRead } = messagePartOf(claimed);
  await expect(text).toHaveText(reminder);
  await expect(markRead).toBeVisible();
  await markRead.click();
  await expect(markRead).toHaveCount(0);
  const current = () => stored(dashboard.home)[0];
  await expect
    .poll(() => current()?.reportRead)
    .toBe(record.completion?.receipt);
  expect(current()?.doneAt).toBeUndefined();
  expect(await buttonsAddedSince(panel)).toEqual([]);
  const beforeDone = native.calls.length;
  await markDoneAnyway(panel);
  await expect(panel).toHaveCount(0);
  await expect(messagePartOf(storyCardSessions(claimed)).part).toHaveCount(0);
  expect(current()?.doneAt).toBeDefined();
  expect(current()?.doneProblem).toBeUndefined();
  const doneName = `done-${record.session.name}`;
  const done = await shownDoneSessionEntriesOf(page, storyB.title, threadId);
  await expect(sessionStateOf(done)).toHaveText("Done");
  await expect(done).toContainText(`Named ${doneName}`);
  const doneMessage = messagePartOf(done);
  await expectCollapsed(doneMessage, "Unfinished work");
  await doneMessage.heading.click();
  await expect(doneMessage.text).toHaveText(reminder);
  const doneReport = await readFinalReport(done);
  await expect(doneReport.reportText).toHaveText(nativeReport);
  expect(native.calls.slice(beforeDone).filter(changesThread)).toEqual([
    { method: "thread/name/set", params: { threadId, name: doneName } },
    { method: "turn/interrupt", params: { threadId, turnId } },
  ]);
});
