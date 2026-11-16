// A sessions read the server tells to ask again (a retryable 503, as
// ../../server/machineSessionObservation.ts answers past its read wait) keeps the
// sessions the page already lists, and a page that becomes hidden stops
// waiting on its outstanding read, so it no longer waits on the shared
// observation. Against a controlled machine read; page time stands still
// except when the journey advances it.

import {
  expect,
  openFrontendTakenBacklog,
  test,
} from "../../tests/support/frontendApp.ts";
import { frontendStoryLaunch } from "../../tests/support/frontendServiceState.ts";
import { fulfillJson } from "../../tests/support/frontendSubstituteAnswers.ts";
import { setPageVisibility } from "../../tests/autoRefreshJourney.ts";
import { storyCardSessions } from "../../tests/dashboardPage.ts";
import { pausePageClockAt } from "../../tests/dashboardTest.ts";
import { backlogLaunchers } from "../../tests/launchStoryCardPage.ts";
import { notRefinedStory } from "../../tests/launchJourney.ts";
import { givePageItsTurns } from "../../tests/pageRequestNotes.ts";
import { watchRecordReads } from "../../tests/sessionStatePace.ts";
import { agentLaunchEndpoint } from "../../src/agentLaunch.ts";
import { checkIntervalMs } from "../../src/revisionCheckSchedule.ts";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";

test("a sessions read told to ask again keeps the listed sessions, and a hidden page stops waiting on its read", async ({
  page,
  frontendServices,
}) => {
  const listed = frontendStoryLaunch("executing", notRefinedStory)
    .inCodexSession({ sessionId: "listed-thread" })
    .please();
  frontendServices.answerMachine(
    makeMe.aMachineAnswer.observingDone(listed).please(),
  );
  await pausePageClockAt(page, new Date());
  const { passOnePace } = await watchRecordReads(page);
  await openFrontendTakenBacklog(page);
  const entry = storyCardSessions(backlogLaunchers(page).card(notRefinedStory));
  await expect(entry).toContainText("Ready for review");
  await expect(entry).toContainText("listed-thread");

  let mode: "refuse" | "hold" = "refuse";
  let refused = 0;
  let release = () => {};
  const released = new Promise<void>((resolve) => {
    release = resolve;
  });
  await page.route(
    (url) => url.pathname === agentLaunchEndpoint,
    async (route) => {
      if (route.request().method() !== "GET") return route.fallback();
      if (mode === "hold") {
        await released;
        return route.abort().catch(() => undefined);
      }
      refused += 1;
      return fulfillJson(
        route,
        {
          error:
            "The machine's sessions were not observed within 30 seconds. Ask again.",
        },
        503,
      );
    },
  );
  await passOnePace();
  await passOnePace();
  expect(refused).toBe(2);
  await expect(entry).toContainText("Ready for review");
  await expect(entry).toContainText("listed-thread");

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
