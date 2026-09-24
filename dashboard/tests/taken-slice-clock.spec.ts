// Each Taken card with counted plan slices shows how long its current slice
// has been running: since the later of the plan's last commit and the Take
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
    card.getByRole("img", { name: "1 of 2 slices recorded done" }),
  ).toBeVisible();
}

test("each Taken card's clock runs from the later of its last plan commit and its Take, ticking with page time", async ({
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

  await test.step("a plan committed 12 min ago, after a 30 min old Take, runs for 12 min", async () => {
    await expect(card(afterTake)).toContainText(
      "Current slice running for 12 min",
    );
    await expect(card(afterTake)).not.toContainText(
      "measured from the last plan commit",
    );
  });

  await test.step("a story Taken 5 min ago, planned two days ago, runs for 5 min from the Take", async () => {
    await expect(card(justTaken)).toContainText(
      "Current slice running for 5 min",
    );
  });

  await test.step("without a profile, the clock runs from the plan commit and says so", async () => {
    await expect(card(beforeProfiles)).toContainText(
      "Current slice running for 40 min (measured from the last plan commit; no agent profile records the Take)",
    );
  });

  await test.step("a commit list that fails is a clock gap, and the bar stays", async () => {
    await expect(card(timeUnread)).toContainText(
      `Current slice time unavailable: The local GitHub CLI could not reach GitHub while reading the last commit of ${planPath("time-unread")} at ${revision}.`,
    );
    await expectBarStays(card(timeUnread));
    await expect(card(timeUnread)).not.toContainText("running for");
    await expect(problem).toHaveCount(0);
  });

  await test.step("two profiles naming the story make the Take ambiguous: a clock gap, never a plan-only clock", async () => {
    await expect(card(twoOwners)).toContainText(
      "Current slice time unavailable: More than one agent profile names this story, so its Take is ambiguous.",
    );
    await expect(card(twoOwners)).not.toContainText("running for");
    await expect(card(twoOwners)).not.toContainText(noProfileLabel);
    await expectBarStays(card(twoOwners));
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
      "Current slice running for 13 min",
    );
    await expect(card(justTaken)).toContainText(
      "Current slice running for 6 min",
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
  await expect(card).not.toContainText("running for");
  await expect(taken).not.toContainText(noProfileLabel);
  await expectBarStays(card);
});
