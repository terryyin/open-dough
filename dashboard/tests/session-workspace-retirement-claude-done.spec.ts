import { sessionActions } from "./support/sessionEntryDisclosure.ts";
// Mark as done on a Recently done entry of a recorded Claude session whose
// workspace is retired: where a press finds it, and the rename it retries.
import { rmSync } from "node:fs";
import { test, expect } from "./dashboardTest.ts";
import { stored } from "./support/codexLaunch.ts";
import { parts } from "./dashboardPage.ts";
import {
  publishStoryColumnsJourney,
  type StoryColumnsJourney,
} from "./launchJourney.ts";
import { openStoryColumnsJourney } from "./storyColumnsPage.ts";
import { retainedDoneAt } from "./machineLaunchRecords.ts";
import { recordedClaude as recorded, save } from "./support/retainedReport.ts";
import { untilPageRequestsAnswered } from "./pageRequestNotes.ts";
import { markAsDone, markDone } from "./support/markDone.ts";
import { authenticatedReadEndpoint } from "../src/authenticatedReadRules.ts";
test.use({ projectFolders: ["open-dough"] });
let journey: StoryColumnsJourney;
test.beforeAll(async () => {
  test.setTimeout(120_000);
  journey = await publishStoryColumnsJourney();
});
test.afterAll(() => (journey as StoryColumnsJourney | undefined)?.cleanup());

// The published work a journey opens on is answered before the stories'
// details are -- seeds, plans, agent profiles -- and those answers reflow the
// page: cards stop reading their preparation, the page shortens, and an entry
// scrolled into view for a press moves with it (about 250px in measured
// runs). A press whose mouse button comes up after such a move lands off its
// control and asks nothing, so every journey here presses only on a settled
// page (`settled`). This holds the details back long enough that the page is
// certainly still reading them when the journey opens, whatever the runner's
// speed, and checks that nothing still on its way moves a control the way a
// press finds it once the page has settled.
test("a Recently done entry's Mark as done stays where a settled page shows it", async ({
  page,
  dashboard,
}) => {
  const { record } = await recorded(dashboard);
  dashboard.claudeSessionBecomes(record.session.sessionId, "done-live");
  record.doneAt = retainedDoneAt();
  record.doneProblem = "Local done mark retained. Claude Code rename failed.";
  save(dashboard.home, [record]);
  await page.route(
    (url) =>
      url.pathname === authenticatedReadEndpoint &&
      [...url.searchParams.keys()].some(
        (named) => !["source", "revision", "since"].includes(named),
      ),
    async (route) => {
      await new Promise((later) => setTimeout(later, 300));
      await route.fallback();
    },
  );
  const { settled } = await openStoryColumnsJourney(page, journey);
  await sessionActions(
    parts(page)
      .recentlyDone.getByRole("article")
      .filter({ hasText: record.session.sessionId }),
  );
  const control = markAsDone(
    parts(page)
      .recentlyDone.getByRole("article")
      .filter({ hasText: record.session.sessionId }),
  );
  await settled();
  await control.scrollIntoViewIfNeeded();
  const place = await control.boundingBox();
  expect(place).not.toBeNull();
  await untilPageRequestsAnswered(page);
  expect(await control.boundingBox()).toEqual(place);
});

// Mark as done answers only after private rename confirmation and stop. A
// busy CI shard can spend most of the default five-second rename wait on
// attach start-up and the fixed key pauses, so the entry still shows the
// retained doneProblem past one default expectation even when rename will
// succeed. These cases own a wait the runner cannot exhaust; success still
// returns as soon as the name is listed.
test.describe("Recently done renames a retired-workspace Claude session", () => {
  test.use({ extraEnv: { DOUGH_DONE_RENAME_WAIT_MS: "30000" } });

  for (const [cause, oldProblem] of [
    [
      "requires terminal input",
      "Native rename requires terminal input while the reporting sender is still working. Use Mark as done after reporting finishes.",
    ],
    [
      "No terminal attachment",
      "No terminal attachment is available to confirm native rename.",
    ],
  ] as const) {
    test(`Recently done renames a retired-workspace Claude session with the old ${cause} problem`, async ({
      page,
      dashboard,
    }) => {
      const { record, workspace } = await recorded(dashboard);
      dashboard.claudeSessionBecomes(record.session.sessionId, "done-live");
      rmSync(workspace, { recursive: true });
      record.doneAt = retainedDoneAt();
      record.doneProblem = `Local done mark retained. Claude Code rename failed: ${oldProblem}`;
      save(dashboard.home, [record]);
      const doneName = `done-${record.session.name}`;
      const { settled } = await openStoryColumnsJourney(page, journey);
      await settled();
      const recent = parts(page)
        .recentlyDone.getByRole("article")
        .filter({ hasText: record.session.sessionId });
      await expect(recent).toContainText(record.doneProblem);
      await expect(recent).toContainText("saved workspace is missing");
      expect(dashboard.claudeAttaches()).toEqual([]);

      await markDone(recent);

      await expect(recent).toContainText(`Named ${doneName}`, {
        timeout: 20_000,
      });
      await expect(recent).not.toContainText(oldProblem);
      await expect(recent.locator(".launch-problem")).toHaveText("");
      expect(stored(dashboard.home)[0]).not.toHaveProperty("doneProblem");
      expect(
        dashboard
          .claudeListing()
          .find((each) => each["sessionId"] === record.session.sessionId),
      ).toMatchObject({ name: doneName });
      expect(dashboard.claudeAttaches()).toEqual([
        expect.objectContaining({
          id: record.session.host === "claude" ? record.session.shortId : "",
          lines: [`/rename ${doneName}`],
        }),
      ]);
      await expect(
        page.getByRole("region", { name: "Terminal", exact: true }),
      ).toHaveCount(0);
    });
  }
});
