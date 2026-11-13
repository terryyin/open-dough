import {
  readFinalReportControl,
  finalReportParts,
  readFinalReport,
} from "../finalReportPages.ts";
import { closeSidePanel } from "../sidePanelFrame.ts";
// Outside-in review through the real store, HTTP/native boundary and browser.
import { existsSync, readFileSync } from "node:fs";
import { test, expect, stored } from "../support/codexLaunch.ts";
import {
  expectProjectChoice,
  chooseProject,
  parts,
  sessionEntriesIn,
  storyCardSessions,
} from "../dashboardPage.ts";
import {
  publishStoryColumnsJourney,
  notRefinedStory,
  type StoryColumnsJourney,
} from "../launchJourney.ts";
import { openStoryColumnsJourney } from "../storyColumnsPage.ts";
import { report, save, retained, passive } from "../support/retainedReport.ts";
import { launchStoreFile } from "../support/launchStore.ts";
import { reloadUntilRead } from "../pageRequestNotes.ts";
import { expectSelected } from "../storyCardSelection.ts";
import { sessionsSidebarParts } from "../sessionsSidebarPage.ts";
import { openTerminalControl } from "../terminalScreenPage.ts";

test.use({ projectFolders: ["open-dough"] });
let journey: StoryColumnsJourney;
test.beforeAll(async () => {
  journey = await publishStoryColumnsJourney();
});
test.afterAll(() => (journey as StoryColumnsJourney | undefined)?.cleanup());

test("card, Recently done and sidebar review the retained report with attention, association and keyboard focus, without continuing", async ({
  page,
  dashboard,
  codexProtocol: native,
}) => {
  if (native === undefined) throw new Error("Missing protocol fixture");
  const { record, workspace } = await retained(dashboard, native);
  const baseline = readFileSync(launchStoreFile(dashboard.home), "utf8");
  const since = native.calls.length;
  const { card, show } = await openStoryColumnsJourney(page, journey);
  const entry = storyCardSessions(card(notRefinedStory));
  await expect(entry).toContainText("Ready for review");
  await expect(entry).toContainText("saved workspace is missing");
  await expect(openTerminalControl(entry)).toHaveCount(0);
  const open = readFinalReportControl(entry);
  // The fixture's launch protects the story's card until a published read
  // after its outcome reconciles it.
  await expect(open).toBeEnabled();
  await open.focus();
  await page.keyboard.press("Enter");
  const { panel, reportText, reportBody, sessionName, shownSessionId } =
    finalReportParts(page);
  await expect(reportText).toHaveText(report);
  await expect(reportBody).toBeFocused();
  await expect(entry).toContainText("Shown in final report");
  await expectSelected(card(notRefinedStory), true);
  await expect(sessionName).toHaveText("Refinement session");
  await expect(shownSessionId).toHaveCount(0);
  expect(await page.evaluate(() => "reportExecuted" in window)).toBe(false);
  await page.keyboard.press("Meta+Shift+Escape");
  await expect(panel).toHaveCount(0);
  await expect(open).toBeFocused();
  // Closing keeps the story selected (ADR 0008).
  await expectSelected(card(notRefinedStory), true);
  const recent = parts(page)
    .recentlyDone.getByRole("article")
    .filter({ hasText: native.threadId });
  await expect(recent).toHaveCount(0);
  // With no active story card, its open session has the local Taken home
  // and the same passive report access.
  await show(journey.completed);
  const local = sessionEntriesIn(parts(page).taken).filter({
    hasText: native.threadId,
  });
  await readFinalReport(local);
  await expect(reportText).toHaveText(report);
  await closeSidePanel(panel);
  await expect(readFinalReportControl(local)).toBeFocused();
  await show(journey.queued);
  await expect(recent).toHaveCount(0);
  await expect(entry).toContainText(record.session.sessionId);
  const sidebar = sessionsSidebarParts(page);
  await sidebar.button.click();
  await chooseProject(page, "Doughnut");
  const sideOpen = sidebar.entry(notRefinedStory);
  await sideOpen.click();
  await expectProjectChoice(page, "Open Dough");
  await expect(reportText).toHaveText(report);
  await expect(sideOpen).toHaveAttribute("aria-current", "true");
  await expect(entry).toContainText("Ready for review");
  await closeSidePanel(panel);
  await expect(sideOpen).toBeFocused();
  await reloadUntilRead(page);
  await expect(entry).toContainText("Ready for review");
  expect(readFileSync(launchStoreFile(dashboard.home), "utf8")).toBe(baseline);
  expect(existsSync(workspace)).toBe(false);
  passive(native, since);
});

test("changing or closing selection cancels a held report and never shows its text as the next session", async ({
  page,
  dashboard,
  codexProtocol: native,
}) => {
  if (native === undefined) throw new Error("Missing protocol fixture");
  const { record } = await retained(dashboard, native);
  const next = {
    ...record,
    session: { ...record.session, sessionId: "next-retained-session" },
  };
  save(dashboard.home, [record, next]);
  let fetched: (() => void) | undefined;
  const fetchedAnswer = new Promise<void>((resolve) => {
    fetched = resolve;
  });
  let release: (() => void) | undefined;
  const held = new Promise<void>((resolve) => {
    release = resolve;
  });
  await page.route("**/__agent-launch/result?**", async (route) => {
    if (
      new URL(route.request().url()).searchParams.get("session") !==
      record.session.sessionId
    ) {
      await route.continue();
      return;
    }
    const response = await route.fetch();
    fetched?.();
    await held;
    await route.fulfill({ response }).catch(() => undefined);
  });
  const { card, settled } = await openStoryColumnsJourney(page, journey);
  await settled();
  const entries = storyCardSessions(card(notRefinedStory));
  const first = entries.filter({
    has: page.locator(`code:text-is("${record.session.sessionId}")`),
  });
  const second = entries.filter({
    has: page.locator('code:text-is("next-retained-session")'),
  });
  await readFinalReport(first);
  await fetchedAnswer;
  const protocol = native;
  protocol.threadId = next.session.sessionId;
  protocol.history = [
    {
      id: "next-turn",
      status: "completed",
      items: [
        {
          type: "agentMessage",
          phase: "final_answer",
          text: "Second conversation's own result",
        },
      ],
    },
  ];
  native.observations.set(next.session.sessionId, {
    status: { type: "notLoaded" },
    turns: [{ id: "next-turn", status: "completed" }],
  });
  const { panel, reportText, sessionName, shownSessionId } =
    await readFinalReport(second);
  await expect(sessionName).toHaveText("Refinement session");
  await expect(shownSessionId).toHaveCount(0);
  await expect(reportText).toHaveText("Second conversation's own result");
  release?.();
  await expect(reportText).toHaveText("Second conversation's own result");
  await expect(panel).not.toContainText("a5df85d90a");
  await closeSidePanel(panel);
  await expect(readFinalReportControl(second)).toBeFocused();
  expect(stored(dashboard.home).map((value) => value.doneAt)).toEqual([
    undefined,
    undefined,
  ]);
});
