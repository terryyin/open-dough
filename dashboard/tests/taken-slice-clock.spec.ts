// Each Taken card with counted plan slices shows how long ago its current
// slice started: at the later of the plan's last commit and the Take
// (the commit that added the entry's agent profile), both at the snapshot's
// revision, ticking with page time and asking GitHub nothing more. The fake
// GitHub only publishes files, profiles spelled by the shared profile
// renderer, and when each path was last committed; the page clock is paused so
// page time passes only when the journey says. The local read boundary, the
// shared readers, and the page decide everything shown.

import type { Locator, Page } from "@playwright/test";
import { expect, githubFor, test } from "./dashboardTest";
import { expectMembership, parts } from "./dashboardPage";
import { isRefCheck } from "./originObservation";
import { publishFiles } from "./publishedOrigin";
import { callsSince, checksAskedWhilePassing } from "./autoRefreshJourney";
import { publishes } from "./support/fakeGitHub";
import { noConnection } from "./originAnswers";
import {
  afterTake,
  beforeProfiles,
  committed,
  files,
  justTaken,
  opened,
  planPath,
  profilePath,
  repository,
  revision,
  stories,
  timeUnread,
  twoOwners,
} from "./sliceClockRecords";

const noProfileLabel = "no agent profile records the Take";

// Page time stands still at `opened` until a journey lets it pass.
async function pauseAtOpening(page: Page) {
  await page.clock.install({ time: opened });
  await page.clock.pauseAt(opened);
}

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
  await pauseAtOpening(page);
  const requests = await publishFiles(page, {
    repository,
    revision,
    files,
    committed,
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

  await test.step("a commit list that fails is a clock gap, and the bar stays", async () => {
    await expect(card(timeUnread)).toContainText(
      `Current slice time unavailable: The local GitHub CLI could not reach GitHub while reading the last commit of ${planPath("time-unread")} at ${revision}.`,
    );
    await expectBarStays(card(timeUnread));
    await expect(card(timeUnread)).not.toContainText("Current slice started");
    await expect(problem).toHaveCount(0);
  });

  await test.step("two profiles naming the story leave no single progress source: a gap, never a plan-only clock", async () => {
    await expect(card(twoOwners)).toContainText(
      "More than one agent profile names this story, so it has no single progress source.",
    );
    await expect(card(twoOwners).getByRole("img")).toHaveCount(0);
    await expect(card(twoOwners)).not.toContainText("recorded complete");
    await expect(card(twoOwners)).not.toContainText("Current slice started");
    await expect(card(twoOwners)).not.toContainText(noProfileLabel);
  });

  await test.step("each commit time was asked once, for the plan and the single profile at the revision", () => {
    const asked = requests.flatMap(({ request }) =>
      request.kind === "commit-list"
        ? [`${request.path}@${request.revision}`]
        : [],
    );
    expect(asked.sort()).toEqual(
      [
        ...stories
          .filter(({ anchor }) => anchor !== "two-owners")
          .map(({ anchor }) => planPath(anchor)),
        ...["Akiho", "Yuma", "Sola"].map(profilePath),
      ]
        .map((path) => `${path}@${revision}`)
        .sort(),
    );
  });

  await test.step("60 s more of page time shows 13 min, asking GitHub nothing but revision checks", async () => {
    const from = githubFor(page).calls.length;
    const checks = await checksAskedWhilePassing(page, 60_000);
    await expect(card(afterTake)).toContainText(
      "Current slice started 13 min ago",
    );
    await expect(card(justTaken)).toContainText(
      "Current slice started 6 min ago",
    );
    const calls = callsSince(page, from);
    expect(checks).toBeGreaterThan(0);
    expect(calls.filter((call) => !isRefCheck(call))).toEqual([]);
  });
});

test("when agent profiles cannot be read, the clock is a gap rather than a plan-only clock", async ({
  page,
}) => {
  await pauseAtOpening(page);
  // The same records, but the profile directory cannot be listed.
  const published = publishes({ revision, files, committed });
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
