// A sessions read the server tells to ask again (a retryable 503, as
// ../server/machineSessionObservation.ts answers past its read wait) keeps the
// sessions the page already lists, and a page that becomes hidden stops
// waiting on its outstanding read, so it no longer waits on the shared
// observation. Page time stands still except when the journey advances it.
import { agentLaunchEndpoint } from "../src/agentLaunch.ts";
import { checkIntervalMs } from "../src/revisionCheckSchedule.ts";
import { setPageVisibility } from "./autoRefreshJourney.ts";
import { storyCardSessions } from "./dashboardPage.ts";
import { pausePageClockAt } from "./dashboardTest.ts";
import {
  notRefinedStory,
  publishStoryColumnsJourney,
  type StoryColumnsJourney,
} from "./launchJourney.ts";
import { givePageItsTurns } from "./pageRequestNotes.ts";
import { watchRecordReads } from "./sessionStatePace.ts";
import { openStoryColumnsJourney } from "./storyColumnsPage.ts";
import { test, expect } from "./support/codexLaunch.ts";
import {
  observationRecord as record,
  saveObservations as save,
  observed,
} from "./support/codexObservation.ts";

test.use({ projectFolders: ["open-dough"] });
let journey: StoryColumnsJourney;
test.beforeAll(async () => {
  test.setTimeout(120_000);
  journey = await publishStoryColumnsJourney();
});
test.afterAll(() => (journey as StoryColumnsJourney | undefined)?.cleanup());

test("a sessions read told to ask again keeps the listed sessions, and a hidden page stops waiting on its read", async ({
  page,
  dashboard,
  codexProtocol: native,
}) => {
  if (native === undefined) throw new Error("Missing protocol fixture");
  observed(native, "listed", { type: "idle" }, "completed");
  save(dashboard, [record(dashboard, native, "listed")]);
  await pausePageClockAt(page, new Date());
  const { passOnePace } = await watchRecordReads(page);
  const { card } = await openStoryColumnsJourney(page, journey);
  const entry = storyCardSessions(card(notRefinedStory));
  await expect(entry).toContainText("Ready for review");
  await expect(entry).toContainText("listed");

  let mode: "refuse" | "hold" = "refuse";
  let refused = 0;
  let release = () => {};
  const released = new Promise<void>((resolve) => {
    release = resolve;
  });
  await page.route(
    (url) => url.pathname === agentLaunchEndpoint,
    async (route) => {
      if (route.request().method() !== "GET") return route.continue();
      if (mode === "hold") {
        await released;
        return route.abort().catch(() => undefined);
      }
      refused += 1;
      return route.fulfill({
        status: 503,
        contentType: "application/json",
        body: JSON.stringify({
          error:
            "The machine's sessions were not observed within 30 seconds. Ask again.",
        }),
      });
    },
  );
  await passOnePace();
  await passOnePace();
  expect(refused).toBe(2);
  await expect(entry).toContainText("Ready for review");
  await expect(entry).toContainText("listed");

  mode = "hold";
  const held = page.waitForRequest(
    (request) =>
      new URL(request.url()).pathname === agentLaunchEndpoint &&
      request.method() === "GET",
  );
  await page.clock.runFor(checkIntervalMs);
  const read = await held;
  const ended = page.waitForEvent("requestfailed", (failed) => failed === read);
  await setPageVisibility(page, "hidden");
  await ended;
  await givePageItsTurns(page);
  await expect(entry).toContainText("Ready for review");
  release();
  await page.unrouteAll({ behavior: "ignoreErrors" });
});
