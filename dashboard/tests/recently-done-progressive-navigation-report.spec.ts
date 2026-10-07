// Mark as done in the Final report panel, on a session placed 27th in
// Recently done once done: a refinement session of a story no list shows,
// whose prepared workspace is gone, so Taken offers only its final report.
// The panel closes, and Recently done extends exactly through the entry,
// reading only the records before it; the keyboard lands on the entry once
// they are read. The other journeys, the publication, and the held record
// are ./recently-done-progressive-navigation.spec.ts and
// ./recentlyDoneProgressiveJourney.ts. The synthetic `claude` lists the
// session and takes its done mark (./fixtures/fake-claude).

import path from "node:path";
import { expect, test } from "./dashboardTest.ts";
import { parts, standaloneSessionName } from "./dashboardPage.ts";
import { rem } from "./dashboardColumnsPage.ts";
import { placedAt } from "./recentlyDoneProgressive.ts";
import { recordsAsked } from "./recentlyDoneProgressivePage.ts";
import {
  destination,
  expectThroughDestination,
  expectThroughDestinationPending,
  openedWithHeldStory,
  storiesThrough,
} from "./recentlyDoneProgressiveJourney.ts";
import { idleBetweenSteps, markDoneAnyway } from "./support/markDone.ts";

test.use({ projectFolders: ["open-dough"] });

const retired = {
  identity: "SEED-405#workspace-retired",
  title: "Refine a story whose workspace was retired",
};
const entryName = standaloneSessionName("Refinement", retired.title);

test("Mark as done in the Final report panel closes it and lands on entry 27 once entries 1 to 27 are read, never reading 28 to 35", async ({
  page,
  dashboard,
}) => {
  await page.setViewportSize({ width: 80 * rem, height: 900 });
  let sessionId = "";
  const view = await openedWithHeldStory(page, dashboard, {
    open: [],
    elsewhere: true,
    also: (now) => {
      const launchedAt = placedAt(now, destination);
      sessionId = dashboard.claudeListsSession({
        name: retired.title,
        cwd: dashboard.home,
        startedAt: Date.parse(launchedAt),
      });
      return [
        {
          request: {
            source: "open-dough",
            identity: retired.identity,
            title: retired.title,
            workflow: "refinement",
            host: "claude",
          },
          session: {
            host: "claude",
            sessionId,
            shortId: sessionId.slice(0, 8),
            name: retired.title,
          },
          preparation: {
            identity: retired.identity,
            workspace: path.join(dashboard.home, "retired-workspace"),
            branch: "story/workspace-retired",
            remote: "origin",
            target: "main",
          },
          launchedAt,
        },
      ];
    },
  });
  const { github, recent } = view;
  const taken = parts(page).taken.getByRole("article", { name: entryName });
  const arrived = recent.getByRole("article", { name: entryName });
  const panel = page.getByRole("region", { name: "Final report" });
  await expect(taken).toContainText("The saved workspace is missing.");

  await taken.getByRole("button", { name: "Read final report" }).click();
  await expect(panel).toBeVisible();
  idleBetweenSteps(dashboard, sessionId);
  await markDoneAnyway(panel);

  await test.step("the panel closes and Recently done lists entries through 27 at once, asking only for their records, while the keyboard waits for the held one", async () => {
    await expect(panel).toHaveCount(0, { timeout: 30_000 });
    await expect(taken).toHaveCount(0);
    await expectThroughDestinationPending(
      github,
      recent,
      view.heldCard,
      arrived,
    );
  });

  await test.step("once it is read, the entry has the keyboard and is in view, and nothing older was read", async () => {
    view.release();
    await expect(arrived).toBeFocused();
    await expect(arrived).toBeInViewport();
    await expect(panel).toHaveCount(0);
    await expectThroughDestination(github, recent, entryName);
    expect(recordsAsked(github).toSorted()).toEqual(
      storiesThrough(destination).toSorted(),
    );
  });
});
