import type { Locator, Page } from "@playwright/test";
import { parts, storyCardSessions } from "../dashboardPage.ts";
import {
  followUpComposer,
  followUpContextList,
  fileFollowUp,
} from "./fileFollowUpPage.ts";
import { startSessionDialog } from "../launchStoryCardPage.ts";
import { storyCardDoneClass } from "../../src/storyCardDone.ts";

export function sessionFollowUpPage(page: Page) {
  const { taken, recentlyDone } = parts(page);
  const dialog = startSessionDialog(page, "Open Dough");
  const composer = followUpComposer(dialog);
  const card = (column: Locator, title: string) =>
    column.getByRole("article", { name: title, exact: true });
  return {
    taken: (title: string) => card(taken, title),
    done: (title: string) => card(recentlyDone, title),
    dialog,
    context: followUpContextList(dialog),
    followUp: fileFollowUp,
    submit: (instruction?: string) => composer.start(instruction),
    openedSessions: storyCardSessions,
    session: (scope: Locator, name: string) =>
      scope.getByRole("article", { name, exact: true }),
    async showDoneHistory(scope: Locator) {
      const history = scope.getByRole("list", { name: "Done history" });
      if (!(await history.isVisible()))
        await scope.locator(`.${storyCardDoneClass} > summary`).click();
      return history;
    },
  };
}
