// Each Taken card with counted plan slices shows how long ago its current
// slice started: at the later of the plan's last commit and the Take
// (the commit that added the entry's agent profile), both at the snapshot's
// revision, ticking with page time and asking GitHub nothing more. The fake
// GitHub only publishes files, profiles spelled by the shared profile
// renderer, when each plan was last committed, and each profile's history;
// the page clock is paused so page time passes only when the journey says.
// The local read boundary, the shared readers, and the page decide
// everything shown.

import type { Locator, Page } from "@playwright/test";
import { expect, githubFor, pausePageClockAt, test } from "./dashboardTest.ts";
import { expectMembership, parts } from "./dashboardPage.ts";
import { isHeadsCheck } from "./originObservation.ts";
import { publishFiles } from "./publishedOrigin.ts";
import { callsSince } from "./autoRefreshJourney.ts";
import { publishes } from "./support/fakeGitHub.ts";
import { noConnection } from "./originAnswers.ts";
import { addedAt, pathChange } from "./pathHistoryAnswers.ts";
import {
  afterTake,
  beforeProfiles,
  committed,
  files,
  history,
  justTaken,
  opened,
  planPath,
  profilePath,
  repository,
  revision,
  stories,
  takes,
  timeUnread,
} from "./sliceClockRecords.ts";

const noProfileLabel = "no agent profile records the Take";

// Opens the dashboard once every Taken card's clock has been read.
async function openedTaken(page: Page) {
  await page.goto("/");
  await expectMembership(page, {
    taken: stories.map(({ title }) => title),
    backlog: [],
  });
  await expect(page.getByText("Reading current slice time…")).toHaveCount(0);
  return parts(page);
}

// A clock gap leaves the card's slice progress bar in place.
async function expectBarStays(card: Locator) {
  await expect(
    card.getByRole("img", { name: "1 of 2 slices recorded complete" }),
  ).toBeVisible();
}

test("each Taken card's clock measures from the later of its last plan commit and its Take, ticking with page time", async ({
  page,
}) => {
  await pausePageClockAt(page, opened);
  const requests = await publishFiles(page, {
    repository,
    revision,
    files,
    committed,
    history,
  });

  const { taken, problem } = await openedTaken(page);
  const card = (title: string) => taken.getByRole("article", { name: title });

  await test.step("a plan committed 12 min ago, after a 30 min old Take, started 12 min ago", async () => {
    await expect(card(afterTake)).toContainText(
      "Current slice started 12 min ago",
    );
    await expect(card(afterTake)).not.toContainText(
      "measured from the last plan commit",
    );
  });

  await test.step("a story Taken 5 min ago, planned two days ago, started 5 min ago at the Take", async () => {
    await expect(card(justTaken)).toContainText(
      "Current slice started 5 min ago",
    );
  });

  await test.step("without a profile, the clock measures from the plan commit and says so", async () => {
    await expect(card(beforeProfiles)).toContainText(
      "Current slice started 40 min ago (measured from the last plan commit; no agent profile records the Take)",
    );
  });

  await test.step("an empty plan commit list is a terminal clock gap, and the bar stays", async () => {
    await expect(card(timeUnread)).toContainText(
      `Current slice time unavailable: GitHub's answer for the last commit of ${planPath("time-unread")} at ${revision} did not name a commit.`,
    );
    await expectBarStays(card(timeUnread));
    await expect(card(timeUnread)).not.toContainText("Current slice started");
    // Established absence: labeled on the card; does not arm detail recovery.
    await expect(problem).toHaveCount(0);
  });

  // A failed plan commit shows its card's gap without waiting for that card's
  // Take time, whose ask may still be on its way.
  await test.step("each plan's last commit time was asked once, and each Take only through its profile's addition, which also names its human", async () => {
    const asked = () =>
      requests
        .flatMap(({ request }) => {
          switch (request.kind) {
            case "commit-list":
              return [
                `${request.perPage === 1 ? "last commit" : "history"} ${request.path}@${request.revision}`,
              ];
            case "commit":
              return [`commit ${request.sha}`];
            default:
              return [];
          }
        })
        .sort();
    // Two `gh` requests per Taken profile, its history and its addition
    // commit: no last commit time of a profile is asked.
    await expect
      .poll(asked)
      .toEqual(
        [
          ...stories.map(
            ({ anchor }) => `last commit ${planPath(anchor)}@${revision}`,
          ),
          ...Object.entries(takes).flatMap(([agent, { sha }]) => [
            `history ${profilePath(agent)}@${revision}`,
            `commit ${sha}`,
          ]),
        ].sort(),
      );
  });

  await test.step("60 s more of page time shows 13 min; answered clocks ask nothing of their own", async () => {
    const from = githubFor(page).calls.length;
    // Empty plan history is terminal absence, so checks are not blocked by
    // detail recovery while clocks tick.
    await page.clock.runFor(60_000);
    await expect(card(afterTake)).toContainText(
      "Current slice started 13 min ago",
    );
    await expect(card(justTaken)).toContainText(
      "Current slice started 6 min ago",
    );
    const content = callsSince(page, from).filter(
      (call) => !isHeadsCheck(call),
    );
    // Answered clocks' plan commit lists stay settled for this pin.
    expect(
      content.filter(
        (call) =>
          call.request.kind === "commit-list" &&
          (call.request.path === planPath("after-take") ||
            call.request.path === planPath("just-taken") ||
            call.request.path === planPath("before-profiles")),
      ),
    ).toEqual([]);
  });

  await test.step("a slice running for hours says hours and minutes, and after 26 hours says 1 d 2 h", async () => {
    await page.clock.fastForward("03:00:00");
    await expect(card(afterTake)).toContainText(
      "Current slice started 3 h 13 min ago",
    );
    await page.clock.fastForward("22:47:00");
    await expect(card(afterTake)).toContainText(
      "Current slice started 1 d 2 h ago",
    );
  });
});

