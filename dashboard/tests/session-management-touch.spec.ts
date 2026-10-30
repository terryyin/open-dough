import { sessionAction } from "./support/sessionEntryDisclosure.ts";
// Exact touch actions on real submitted reports and dashboard records.
import type { LaunchRecord } from "../src/agentLaunch.ts";
import { recordsOf } from "./agentLaunchBoundary.ts";
import {
  storyCardSessions,
  expectMembership,
  expectSettledPage,
  parts,
  sessionStateOf,
} from "./dashboardPage.ts";
import { expect } from "./dashboardTest.ts";
import { openUntilRead, reloadUntilRead } from "./pageRequestNotes.ts";
import { tapWhereShown } from "./pageLayout.ts";
import { sessionsSidebarParts } from "./sessionsSidebarPage.ts";
import { messagePartOf } from "./support/sessionMessagePart.ts";
import { doneQuestion, markAsDone } from "./support/markDone.ts";
import { launchedStory, shortIdOf } from "./support/reportedLaunch.ts";
import { otherQueuedIdentity, queuedIdentity } from "./support/startOrigin.ts";
import { publishOrigin, test } from "./support/startOriginTest.ts";
import { phoneLaunchTouchViewport } from "./touchLaunchPage.ts";

test.use({
  projectFolders: ["open-dough"],
  launchTimeoutMs: 30_000,
  extraEnv: { DOUGH_DONE_RENAME_WAIT_MS: "300" },
});
const attention =
  "The migration is unfinished. Keep this exact session open until the remaining migration has been checked.";
const recordOf = async (
  dashboard: Parameters<typeof recordsOf>[0],
  id: string,
) =>
  ((await recordsOf(dashboard, "open-dough")) as LaunchRecord[]).find(
    (record) => record.session.sessionId === id,
  );

const { name, portrait, landscape } = phoneLaunchTouchViewport;

