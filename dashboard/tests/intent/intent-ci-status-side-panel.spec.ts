import {
  expectCiScope,
  expectCiAnswer,
  chooseCiStatus,
  ciPanel,
} from "../intentCiStatusPage.ts";

// The Side panel sets and clears the page's selected story, which Intent's
// lens and CI status read (../../src/pageSidePanel.ts, ../../src/intentCiTarget.ts):
// reading a Taken story's final report from its card selects and highlights
// that story, and Intent names it and judges its story branch; another
// story's final report moves the selection there. A card's toggle selects
// without changing the panel, and closing the panel keeps the story selected
// then (ADR 0008), which Intent still judges. Showing a session attached to no
// story clears it, CI status judges `main` again, and closing that session's
// terminal leaves Intent at project scope. The
// stories' saved workspaces are gone, so each card's session offers its final
// report; the ad hoc session is listed by the synthetic `claude`
// (./fixtures/fake-claude). The board is ../intentCiStoryBoard.ts.

import path from "node:path";
import { makeMe } from "../../../tests/support/makeMe.mjs";
import type { LaunchRecord } from "../../src/agentLaunch.ts";
import { expect, test } from "../dashboardTest.ts";
import { parts, storyCardSessions } from "../dashboardPage.ts";

import { failing, running } from "../intentCiStoryBoard.ts";
import { card, publishStoryCi } from "../intentCiStoryRecords.ts";
import { openUntilRead } from "../pageRequestNotes.ts";
import { sessionsOutsideDoneStories } from "../recentlyDoneColumn.ts";
import { sessionsSidebarParts } from "../sessionsSidebarPage.ts";
import { expectSelected } from "../storyCardSelection.ts";
import { keepLaunchRecords } from "../support/launchStore.ts";

// A kept execution record of the board's Taken story `anchor`, launched
// now, its saved workspace gone.
function goneWorkspaceRecord(
  home: string,
  { anchor, title, branch }: typeof failing,
): LaunchRecord {
  return makeMe.aLaunchRecord
    .executing({ identity: `SEED-219#${anchor}`, title })
    .inClaudeSession({ sessionId: `${anchor}-session`, shortId: anchor })
    .onStoryBranch({ workspace: path.join(home, "gone", anchor), branch })
    .launchedAt(new Date().toISOString())
    .please();
}

test("the Side panel's content selects its story for Intent's lens and CI status, closing it keeps the selection at that moment, and an ad hoc session clears it to main", async ({
  page,
  dashboard,
}) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  keepLaunchRecords(dashboard, [
    goneWorkspaceRecord(dashboard.home, failing),
    goneWorkspaceRecord(dashboard.home, running),
    ...sessionsOutsideDoneStories(dashboard, Date.now()).filter(
      (record) => record.request.workflow === "ad-hoc",
    ),
  ]);
  publishStoryCi(page);
  await openUntilRead(page, "/?project=open-dough&perspective=intent");
  const { development, intentChoice, intent } = parts(page);
  await expectCiScope(await chooseCiStatus(intent), "main");
  await expect(intent).not.toHaveAttribute("data-selected-story");
  await development.click();
  const report = page.getByRole("region", { name: "Final report" });
  // By keyboard: beside the panel, a lower card's control can sit below the
  // page's fold, where a pointer cannot reach it without scrolling.
  const readReport = async (title: string) => {
    await storyCardSessions(card(page, title))
      .getByRole("button", { name: "Read final report" })
      .focus();
    await page.keyboard.press("Enter");
  };
  // Intent, still on CI status, as the page now selects.
  const onIntent = async () => {
    await intentChoice.click();
    return ciPanel(intent);
  };

  await test.step("reading a story's final report selects and highlights it, and Intent judges its branch", async () => {
    await readReport(failing.title);
    await expect(report).toBeVisible();
    await expectSelected(card(page, failing.title), true);
    const panel = await onIntent();
    await expect(intent).toHaveAttribute(
      "data-selected-story",
      `SEED-219#${failing.anchor}`,
    );
    await expectCiScope(panel, failing.branch);
    await expectCiAnswer(panel, "Failed at fa11ed0 (Break the login)");
    await development.click();
  });

  await test.step("another story's final report moves the selection and Intent's branch there", async () => {
    await readReport(running.title);
    await expect(report).toContainText(running.title);
    await expectSelected(card(page, running.title), true);
    await expectSelected(card(page, failing.title), false);
    const panel = await onIntent();
    await expect(intent).toHaveAttribute(
      "data-selected-story",
      `SEED-219#${running.anchor}`,
    );
    await expectCiScope(panel, running.branch);
    await development.click();
  });

  await test.step("a card's toggle selects without changing the panel; closing the panel keeps that selection, which Intent still judges", async () => {
    await card(page, failing.title).locator("h3").click();
    await expectSelected(card(page, failing.title), true);
    await expectSelected(card(page, running.title), false);
    await expect(report).toContainText(running.title);
    await report.getByRole("button", { name: "Close", exact: true }).click();
    await expect(report).toHaveCount(0);
    await expectSelected(card(page, failing.title), true);
    await expectSelected(card(page, running.title), false);
    const panel = await onIntent();
    await expect(intent).toHaveAttribute(
      "data-selected-story",
      `SEED-219#${failing.anchor}`,
    );
    await expectCiScope(panel, failing.branch);
    await development.click();
  });

  await test.step("showing a session attached to no story clears the selection, and CI status judges main", async () => {
    await readReport(failing.title);
    await expectSelected(card(page, failing.title), true);
    const sidebar = sessionsSidebarParts(page);
    await sidebar.button.click();
    await sidebar.entry("Open Dough session").click();
    await expect(page.getByRole("region", { name: "Terminal" })).toBeVisible();
    await expectSelected(card(page, failing.title), false);
    const panel = await onIntent();
    await expect(intent).not.toHaveAttribute("data-selected-story");
    await expectCiScope(panel, "main");
  });

  await test.step("closing that session's terminal with no story selected leaves Intent at project scope", async () => {
    await development.click();
    const terminal = page.getByRole("region", { name: "Terminal" });
    await terminal.getByRole("button", { name: "Close", exact: true }).click();
    await expect(terminal).toHaveCount(0);
    await expectSelected(card(page, failing.title), false);
    await expectSelected(card(page, running.title), false);
    const panel = await onIntent();
    await expect(intent).not.toHaveAttribute("data-selected-story");
    await expectCiScope(panel, "main");
  });
});
