// Story-card launches whose Board follows the same bare origin the installed
// workflow writes. The card locator survives published moves between columns.
import { expect, type Page } from "@playwright/test";
import { expectSettledPage, parts } from "./dashboardPage.ts";
import { backlogLaunchers, instructionField } from "./launchStoryCardPage.ts";
import { openUntilRead, reloadUntilRead } from "./pageRequestNotes.ts";
import { publishCommittedOrigin } from "./committedOrigin.ts";
import { githubFor } from "./dashboardTest.ts";
import { tapWhereShown } from "./pageLayout.ts";
import { defaultRepository } from "./publishedOriginBasics.ts";
import { storyCard } from "./storyCardControls.ts";
import type { Workflow } from "./storyColumnsPage.ts";
import {
  expectServedHomesReach,
  servedHomes,
} from "./support/fixtureOriginRoute.ts";
import { holdLaterTrunkTransfers } from "./laterTrunkTransfers.ts";
import { originMain, radio } from "./support/sessionDialog.ts";
import type { StartOrigin } from "./support/startOrigin.ts";

export async function openInstalledStoryBoard(
  page: Page,
  origin: StartOrigin,
  // `keepsOpenedTrunk`: every later Board read, REST and Git, keeps the
  // opened trunk while starts publish, until `showPublished`.
  {
    keepsOpenedTrunk = false,
    follows = !keepsOpenedTrunk,
  }: { follows?: boolean; keepsOpenedTrunk?: boolean } = {},
) {
  const initialRevision = await originMain(origin);
  const published = await publishCommittedOrigin(page, {
    repoDir: origin.origin,
    revision: initialRevision,
    repository: defaultRepository,
    follows,
  });
  const github = githubFor(page);
  expectServedHomesReach(github, defaultRepository, initialRevision);
  await openUntilRead(page);
  const pinned = !keepsOpenedTrunk
    ? []
    : servedHomes(github).map((home) =>
        holdLaterTrunkTransfers(home, defaultRepository),
      );
  for (const home of pinned) home.releaseAt(initialRevision);
  return {
    ...installedStoryBoard(page),
    async showPublished() {
      const revision = await originMain(origin);
      for (const home of pinned) home.release();
      published.advanceTo(revision);
      expectServedHomesReach(github, defaultRepository, revision);
      await reloadUntilRead(page);
    },
  };
}

export function installedStoryBoard(page: Page) {
  const card = (title: string) => storyCard(parts(page).board, title);
  const action = (title: string, workflow: Workflow) =>
    card(title).getByRole("button", { name: `Start ${workflow}` });
  const { dialog, refinementDialog } = backlogLaunchers(page);
  return {
    card,
    action,
    launchProblem: (title: string) => card(title).locator(".launch-problem"),
    settled: () => expectSettledPage(page),
    async open(
      title: string,
      workflow: Workflow,
      using: "mouse" | "touch" = "mouse",
    ) {
      const control = action(title, workflow);
      await expect(control).toBeEnabled();
      if (using === "touch") {
        await control.scrollIntoViewIfNeeded();
        await tapWhereShown(control);
      } else await control.click();
      const opened = workflow === "Execution" ? dialog : refinementDialog;
      const start = opened.getByRole("button", { name: "Start", exact: true });
      return {
        dialog: opened,
        instruction: instructionField(opened),
        chooseOneShot: () => radio(opened, "Tracking", "One-shot").check(),
        submit: () =>
          using === "touch" ? tapWhereShown(start) : start.click(),
      };
    },
  };
}