test.describe(`${name} session management`, () => {
  // Immediate card reveal keeps an offscreen terminal from painting first.
  test.use({ viewport: portrait, hasTouch: true, reducedMotion: "reduce" });
  test("reads attention, keeps incomplete work open, and runs only the explicitly chosen read, done and delete actions", async ({
    page,
    dashboard,
    origin,
  }) => {
    test.setTimeout(180_000);
    const ordinary = await launchedStory(
      dashboard,
      origin,
      queuedIdentity,
      "Story A",
    );
    const intended = await launchedStory(
      dashboard,
      origin,
      otherQueuedIdentity,
      "Story B",
    );
    await intended.report({ outcome: "unfinished", message: attention });
    dashboard.claudeSessionBecomes(intended.sessionId, "done-live");
    await publishOrigin(page, origin);
    await openUntilRead(page);
    await expectSettledPage(page);
    const sidebar = sessionsSidebarParts(page);
    await tapWhereShown(sidebar.button);
    const row = sidebar.entries.filter({ hasText: "Story B" });
    await expect(
      row.locator("summary", { hasText: "Session details" }),
    ).toBeVisible();
    await tapWhereShown(row.locator("summary", { hasText: "Session details" }));
    await expect(
      row
        .locator(".sessions-sidebar-session-entry-facts")
        .getByText("Unread report: Unfinished work", { exact: true }),
    ).toBeVisible();
    await tapWhereShown(row.locator("summary", { hasText: "Session details" }));
    await sidebar.entry("Story B").scrollIntoViewIfNeeded();
    await tapWhereShown(sidebar.entry("Story B"));
    const panel = page.getByRole("region", { name: "Terminal" });
    await expect(panel.locator(".side-panel-names code")).toHaveText(
      intended.sessionId,
    );
    // Scroll stacked panels before reading: xterm pauses offscreen rendering.
    // Header taps never scroll a control into view.
    await panel.scrollIntoViewIfNeeded();
    await expect(panel.locator(".xterm-rows")).toContainText(
      `attached ${intended.sessionId.slice(0, 8)}`,
    );
    await tapWhereShown(
      panel.getByRole("button", { name: "Mark as done", exact: true }),
    );
    const panelQuestion = doneQuestion(panel);
    await expect(panelQuestion).toContainText(
      "This session reported unfinished work.",
    );
    const beforeKeep = await recordOf(dashboard, intended.sessionId);
    await tapWhereShown(
      panelQuestion.getByRole("button", { name: "Keep open", exact: true }),
    );
    await expect(panelQuestion).toHaveCount(0);
    await expect(panel.locator(".side-panel-names code")).toHaveText(
      intended.sessionId,
    );
    expect(dashboard.claudeStopCalls()).toEqual([]);
    expect(
      (await recordOf(dashboard, intended.sessionId))?.doneAt,
    ).toBeUndefined();
    expect((await recordOf(dashboard, intended.sessionId))?.reportRead).toBe(
      beforeKeep?.reportRead,
    );
    expect(
      dashboard
        .claudeAttaches()
        .filter(({ id }) => id === intended.sessionId.slice(0, 8)),
    ).toHaveLength(1);
    await tapWhereShown(
      panel.getByRole("button", { name: "Close", exact: true }),
    );
    await expect(panel).toHaveCount(0);

    const cardB = parts(page).taken.getByRole("article", {
      name: "Story B",
      exact: true,
    });
    const entryB = storyCardSessions(cardB);
    const message = messagePartOf(entryB);
    await expect(message.text).toHaveText(attention);
    await message.text.scrollIntoViewIfNeeded();
    await expect(message.text).toBeInViewport();
    await expect(
      entryB.getByRole("button", { name: /^Delete record/ }),
    ).toHaveCount(0);
    await message.markRead.scrollIntoViewIfNeeded();
    await tapWhereShown(message.markRead);
    await expect(message.markRead).toHaveCount(0);
    await expect(message.heading).toBeFocused();
    const read = await recordOf(dashboard, intended.sessionId);
    expect(read?.reportRead).toBe(read?.completion?.receipt);
    expect(read?.doneAt).toBeUndefined();
    expect(dashboard.claudeStopCalls()).toEqual([]);
    await page.setViewportSize(landscape);
    await message.heading.scrollIntoViewIfNeeded();
    await tapWhereShown(message.heading);
    await expect(message.text).toHaveText(attention);
    const moreActions = entryB.getByRole("button", {
      name: "More session actions",
      exact: true,
    });
    await moreActions.scrollIntoViewIfNeeded();
    await tapWhereShown(moreActions);
    await markAsDone(entryB).scrollIntoViewIfNeeded();
    await tapWhereShown(markAsDone(entryB));
    const question = doneQuestion(entryB);
    await expect(question).toContainText(
      "This session reported unfinished work.",
    );
    const keepOpen = question.getByRole("button", {
      name: "Keep open",
      exact: true,
    });
    await keepOpen.scrollIntoViewIfNeeded();
    await tapWhereShown(keepOpen);
    await expect(markAsDone(entryB)).toBeFocused();
    expect((await recordOf(dashboard, intended.sessionId))?.reportRead).toBe(
      read?.reportRead,
    );
    expect(
      (await recordOf(dashboard, intended.sessionId))?.doneAt,
    ).toBeUndefined();
    expect(dashboard.claudeStopCalls()).toEqual([]);

    const shortId = shortIdOf(dashboard, intended.sessionId);
    await markAsDone(entryB).scrollIntoViewIfNeeded();
    await tapWhereShown(markAsDone(entryB));
    const confirmDone = await sessionAction(
      doneQuestion(entryB),
      "Mark as done",
    );
    await confirmDone.scrollIntoViewIfNeeded();
    await tapWhereShown(confirmDone);
    await expect(entryB).toHaveCount(0);
    expect(
      (await recordOf(dashboard, intended.sessionId))?.doneAt,
    ).toBeDefined();
    expect(
      (await recordOf(dashboard, ordinary.sessionId))?.doneAt,
    ).toBeUndefined();
    expect(dashboard.claudeStopCalls()).toEqual([
      expect.objectContaining({ argv: ["stop", shortId] }),
    ]);

    // Unavailable native state permits forgetting the local record; working does not.
    const entryA = storyCardSessions(
      parts(page).taken.getByRole("article", {
        name: "Story A",
        exact: true,
      }),
    );
    await expect(sessionStateOf(entryA)).toHaveText("Working");
    await expect(
      entryA.getByRole("button", { name: /^Delete record/ }),
    ).toHaveCount(0);
    dashboard.claudeSessionBecomes(ordinary.sessionId, "forgotten");
    await reloadUntilRead(page);
    await expectSettledPage(page);
    await expect(sessionStateOf(entryA)).toHaveText("Session unavailable");
    const deleteRecord = await sessionAction(entryA, "Delete record…");
    await deleteRecord.scrollIntoViewIfNeeded();
    await tapWhereShown(deleteRecord);
    const deleteQuestion = entryA.getByRole("group", {
      name: /^Delete this session's dashboard record/,
    });
    await expect(deleteQuestion).toContainText(
      "a running session keeps running",
    );
    const keep = deleteQuestion.getByRole("button", {
      name: "Keep",
      exact: true,
    });
    await keep.scrollIntoViewIfNeeded();
    await tapWhereShown(keep);
    expect(await recordOf(dashboard, ordinary.sessionId)).toBeDefined();
    await deleteRecord.scrollIntoViewIfNeeded();
    await tapWhereShown(deleteRecord);
    const confirmDelete = deleteQuestion.getByRole("button", {
      name: "Delete record",
      exact: true,
    });
    await confirmDelete.scrollIntoViewIfNeeded();
    await tapWhereShown(confirmDelete);
    await expect(entryA).toHaveCount(0);
    expect(await recordOf(dashboard, ordinary.sessionId)).toBeUndefined();
    expect(
      (await recordOf(dashboard, intended.sessionId))?.doneAt,
    ).toBeDefined();
    expect(dashboard.claudeStopCalls()).toEqual([
      expect.objectContaining({ argv: ["stop", shortId] }),
    ]);
    await expectMembership(page, {
      taken: ["Story A", "Story B"],
      backlog: [],
    });
  });
});
