// Board streams use free slots/lowered pace; dashboardTest.ts pre-holds slots for check delivery.

import type { Page, Request } from "@playwright/test";
import { expect, test } from "../../dashboard/test-support/dashboardTest.ts";
import {
  expectPublishedRevision,
  expectSettledPage,
  parts,
} from "../../dashboard/test-support/dashboardPage.ts";
import {
  passPageMs,
  passTimeUntilAsked,
} from "../../dashboard/test-support/autoRefreshJourney.ts";
import {
  isCheck,
  untilPageReadsAnswered,
} from "../../dashboard/test-support/pageRequestNotes.ts";
import { restMembershipAsked } from "../../dashboard/test-support/originObservation.ts";
import { backlogPath } from "../../dashboard/test-support/publishedOriginBasics.ts";
import {
  isRevisionStream,
  openSecondStreamingAtA,
  openStreamingAtA,
  queuedSlotRequests,
  streamServerEnv,
  untilStreamingAt,
  setPageVisibility,
} from "../../dashboard/test-support/revisionStreamJourney.ts";
import {
  titlesOfA,
  titlesOfB,
} from "../../dashboard/test-support/refreshJourney.ts";
import { ConnectionMark } from "./connectionMark.ts";

test.use({
  preholdRevisionStreamSlots: false,
  extraEnv: streamServerEnv,
});

test("a streaming Board sends no fallback check over a quiet minute", async ({
  page,
  afterGitHubStops,
}) => {
  const checks =
    await test.step("Given the Board's fallback requests are recorded", () => {
      const asked: string[] = [];
      page.on("request", (request) => {
        if (isCheck(request.url())) asked.push(request.url());
      });
      return asked;
    });
  const connection =
    await test.step("And the Board at A has received a stream update", async () => {
      await openStreamingAtA(page, afterGitHubStops);
      const mark = new ConnectionMark(page);
      await mark.shows("connected");
      return mark;
    });
  await test.step("When a quiet minute passes", async () => {
    await passPageMs(page, 60_000);
  });
  await test.step("Then the stream still supplies updates without any fallback request", async () => {
    await connection.shows("connected");
    await expect(parts(page).problem).toHaveCount(0);
    expect(checks).toEqual([]);
  });
});

test("two streaming tabs show the next published Board without Refresh", async ({
  page,
  afterGitHubStops,
}) => {
  const { origin, other, streamsAtB } =
    await test.step("Given both tabs are streaming the Board at A", async () => {
      const origin = await openStreamingAtA(page, afterGitHubStops);
      const other = await openSecondStreamingAtA(page, origin.revisions.A);
      return {
        origin,
        other,
        streamsAtB: Promise.all([
          untilStreamingAt(page, origin.revisions.B),
          untilStreamingAt(other, origin.revisions.B),
        ]),
      };
    });
  await test.step("When origin publishes B", () => {
    origin.advanceTo("B");
  });
  await test.step("Then both tabs show the membership and revision at B", async () => {
    await streamsAtB;
    await Promise.all([
      expectSettledPage(page, titlesOfB),
      expectSettledPage(other, titlesOfB),
    ]);
    await Promise.all([
      expectPublishedRevision(page, origin.revisions.B),
      expectPublishedRevision(other, origin.revisions.B),
    ]);
  });
  // The current pinned backlog remains shared until the verified stream owns
  // the replacement operation-count proof.
  await test.step("And the tabs share the read of the new backlog", () => {
    expect(
      restMembershipAsked(origin.requests).filter(
        (read) => read === `content ${backlogPath}@${origin.revisions.B}`,
      ),
    ).toHaveLength(1);
  });
});

test("seven pages of one context: two stream and five check; hiding a holder lets a checker stream", async ({
  page,
  afterGitHubStops,
}) => {
  await openStreamingAtA(page, afterGitHubStops);
  const pages: Page[] = [page];
  const holders: Page[] = [page];
  const checkers: Page[] = [];
  for (let i = 0; i < 6; i += 1) {
    const next = await page.context().newPage();
    const seen = { stream: false };
    const streamOpened = (request: Request) => {
      if (isRevisionStream(request.url())) seen.stream = true;
    };
    next.on("request", streamOpened);
    const queuedBefore = await queuedSlotRequests(page);
    await next.goto("/");
    await expectSettledPage(next, titlesOfA);
    // A page that found no free slot queues for every slot, and checks.
    await expect
      .poll(
        async () =>
          seen.stream || (await queuedSlotRequests(page)) > queuedBefore,
      )
      .toBe(true);
    next.off("request", streamOpened);
    pages.push(next);
    if (seen.stream) {
      holders.push(next);
    } else {
      checkers.push(next);
    }
  }
  expect(holders).toHaveLength(2);
  expect(checkers).toHaveLength(5);

  // Checking pages ask `since` at the check pace (page time); under seven
  // pages the first ask can land a step or two late, so observe that they
  // check rather than the exact step bound.
  for (const checker of checkers.slice(0, 2)) {
    await untilPageReadsAnswered(checker);
    const passed = await passTimeUntilAsked(checker);
    expect(passed).toBeGreaterThanOrEqual(15_000);
    expect(passed).toBeLessThanOrEqual(20_000);
  }

  // The first checking page queued for a slot takes over when a holder hides.
  const nextStreamer = checkers[0];
  const hidingHolder = holders[0];
  expect(nextStreamer).toBeDefined();
  expect(hidingHolder).toBeDefined();
  if (nextStreamer === undefined || hidingHolder === undefined) {
    return;
  }
  const willStream = nextStreamer.waitForRequest(
    (request) => isRevisionStream(request.url()),
    { timeout: 15_000 },
  );
  await setPageVisibility(hidingHolder, "hidden");
  await willStream;

  for (const p of pages.slice(1)) {
    await p.close();
  }
});
