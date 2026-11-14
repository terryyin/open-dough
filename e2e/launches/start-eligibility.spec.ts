// A card's start eligibility: a Ready assessment waits on its dependency and
// becomes startable without any readiness write, in Backlog and in Taken.
import { makeMe } from "../../tests/support/makeMe.mjs";
import { readFileSync } from "node:fs";
import path from "node:path";
import {
  passTimeUntilChecked,
  pausePageClock,
} from "../../dashboard/tests/autoRefreshJourney.ts";
import { expect } from "../../dashboard/tests/dashboardTest.ts";
import { publishCommittedOrigin } from "../../dashboard/tests/committedOrigin.ts";
import { shortRevision, parts } from "../../dashboard/tests/dashboardPage.ts";
import {
  consumer,
  supplierB,
  test,
  recordDependency,
  publishDependencies,
  takeConsumer,
} from "../../dashboard/tests/storyDependencyFixture.ts";
import { recordAssessed } from "../../dashboard/tests/storyReadinessCli.ts";
import { openUntilRead } from "../../dashboard/tests/pageRequestNotes.ts";
import { storyCard } from "../../dashboard/tests/storyCardControls.ts";
import {
  blockedByAnyDependency,
  expectBadges,
} from "../../dashboard/tests/storyCardFacts.ts";

// The story-state record of the consumer's canonical home, as published.
function storyStateRecord(project: string): string {
  const seed = readFileSync(path.join(project, ".planning/seeds/A.md"), "utf8");
  const [record] = /```json dough-story-state\n[^\n]*\n```/.exec(seed) ?? [];
  expect(record).toBeDefined();
  return record ?? "";
}

test("a ready story waits on its dependency and becomes startable once it is satisfied, with no readiness write", async ({
  page,
  origin,
  dashboard,
}) => {
  recordDependency(origin, { supplier: supplierB, state: "waiting" });
  // The preparing agent reviews the story with its dependency agreement.
  recordAssessed(
    origin.project,
    consumer,
    makeMe.aStoryPreparation
      .with({
        refinement: "refined",
        approach: "planned",
        plan: "../slice-plans/A/PLAN.md",
        assessment: "ready",
      })
      .please(),
  );
  const revision = await publishDependencies(origin);
  const readiness = storyStateRecord(origin.project);
  const published = await publishCommittedOrigin(page, {
    repoDir: origin.project,
    revision,
    repository: "terryyin/open-dough",
    follows: true,
  });
  await pausePageClock(page);
  await openUntilRead(page);
  const card = storyCard(parts(page).backlog, consumer.title);
  const execution = card.getByRole("button", { name: "Start execution" });
  await expectBadges(card, {
    shown: ["Blocked by 1 dependency"],
    absent: ["Ready for execution", "Not ready"],
  });
  await expect(execution).toBeDisabled();
  await expect(execution).toHaveAccessibleDescription(/1 blocking dependency/);

  recordDependency(origin, {
    supplier: supplierB,
    state: "satisfied",
    resolution: {
      revision,
      path: ".planning/seeds/B.md",
      summary: "Accepted supplier endpoint proof.",
    },
  });
  const satisfied = await publishDependencies(origin);
  await passTimeUntilChecked(page);
  await expect(parts(page).readRevision).toContainText(
    shortRevision(satisfied),
  );
  await expectBadges(card, {
    shown: ["Ready for execution"],
    absent: [blockedByAnyDependency, "Changed since readiness review"],
  });
  await expect(execution).toBeEnabled();
  await expect(card.locator(".dependency-start-reason")).toHaveCount(0);
  // Only the dependency state changed; readiness was not rerecorded.
  expect(storyStateRecord(origin.project)).toBe(readiness);
  expect(dashboard.claudeLaunchCalls()).toEqual([]);
  expect(published.requests.length).toBeGreaterThan(0);
});

test("a Taken card's green badge waits on its dependency like a Backlog card's", async ({
  page,
  origin,
}) => {
  recordDependency(origin, { supplier: supplierB, state: "waiting" });
  recordAssessed(
    origin.project,
    consumer,
    makeMe.aStoryPreparation
      .with({
        refinement: "refined",
        approach: "planned",
        plan: "../slice-plans/A/PLAN.md",
        assessment: "ready",
      })
      .please(),
  );
  takeConsumer(origin);
  const revision = await publishDependencies(origin);
  await publishCommittedOrigin(page, {
    repoDir: origin.project,
    revision,
    repository: "terryyin/open-dough",
    follows: true,
  });
  await pausePageClock(page);
  await openUntilRead(page);
  const card = storyCard(parts(page).taken, consumer.title);
  await expectBadges(card, {
    shown: ["Blocked by 1 dependency"],
    absent: ["Ready for execution"],
  });

  recordDependency(origin, {
    supplier: supplierB,
    state: "satisfied",
    resolution: {
      revision,
      path: ".planning/seeds/B.md",
      summary: "Accepted supplier endpoint proof.",
    },
  });
  const satisfied = await publishDependencies(origin);
  await passTimeUntilChecked(page);
  await expect(parts(page).readRevision).toContainText(
    shortRevision(satisfied),
  );
  await expectBadges(card, {
    shown: ["Ready for execution"],
    absent: [blockedByAnyDependency],
  });
});
