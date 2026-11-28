// A hidden page closes its revision stream and leaves no recurring demand.

import { expect, test } from "../../dashboard/test-support/dashboardTest.ts";
import { expectSettledPage } from "../../dashboard/test-support/dashboardPage.ts";
import {
  openStreamingAtA,
  setPageVisibility,
  streamPaceMs,
  streamServerEnv,
  titlesOfA,
  untilStreamingAt,
} from "../../dashboard/test-support/revisionStreamJourney.ts";

import { holdLaterTrunkTransfers } from "../../dashboard/test-support/laterTrunkTransfers.ts";
import { defaultRepository } from "../../dashboard/test-support/publishedOriginBasics.ts";
import { ConnectionMark } from "./connectionMark.ts";

test.use({
  preholdRevisionStreamSlots: false,
  extraEnv: { ...streamServerEnv, DOUGH_REVISION_CHECK_REUSE_MS: "0" },
});

test("hiding closes the stream; with no other stream listings stop; revealing answers at once", async ({
  page,
  dashboard,
  afterGitHubStops,
}) => {
  const origin = await openStreamingAtA(page, afterGitHubStops);
  const { stream } = origin;
  const held = holdLaterTrunkTransfers(dashboard.home, defaultRepository);
  const release = held.release;
  try {
    await held.untilHeld();
    const closed = page.waitForEvent(
      "requestfailed",
      (request) => request === stream,
    );
    await setPageVisibility(page, "hidden");
    await closed;
    // Release the in-flight Git probe after the browser stream closes.
    const afterHide = held.held();
    release();
    await page.waitForTimeout(streamPaceMs * 4);
    expect(held.held()).toBe(afterHide);
    const revealed = untilStreamingAt(page, origin.revisions.A);
    await setPageVisibility(page, "visible");
    await revealed;
    await new ConnectionMark(page).shows("connected");
    await expectSettledPage(page, titlesOfA);
  } finally {
    release();
  }
});
