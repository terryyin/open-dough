// Starting preconditions only: a wrapped saved identity, its native history,
// an unfinished completion already read, and a privately missing workspace.
import type { Page } from "@playwright/test";
import { expect, stored } from "./codexLaunch.ts";
import type { DashboardServer } from "./dashboardServer.ts";
import type { FakeCodex } from "./fakeCodex.ts";
import { retained, report, save, keepFinalReport } from "./retainedReport.ts";
import { completionReport } from "./completionReport.ts";
import { storyCardSessions, parts } from "../dashboardPage.ts";
import { notRefinedStory, type StoryColumnsJourney } from "../launchJourney.ts";
import { openStoryColumnsJourney } from "../storyColumnsPage.ts";

export const title =
  "Read the saved unfinished report. Keep the intended work open until its remaining steps are complete.";
export const sessionId =
  "retained-native-session-identity-with-several-wrapped-lines-for-the-intended-report";
const questionWords =
  "This session reported unfinished work. Mark it done anyway?";

export async function openUnfinishedReport(
  page: Page,
  dashboard: DashboardServer,
  native: FakeCodex | undefined,
  journey: StoryColumnsJourney,
  text = report,
) {
  if (native === undefined) throw new Error("Missing protocol fixture");
  const protocol = native;
  protocol.threadId = sessionId;
  const { record, workspace } = await retained(dashboard, native);
  keepFinalReport(native, workspace, text);
  record.request.title = title;
  record.completion = completionReport({
    outcome: "unfinished",
    message: "Keep the remaining steps open.",
  });
  record.reportRead = record.completion.receipt;
  save(dashboard.home, [record]);
  const since = native.calls.length;
  const { card, settled } = await openStoryColumnsJourney(page, journey);
  await settled();
  const entry = storyCardSessions(card(notRefinedStory));
  await expect(entry).toContainText("saved workspace is missing");
  const open = entry.getByRole("button", { name: "Read final report" });
  await open.focus();
  await page.keyboard.press("Enter");
  const panel = page.getByRole("region", { name: "Final report" });
  const reportText = panel.locator(".final-report-text");
  await expect(reportText).toHaveText(text);
  const mark = panel
    .locator(".side-panel-header")
    .getByRole("button", { name: "Mark as done" });
  const question = panel.getByRole("group", {
    name: questionWords,
    exact: true,
  });
  const choice = (name: string) =>
    question.getByRole("button", { name, exact: true });
  const state = () => {
    const current = stored(dashboard.home)[0];
    return {
      reportRead: current?.reportRead,
      doneAt: current?.doneAt,
      completion: current?.completion,
    };
  };
  const underlying = async () => ({
    project: await parts(page)
      .project.getByRole("radio", { checked: true })
      .getAttribute("value"),
    storyDetails: await parts(page)
      .board.getByRole("region", { name: /^Detail for / })
      .count(),
  });
  return {
    record,
    workspace,
    native,
    since,
    open,
    panel,
    reportText,
    mark,
    question,
    choice,
    state,
    underlying,
    reading: entry.locator(".session-state"),
  };
}
