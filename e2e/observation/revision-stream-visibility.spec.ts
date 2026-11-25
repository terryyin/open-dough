// A hidden page closes its revision stream and leaves no recurring demand.

import {
  expect,
  githubFor,
  test,
} from "../../dashboard/test-support/dashboardTest.ts";
import { expectSettledPage } from "../../dashboard/test-support/dashboardPage.ts";
import {
  matchingRefsSince,
  openStreamingAtA,
  setPageVisibility,
  streamPaceMs,
  streamServerEnv,
  titlesOfA,
  untilMatchingRefsSince,
  untilStreamingAt,
} from "../../dashboard/test-support/revisionStreamJourney.ts";

test.use({ preholdRevisionStreamSlots: false, extraEnv: streamServerEnv });

test("hiding closes the stream; with no other stream listings stop; revealing answers at once", async ({
  page,
  afterGitHubStops,
}) => {
  const origin = await openStreamingAtA(page, afterGitHubStops);
  const { stream } = origin;
  const release = origin.hold("main");
  try {
    const beforeHide = githubFor(page).calls.length;
    await untilMatchingRefsSince(page, beforeHide, 1);
    const closed = page.waitForEvent(
      "requestfailed",
      (request) => request === stream,
    );
    await setPageVisibility(page, "hidden");
    await closed;
    // The held listing already reached GitHub. Release it only after the
    // browser stream closes, so its in-flight dispatch cannot cross this count.
    const afterHide = githubFor(page).calls.length;
    release();
    await page.waitForTimeout(streamPaceMs * 4);
    expect(matchingRefsSince(page, afterHide)).toBe(0);
    const beforeReveal = githubFor(page).calls.length;
    const revealed = untilStreamingAt(page, origin.revisions.A);
    await setPageVisibility(page, "visible");
    await revealed;
    await untilMatchingRefsSince(page, beforeReveal, 1);
    await expectSettledPage(page, titlesOfA);
  } finally {
    release();
  }
});