test("when agent profiles cannot be read, the clock is a gap rather than a plan-only clock", async ({
  page,
}) => {
  await pausePageClockAt(page, opened);
  // The same records, but the profile directory cannot be listed.
  const published = publishes({ revision, files, committed, history });
  githubFor(page).serve(repository, (call) =>
    call.request.kind === "listing"
      ? Promise.resolve(noConnection)
      : published(call),
  );

  const { taken } = await openedTaken(page);
  const card = taken.getByRole("article", { name: afterTake });
  await expect(card).toContainText("Agent profiles could not be read.");
  await expect(card).toContainText(
    "Current slice time unavailable: The Take time cannot be determined because agent profiles could not be read.",
  );
  await expect(card).not.toContainText("Current slice started");
  await expect(taken).not.toContainText(noProfileLabel);
  await expectBarStays(card);
});

test("a Take whose profile addition is not found, or names no usable time, is a clock gap", async ({
  page,
}) => {
  await pausePageClockAt(page, opened);
  await publishFiles(page, {
    repository,
    revision,
    files,
    committed,
    history: {
      ...history,
      [profilePath("Akiho")]: [
        pathChange(0x61, "modified", "Mo Modifier"),
        pathChange(0x62, "removed", "Olde Allocator"),
      ],
      [profilePath("Yuma")]: [addedAt(0x63, null)],
    },
  });

  const { taken } = await openedTaken(page);
  const card = (title: string) => taken.getByRole("article", { name: title });
  await expect(card(afterTake)).toContainText(
    "Current slice time unavailable: The Take time cannot be determined: no commit adding the agent profile was found in its recent published history.",
  );
  await expect(card(justTaken)).toContainText(
    "Current slice time unavailable: The Take time cannot be determined: the commit that added the agent profile names no usable commit time.",
  );
  for (const title of [afterTake, justTaken]) {
    await expect(card(title)).not.toContainText("Current slice started");
    await expectBarStays(card(title));
  }
});
