// Selecting a retained ad hoc Recently done sessions row derives its unique
// published Done story (../../dashboard/src/recentlyDoneSelection.ts) without rewriting
// the Ad hoc label or request identity. Perspective, Side panel, and Open stay
// as for story-linked rows (../../dashboard/tests/sessions/recently-done-sessions-select.spec.ts). Absent
// evidence stays standalone. Development reveal of an older Done card lives in
// ./recently-done-sessions-select-ad-hoc-development.spec.ts.
import path from "node:path";
import { randomUUID } from "node:crypto";
import {
  expect,
  queuedCodexPreviewTest as test,
} from "../../dashboard/tests/support/preparationPage.ts";
import { parts } from "../../dashboard/tests/dashboardPage.ts";
import { expectProjectChoice } from "../../dashboard/tests/projectChoice.ts";
import { showRecentlyDone } from "../../dashboard/tests/recentlyDoneSessionsSidebarPage.ts";
import { authenticatedReadEndpoint } from "../../dashboard/src/authenticatedReadRules.ts";
import { completedStoryAssociationEndpoint } from "../../dashboard/src/completedStoryAssociation.ts";
import { retainAdHocCompletedStory } from "../../dashboard/tests/support/adHocCompletedAssociation.ts";
import { choiceStatus } from "../../dashboard/tests/recentlyDoneSelectionJourney.ts";
import {
  chooseStoryTab,
  storyTitle,
} from "../../dashboard/tests/support/intentStoryPage.ts";
import { publishIntentTrunk } from "../../dashboard/tests/support/intentStoryWorktree.ts";
import { publishCommittedOrigin } from "../../dashboard/tests/committedOrigin.ts";
import { makeMe } from "../../tests/support/makeMe.mjs";
import { doneRecordFileName } from "../../src/skills/dough-product-backlog/scripts/product-backlog-done-record.mjs";
import { keepLaunchRecords } from "../../dashboard/tests/support/launchStore.ts";
import { git } from "../../dashboard/tests/support/storyReviewWorktree.ts";
import { terminalPanel } from "../../dashboard/tests/terminalScreenPage.ts";
import { finalReportParts } from "../../dashboard/tests/finalReportPages.ts";

test.use({ preparationHost: "codex", projectFolders: ["open-dough"] });

const sessionTitle = "Ad hoc completed session";
const reportTitle = "Open Dough reported session";
const reportMessage = "Landed the reported change on main.";

