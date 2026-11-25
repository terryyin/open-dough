// Recent stories in Intent (../../src/recentStoriesControl.tsx), on the
// banner of the production page: a remembered row selects another
// story while Intent stays, and a remembered story no longer on the Board is
// selected with no story reference notice added. Browser history persistence
// across fresh dashboard frames: ../navigation/recent-stories-storage.spec.ts.

import { expect, test } from "vitest";
import { page, userEvent } from "vitest/browser";
import { makeMe } from "../../../Distribution/tests/support/pageMakeMe.mjs";
import {
  tapWhereShown,
  useTouchScreen,
} from "../navigation/board-touch-page.ts";
import { projectRadio } from "../navigation/project-navigation-frame.ts";
import {
  popover,
  recent as bookmark,
  recentChoice,
  wholeProject,
} from "../navigation/recent-stories-frame.ts";
import { mountIntentCiPage } from "./intent-ci-page-mount.ts";
import { doughnutSource } from "./intent-ci-homepage-page.ts";
import {
  failingFailed,
  failingStory,
  fullSha,
  inertCiReads,
  mainPassed,
  openDoughSource,
  runningStory,
  storiesTakenWork,
} from "./intent-ci-status-fixtures.ts";
import { intentCiStatus } from "./intent-ci-status-page.ts";
import {
  intentRecentStories,
  storyHeading,
} from "./intent-recent-stories-page.ts";

const intentReads = {
  intent: {
    readLocations: () =>
      Promise.resolve({ status: "configured" as const, locations: [] }),
    readFile: () => Promise.reject(new Error("Unexpected file read")),
    readCandidates: () => Promise.resolve({ status: "absent" as const }),
  },
  ci: inertCiReads(),
};
const recent = intentRecentStories(openDoughSource);

test("choosing another remembered story in Intent shows its start while Intent stays", async () => {
  const mounted = await mountIntentCiPage({
    work: storiesTakenWork,
    reads: intentReads,
  });
  await mounted.selectStory(runningStory.identity, runningStory.title);
  await mounted.selectStory(failingStory.identity, failingStory.title);
  await recent.lists([
    { identity: failingStory.identity, checked: true },
    { identity: runningStory.identity, checked: false },
  ]);

  await recent.chooseRow(runningStory.identity);
  await recent.showsStoryFromStart(runningStory.identity);
  await recent.isLabelled(runningStory.identity);
});

test("Whole project from the Intent chooser clears the selected story and opens trunk CI", async () => {
  const mounted = await mountIntentCiPage({
    work: storiesTakenWork,
    reads: {
      ...intentReads,
      ci: inertCiReads({
        readStatus: (...[, branch]) =>
          Promise.resolve(
            branch === failingStory.branch ? failingFailed : mainPassed,
          ),
      }),
    },
  });
  await mounted.selectStory(failingStory.identity, failingStory.title);
  const ci = intentCiStatus();
  await ci.judges(failingStory.branch);
  await recent.choose();

  await userEvent.click(wholeProject);

  await recent.intentStays();
  await recent.isLabelled(undefined);
  await expect.element(popover).not.toBeInTheDocument();
  await expect.element(projectRadio(openDoughSource.label)).toBeChecked();
  await expect
    .element(page.getByRole("main", { name: "Intent", exact: true }))
    .not.toHaveAttribute("data-selected-story");
  await ci.judges(openDoughSource.ref);
  await ci.answers("Passed at 4774f60 (Add login)");
  await recent.lists([{ identity: failingStory.identity, checked: false }]);
  await expect.element(wholeProject).toHaveAttribute("aria-current", "true");
  await recent.chooseRow(failingStory.identity);
  await recent.showsStoryFromStart(failingStory.identity);
});

test("a recent story in another project switches the project and reads its story in Intent", async () => {
  const otherStory = {
    ...failingStory,
    title: "Doughnut's story with the same identity",
  };
  const doughnutWork = makeMe.aPublishedWork
    .of(doughnutSource)
    .at(fullSha("c3c3c3c"))
    .taking({ ...otherStory, agent: "Sola" })
    .please();
  const mounted = await mountIntentCiPage({
    work: storiesTakenWork,
    otherWork: [doughnutWork],
    reads: intentReads,
    recentStories: [
      { project: doughnutSource.id, identity: otherStory.identity },
    ],
  });
  await mounted.selectStory(failingStory.identity, failingStory.title);
  await expect.element(storyHeading).toHaveTextContent(failingStory.title);

  await recent.chooseRow(otherStory.identity, doughnutSource);

  await expect.element(projectRadio(doughnutSource.label)).toBeChecked();
  await recent.showsStoryFromStart(otherStory.identity);
  await expect.element(storyHeading).toHaveTextContent(otherStory.title);
});

test("the last recent choice stays reachable in the short touch chooser", async () => {
  const earlier = Array.from({ length: 9 }, (...[, index]) => ({
    project: openDoughSource.id,
    identity: `SEED-${710 + index}#recent`,
  }));
  await mountIntentCiPage({
    work: storiesTakenWork,
    viewport: { width: 390, height: 320 },
    reads: intentReads,
    recentStories: [
      ...earlier,
      { project: openDoughSource.id, identity: runningStory.identity },
    ],
  });
  await useTouchScreen();
  await tapWhereShown(bookmark.element());

  const last = recentChoice(openDoughSource.label, runningStory.identity);
  await userEvent.keyboard("{Tab}".repeat(earlier.length + 2));
  await expect.element(last).toHaveFocus();
  const dialog = popover.element();
  expect(dialog.scrollTop).toBeGreaterThan(0);
  expect(dialog.getBoundingClientRect().bottom).toBeLessThanOrEqual(
    innerHeight,
  );
  await tapWhereShown(last.element());

  await recent.showsStoryFromStart(runningStory.identity);
});

test("a remembered story unavailable in Intent keeps the chooser reachable with no Board notice", async () => {
  const gone = "GONE-1#nope";
  await mountIntentCiPage({
    work: storiesTakenWork,
    reads: intentReads,
    recentStories: [
      { project: openDoughSource.id, identity: gone },
      { project: openDoughSource.id, identity: failingStory.identity },
    ],
  });
  await recent.isLabelled(undefined);

  await recent.chooseRow(gone);
  await recent.selects(gone);
  await recent.isLabelled(gone);
  await recent.intentStays();
  expect(recent.noticeText()).toBe("");
  await recent.lists([
    { identity: gone, checked: true },
    { identity: failingStory.identity, checked: false },
  ]);
});
