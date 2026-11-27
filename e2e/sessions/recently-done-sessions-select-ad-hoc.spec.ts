// Selecting a retained ad hoc Recently done sessions row, after worktree
// retirement and trunk advance, opens its published Done story in Intent with
// its Ad hoc label, the open report, Intent coverage and historical Review
// (../../dashboard/src/recentlyDoneSelection.ts). In Development it reveals the
// card even beyond the Board's default 30-day window
// (../../dashboard/src/recentlyDoneView.ts). An unbound record stays out.
import path from "node:path";
import { randomUUID } from "node:crypto";
import {
  expect,
  test,
} from "../../dashboard/test-support/support/preparationPage.ts";
import { parts } from "../../dashboard/test-support/dashboardPage.ts";
import { expectProjectChoice } from "../../dashboard/test-support/projectChoice.ts";
import { showRecentlyDone } from "../../dashboard/test-support/recentlyDoneSessionsSidebarPage.ts";
import { authenticatedReadEndpoint } from "../../dashboard/src/authenticatedReadRules.ts";
import { retainAdHocCompletedStory } from "../../dashboard/test-support/support/adHocCompletedStory.ts";
import {
  browseStoryFiles,
  chooseStoryTab,
  storyHeaderReading,
  storyTitle,
} from "../../dashboard/test-support/support/intentStoryPage.ts";
import { publishIntentTrunk } from "../../dashboard/test-support/support/intentStoryWorktree.ts";
import { publishCommittedOrigin } from "../../dashboard/test-support/committedOrigin.ts";
import { publishDoneStoryCompletedAt } from "../../dashboard/test-support/support/completedStoryPublication.ts";
import { makeMe } from "../../Distribution/tests/support/makeMe.mjs";
import { doneRecordFileName } from "../../Distribution/src/skills/dough-product-backlog/scripts/product-backlog-done-record.mjs";
import { keepLaunchRecords } from "../../dashboard/test-support/support/launchStore.ts";
import { git } from "../../dashboard/test-support/support/storyReviewWorktree.ts";
import { expectSelected } from "../../dashboard/test-support/storyCardSelection.ts";
import { terminalPanel } from "../../dashboard/test-support/terminalScreenPage.ts";
import { finalReportParts } from "../../dashboard/test-support/finalReportPages.ts";

test.use({ preparationHost: "codex", projectFolders: ["open-dough"] });

const sessionTitle = "Ad hoc completed session";
const reportTitle = "Open Dough reported session";
const reportMessage = "Landed the reported change on main.";
const executionTitle = "Older execution session";
const vendorPath = "tests/fixtures/sharadar_vendor.py";
const day = 24 * 60 * 60_000;
const adHocLabel = /(^|\n)Open Dough · Ad hoc(\n|$)/;