test("selecting a completed ad hoc session from Intent selects its Done story, keeps Intent and Ad hoc, and leaves a miss standalone", async ({
  page,
  dashboard,
  origin,
}) => {
  // Real claim/completion publish plus Intent catalog and association reads.
  test.setTimeout(90_000);
  publishIntentTrunk(origin.project);
  const linked = await retainAdHocCompletedStory(dashboard, origin, {
    title: sessionTitle,
    landing: { repository: path.join(origin.project, ".git") },
    intentCoverage: {
      report:
        "Outcome: Caught\nPromise: Range-resume assessment survives cleanup.\nFault: Drop saved coverage after retirement.\nEvidence: The Range-resume baseline matched after restoration.\n",
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
    .launchedAt(new Date(Date.now() - 120_000).toISOString())
    .markedDoneAt(new Date(Date.now() - 90_000).toISOString())
    .please();
  keepLaunchRecords(dashboard, [linked.record, reported]);
  const catalog = git(
    origin.project,
    "show",
    "origin/main:.planning/done/.catalog.json",
  );
  expect(catalog).toContain(linked.identity);
  const published = git(origin.origin, "rev-parse", "main");
  await publishCommittedOrigin(page, {
    repoDir: origin.origin,
    revision: published,
    repository: "terryyin/open-dough",
    follows: true,
  });
  await page.setViewportSize({ width: 1600, height: 900 });
  await page.goto("/?perspective=intent");
  const { intentChoice, intent } = parts(page);
  await expect(intentChoice).toBeChecked();
  const shown = await showRecentlyDone(page);
  const row = shown.row(sessionTitle);
  const { reportText } = finalReportParts(page);

  await test.step("Open a report in the Side panel before selecting the ad hoc row", async () => {
    // Open routes to Development; return to Intent as select.spec does after
    // showReport, so Select keeps Intent with the report still visible.
    await shown.open(reportTitle).click();
    await expect(reportText).toHaveText(reportMessage);
    await expect(shown.select(reportTitle)).toHaveAttribute(
      "aria-current",
      "true",
    );
    await intentChoice.click();
    await expect(intent).toBeVisible();
    await expect(reportText).toHaveText(reportMessage);
  });

  await test.step("Select links the ad hoc row to Story A, keeps Intent and the Side panel report, and skips blanket Done bodies during association", async () => {
    const linkedDoneFile = doneRecordFileName(linked.identity);
    const bodyRequestsDuringLookup: string[][] = [];
    let watchingLookup = false;
    const onRequest = (request: { url: () => string }) => {
      if (!watchingLookup) return;
      const url = new URL(request.url());
      if (
        url.pathname === authenticatedReadEndpoint &&
        url.searchParams.get("done") === "bodies"
      )
        bodyRequestsDuringLookup.push(url.searchParams.getAll("file"));
    };
    page.on("request", onRequest);
    const associationRequest = page.waitForRequest(
      (request) =>
        request.url().includes(completedStoryAssociationEndpoint) &&
        request.method() === "GET",
    );
    const association = page.waitForResponse(
      (response) =>
        response.url().includes(completedStoryAssociationEndpoint) &&
        response.request().method() === "GET",
    );
    await shown.select(sessionTitle).click();
    await associationRequest;
    watchingLookup = true;
    const answered = await association;
    watchingLookup = false;
    page.off("request", onRequest);
    expect(answered.ok()).toBe(true);
    expect(await answered.json()).toEqual({
      kind: "linked",
      identity: linked.identity,
    });
    // Association is server-side git. Intent may race a single linked Done
    // body before Playwright settles the association response; bulk Done
    // bodies (no file, or any file other than the linked story) must not.
    for (const files of bodyRequestsDuringLookup)
      expect(files).toEqual([linkedDoneFile]);
    await expect(shown.select(sessionTitle)).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    await expect(choiceStatus(row)).toHaveCount(0);
    await expectProjectChoice(page, "Open Dough");
    await expect(intentChoice).toBeChecked();
    await expect(intent).toHaveAttribute(
      "data-selected-story",
      linked.identity,
    );
    await expect(storyTitle(intent)).toHaveText(linked.title, {
      timeout: 30_000,
    });
    await expect(row).toHaveClass(/\bchosen\b/);
    await expect(choiceStatus(row)).toHaveCount(0);
    await expect(shown.select(sessionTitle)).toHaveAttribute(
      "title",
      /(^|\n)Open Dough · Ad hoc(\n|$)/,
    );
    await expect(reportText).toHaveText(reportMessage);
    await expect(terminalPanel(page)).toHaveCount(0);
    await expect(shown.select(reportTitle)).toHaveAttribute(
      "aria-current",
      "true",
    );
  });

  await test.step("Intent coverage shows the saved Range-resume assessment", async () => {
    await chooseStoryTab(intent, "Intent coverage");
    const coverage = intent.getByRole("region", { name: "Intent coverage" });
    await expect(coverage.locator(".intent-story-coverage-text")).toContainText(
      "Range-resume assessment survives cleanup.",
    );
  });

  await test.step("a session without matching claim stays standalone and keeps the story", async () => {
    const alone = makeMe.aLaunchRecord
      .adHoc({
        instruction: "Standalone miss",
        title: "Standalone miss",
      })
      .reportingThrough({
        origin: dashboard.origin,
        reference: randomUUID(),
        command: "report",
      })
      .markedDoneAt(new Date().toISOString())
      .launchedAt(new Date(Date.now() - 30_000).toISOString())
      .please();
    keepLaunchRecords(dashboard, [linked.record, reported, alone]);
    await page.reload();
    await expect(intentChoice).toBeChecked();
    const after = await showRecentlyDone(page);
    await expect(after.select(sessionTitle)).toBeVisible();
    await expect(after.entries).toHaveCount(3);
    await after.select(sessionTitle).click();
    await expect(intent).toHaveAttribute(
      "data-selected-story",
      linked.identity,
    );
    await after.select("Standalone miss").click();
    await expect(after.select("Standalone miss")).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    await expect(intent).toHaveAttribute(
      "data-selected-story",
      linked.identity,
    );
    await expectProjectChoice(page, "Open Dough");
    await expect(intentChoice).toBeChecked();
  });
});
