import type { Page } from "@playwright/test";
import { pausePageClock } from "../../dashboard/test-support/autoRefreshJourney.ts";
import {
  chooseProject,
  expectProjectChoice,
} from "../../dashboard/test-support/dashboardPage.ts";
import { expect } from "../../dashboard/test-support/dashboardTest.ts";
import {
  expectCueEnds,
  expectDestinationCue,
} from "../../dashboard/test-support/destinationCue.ts";
import {
  expectArrivedAt,
  storyDestination,
  storyUrl,
} from "../../dashboard/test-support/notificationStoryJourney.ts";
import { expectSelected } from "../../dashboard/test-support/storyCardSelection.ts";

export function storyHistoryPage(page: Page) {
  const address = () => new URL(page.url()).searchParams;
  const card = (title: string) =>
    page.getByRole("article", { name: title, exact: true });
  const view = {
    async showsFailedRead() {
      await expect(storyDestination(page)).toContainText(
        "published work could not be read",
      );
      return view;
    },
    async retry() {
      await storyDestination(page)
        .getByRole("button", { name: "Retry story destination" })
        .click();
      return view;
    },
    async reload() {
      await page.reload();
      return view;
    },
    async choose(label: string) {
      await chooseProject(page, label);
      return view;
    },
    async back() {
      await page.goBack();
      return view;
    },
    async forward() {
      await page.goForward();
      return view;
    },
    async showsDestination(label: string, title: string, identity: string) {
      await expectProjectChoice(page, label);
      await expectArrivedAt(card(title));
      expect(address().get("story")).toBe(identity);
      expect(new URL(page.url()).hash).toBe("");
      return view;
    },
    async showsCuedDestination(label: string, title: string, identity: string) {
      await view.showsDestination(label, title, identity);
      const destination = card(title);
      await expectDestinationCue(page, destination, { motion: true });
      await expectSelected(destination, false);
      await expectCueEnds(page, destination);
      return view;
    },
    async showsBoard(label: string, title: string) {
      await expectProjectChoice(page, label);
      await expect(card(title)).toBeVisible();
      expect(address().get("story")).toBeNull();
      return view;
    },
  };
  return {
    async open(project: string, identity: string) {
      await pausePageClock(page);
      await page.goto(storyUrl(project, identity));
      return view;
    },
  };
}
