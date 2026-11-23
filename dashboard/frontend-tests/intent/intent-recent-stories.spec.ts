// Recent stories in Intent (../../src/recentStoriesControl.tsx), on the
// banner of the production page: from Project Intent the button returns to
// the selected story's view at its start, a remembered row selects another
// story while Intent stays, and a remembered story no longer on the Board is
// selected with no story reference notice added. The URL's perspective on
// return: ../../../e2e/intent/intent-project-visit-ci.spec.ts. The history
// kept across reloads: ../navigation/recent-stories.spec.ts.

import { expect, test } from "vitest";
import { mountIntentCiPage } from "./intent-ci-page-mount.ts";
import {
  failingStory,
  inertCiReads,
  openDoughSource,
  runningStory,
  storiesTakenWork,
} from "./intent-ci-status-fixtures.ts";
import { intentRecentStories } from "./intent-recent-stories-page.ts";

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

test("Recent stories return from Project Intent to the selected story's start", async () => {
  const mounted = await mountIntentCiPage({
    work: storiesTakenWork,
    reads: intentReads,
  });
  await mounted.selectStory(failingStory.identity, failingStory.title);
  await recent.openProjectIntent();

  await recent.choose();
  await recent.showsStoryFromStart(failingStory.identity);
  await recent.lists([{ identity: failingStory.identity, checked: true }]);
});

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

test("a remembered story no longer on the Board is selected in Intent with no story reference notice", async () => {
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
});
