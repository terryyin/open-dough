// Recorded Cursor workspace retirement uses the shared passive final report:
// the retained explicit report is Cursor's result source, read without
// opening, resuming, or taking control of the session.
import { readFileSync, rmSync } from "node:fs";
import path from "node:path";
import { test, expect } from "./dashboardTest.ts";
import { stored } from "./support/codexLaunch.ts";
import {
  storyCardAttentionOf,
  storyCardSessions,
  parts,
  sessionStateOf,
} from "./dashboardPage.ts";
import {
  publishStoryColumnsJourney,
  notRefinedStory,
  type StoryColumnsJourney,
} from "./launchJourney.ts";
import { openStoryColumnsJourney } from "./storyColumnsPage.ts";
import {
  keepTrackedClosureEvidence,
  plantTrackedClosureRepository,
  recordedCursor,
  report,
  save,
  storeFile,
} from "./support/retainedReport.ts";
import { reloadUntilRead } from "./pageRequestNotes.ts";
import { markDone } from "./support/markDone.ts";
import {
  productClosureEvidencePresent,
  workspaceMissing,
} from "../src/sessionAccess.ts";

test.use({ projectFolders: ["open-dough"] });
let journey: StoryColumnsJourney;
test.beforeAll(async () => {
  test.setTimeout(120_000);
  journey = await publishStoryColumnsJourney();
});
test.afterAll(() => (journey as StoryColumnsJourney | undefined)?.cleanup());

test("retired Cursor workspace opens retained report without opening terminal and preserves read/done intent", async ({
  page,
  dashboard,
}) => {
  const { record, workspace } = await recordedCursor(dashboard);
  rmSync(workspace, { recursive: true });
  const baseline = readFileSync(storeFile(dashboard.home), "utf8");
  const { card, settled } = await openStoryColumnsJourney(page, journey);
  await reloadUntilRead(page);
  await settled();
  const entry = storyCardSessions(card(notRefinedStory));
  await expect(sessionStateOf(entry)).toContainText("Completed with attention");
  await expect(storyCardAttentionOf(card(notRefinedStory))).toHaveText(
    "1 session needs attention",
  );
  await expect(entry).toContainText("saved workspace is missing");
  await expect(
    entry.getByText(workspaceMissing, { exact: true }),
  ).toBeVisible();
  await entry.getByRole("button", { name: "Read final report" }).click();
  const panel = page.getByRole("region", { name: "Final report" });
  await expect(panel.locator(".final-report-text")).toHaveText(report);
  await expect(panel).toContainText(
    "Mark as done acknowledges this session; it does not complete the story.",
  );
  await expect(panel).toContainText(workspace);
  await expect(
    page.getByRole("region", { name: "Terminal", exact: true }),
  ).toHaveCount(0);
  // Reading is passive: it changes no read or done mark in the saved record.
  expect(readFileSync(storeFile(dashboard.home), "utf8")).toBe(baseline);
  await panel.getByRole("button", { name: "Close", exact: true }).click();
  await entry.getByRole("button", { name: "Mark as read" }).click();
  await expect
    .poll(() => stored(dashboard.home)[0]?.reportRead)
    .toBe(record.completion?.receipt);
  await expect(sessionStateOf(entry)).toContainText("Completed with attention");
  await expect(entry.locator(".session-unread-report")).toHaveCount(0);
  await entry.getByRole("button", { name: "Read final report" }).click();
  await expect(panel.locator(".final-report-text")).toHaveText(report);
  await markDone(panel);
  await expect(panel).toHaveCount(0);
  const doneAt = stored(dashboard.home)[0]?.doneAt;
  expect(doneAt).toBeDefined();
  await reloadUntilRead(page);
  await settled();
  const recent = parts(page)
    .recentlyDone.getByRole("article")
    .filter({ hasText: record.session.sessionId });
  await expect(recent).toContainText("Done");
  await recent.getByRole("button", { name: "Read final report" }).click();
  await expect(panel.locator(".final-report-text")).toHaveText(report);
  await expect(
    page.getByRole("region", { name: "Terminal", exact: true }),
  ).toHaveCount(0);
  expect(stored(dashboard.home)[0]?.doneAt).toBe(doneAt);
});

test("missing Cursor workspace with quiet empty completion keeps report and directory facts independent", async ({
  page,
  dashboard,
}) => {
  const { workspace } = await recordedCursor(dashboard, "");
  rmSync(workspace, { recursive: true });
  const baseline = readFileSync(storeFile(dashboard.home), "utf8");
  const { card, settled } = await openStoryColumnsJourney(page, journey);
  await settled();
  await storyCardSessions(card(notRefinedStory))
    .getByRole("button", { name: "Read final report" })
    .click();
  const panel = page.getByRole("region", { name: "Final report" });
  await expect(panel).toContainText(
    "Quiet completion was recorded with no attention message.",
  );
  await expect(panel).toContainText(
    "Cursor cannot read a native final report here.",
  );
  await expect(panel).toContainText("The saved conversation is unchanged.");
  await expect(panel).toContainText(workspaceMissing);
  await expect(panel).not.toContainText(
    "No retained final report is available.",
  );
  await expect(panel).not.toContainText(productClosureEvidencePresent);
  await expect(panel.locator(".final-report-text")).toHaveCount(0);
  await expect(
    page.getByRole("region", { name: "Terminal", exact: true }),
  ).toHaveCount(0);
  expect(readFileSync(storeFile(dashboard.home), "utf8")).toBe(baseline);
});

test("missing Cursor workspace without completion states product closure, unavailable terminal, and unsaved final message separately", async ({
  page,
  dashboard,
}) => {
  const { record, workspace } = await recordedCursor(dashboard, "");
  const closureRepository = path.join(dashboard.home, "closure-repository");
  const { revision } = plantTrackedClosureRepository(closureRepository);
  const closed = keepTrackedClosureEvidence(
    record,
    closureRepository,
    revision,
    workspace,
  );
  const withoutCompletion = { ...closed };
  delete withoutCompletion.completion;
  save(dashboard.home, [withoutCompletion]);
  rmSync(workspace, { recursive: true });
  const baseline = readFileSync(storeFile(dashboard.home), "utf8");
  const { card, settled } = await openStoryColumnsJourney(page, journey);
  await settled();
  await storyCardSessions(card(notRefinedStory))
    .getByRole("button", { name: "Read final report" })
    .click();
  const panel = page.getByRole("region", { name: "Final report" });
  await expect(panel).toContainText(productClosureEvidencePresent);
  await expect(panel).toContainText(workspaceMissing);
  await expect(panel).toContainText("No final dashboard message was saved.");
  await expect(panel).toContainText(
    "Cursor cannot read a native final report here.",
  );
  await expect(panel).not.toContainText(
    "No retained final report is available.",
  );
  await expect(panel.locator(".final-report-text")).toHaveCount(0);
  await expect(
    page.getByRole("region", { name: "Terminal", exact: true }),
  ).toHaveCount(0);
  expect(readFileSync(storeFile(dashboard.home), "utf8")).toBe(baseline);
});