test("selecting a completed ad hoc session opens its Done story in Intent with history and reveals its card in Development", async ({
  page,
  dashboard,
  origin,
}) => {
  publishIntentTrunk(origin.project);
  const now = Date.now();
  const linked = await retainAdHocCompletedStory(dashboard, origin, {
    title: sessionTitle,
    landingRepository: path.join(origin.project, ".git"),
    intentCoverage: {
      report:
        "Outcome: Caught\nPromise: Range-resume assessment survives cleanup.\nFault: Drop saved coverage after retirement.\nEvidence: The Range-resume baseline matched after restoration.\n",
    },
    implementation: (workspace) => {
      makeMe
        .theWorkspace(workspace)
        .writeAt(
          vendorPath,
          '"""Sharadar vendor fixture edited by the ad hoc completion."""\nVALUE = 13\n',
        )
        .please();
    },
  });
  const reported = makeMe.aLaunchRecord
    .executing({ identity: "SEED-301#queued", title: reportTitle })
    .onStoryBranch({
      workspace: path.join(origin.machine, "retired-report-workspace"),
      branch: "claude/reported",
    })
    .inClaudeSession({ sessionId: "reported-session", shortId: "reported" })
    .completedWith({ message: reportMessage })
    .launchedAt(new Date(now - 120_000).toISOString())
    .markedDoneAt(new Date(now - 90_000).toISOString())
    .please();
  const execution = makeMe.aLaunchRecord
    .executing({ identity: linked.identity, title: executionTitle })
    .launchedAt(new Date(now - 150_000).toISOString())
    .markedDoneAt(new Date(now - 140_000).toISOString())
    .please();
  keepLaunchRecords(dashboard, [linked.record, reported, execution]);
  // Publish the Done record past the Board window; the retained session stays
  // within launch retention.
  publishDoneStoryCompletedAt(
    origin.project,
    new Date(now - 40 * day),
    linked.identity,
  );
  const doneFile = doneRecordFileName(linked.identity);
  const published = git(origin.origin, "rev-parse", "main");
  expect(published).not.toBe(linked.completion);
  await publishCommittedOrigin(page, {
    repoDir: origin.origin,
    revision: published,
    repository: "terryyin/open-dough",
    follows: true,
  });
  await page.setViewportSize({ width: 1600, height: 900 });
  await page.goto("/?perspective=intent");
  const { intentChoice, intent } = parts(page);
  const shown = await showRecentlyDone(page);
  const { reportText } = finalReportParts(page);

  await test.step("Open a report in the Side panel, then return to Intent", async () => {
    await shown.open(reportTitle).click();
    await expect(reportText).toHaveText(reportMessage);
    await intentChoice.click();
    await expect(intent).toBeVisible();
  });

  await test.step("Select opens the saved story, keeps Intent and the report, and reads only its Done body", async () => {
    const bodyRequests: string[][] = [];
    const onRequest = (request: { url: () => string }) => {
      const url = new URL(request.url());
      if (
        url.pathname === authenticatedReadEndpoint &&
        url.searchParams.get("done") === "bodies"
      )
        bodyRequests.push(url.searchParams.getAll("file"));
    };
    page.on("request", onRequest);
    await shown.select(sessionTitle).click();
    await expect(shown.select(sessionTitle)).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    await expectProjectChoice(page, "Open Dough");
    await expect(intentChoice).toBeChecked();
    await expect(intent).toHaveAttribute(
      "data-selected-story",
      linked.identity,
    );
    await expect(storyTitle(intent)).toHaveText(linked.title);
    page.off("request", onRequest);
    expect(bodyRequests).toContainEqual([doneFile]);
    for (const files of bodyRequests) expect(files).toEqual([doneFile]);
    await expect(shown.row(sessionTitle)).toHaveClass(/\bchosen\b/);
    await expect(shown.choiceStatus(sessionTitle)).toHaveCount(0);
    await expect(shown.select(sessionTitle)).toHaveAttribute(
      "title",
      adHocLabel,
    );
    await expect(reportText).toHaveText(reportMessage);
    await expect(terminalPanel(page)).toHaveCount(0);
    await expect(shown.select(reportTitle)).toHaveAttribute(
      "aria-current",
      "true",
    );
  });

  await test.step("Intent coverage keeps the saved Range-resume assessment", async () => {
    await chooseStoryTab(intent, "Intent coverage");
    await expect(
      intent
        .getByRole("region", { name: "Intent coverage" })
        .locator(".intent-story-coverage-text"),
    ).toContainText("Range-resume assessment survives cleanup.");
  });

  await test.step("historical comparison names its own baseline and completion", async () => {
    await browseStoryFiles(intent);
    const { publishedBaseline, publishedCompletion } =
      storyHeaderReading(intent);
    await expect(publishedCompletion).toHaveText(linked.completion);
    await expect(publishedBaseline).toHaveText(/^[a-f0-9]{40}$/);
    const baseline = await publishedBaseline.innerText();
    expect(baseline).not.toBe(published);
    expect(baseline).not.toBe(linked.completion);
  });

  await test.step("an unbound retained record stays outside active selection", async () => {
    const alone = makeMe.aLaunchRecord
      .adHoc({ instruction: "Standalone miss", title: "Standalone miss" })
      .reportingThrough({
        origin: dashboard.origin,
        reference: randomUUID(),
        command: "report",
      })
      .markedDone()
      .launchedAt(new Date(now - 30_000).toISOString())
      .please();
    keepLaunchRecords(dashboard, [linked.record, reported, execution, alone]);
    await page.reload();
    const after = await showRecentlyDone(page);
    await expect(after.select(sessionTitle)).toBeVisible();
    await expect(after.entries).toHaveCount(3);
    await expect(after.select("Standalone miss")).toHaveCount(0);
  });

  await test.step("in Development, selection reveals the card beyond the Board window", async () => {
    await page.goto("/");
    const shownDone = await showRecentlyDone(page);
    const card = parts(page).recentlyDone.getByRole("article", {
      name: linked.title,
      exact: true,
    });
    await expect(shownDone.reviewCue(sessionTitle)).toBeVisible();
    await expect(shownDone.reviewCue(executionTitle)).toHaveCount(0);
    await shownDone.select(executionTitle).click();
    await expect(shownDone.select(executionTitle)).toHaveAttribute(
      "aria-pressed",
      "false",
    );
    await expect(card).toHaveCount(0);
    await shownDone.select(sessionTitle).click();
    await expectProjectChoice(page, "Open Dough");
    await expect(shownDone.select(sessionTitle)).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    await expectSelected(card, true);
    await expect(card).toBeInViewport();
    await expect(shownDone.select(sessionTitle)).toHaveAttribute(
      "title",
      adHocLabel,
    );
  });
});
