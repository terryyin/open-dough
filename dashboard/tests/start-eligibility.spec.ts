// A card's start eligibility: a Ready assessment waits on its dependency and
// becomes startable without any readiness write, in Backlog and in Taken.
import { readFileSync } from "node:fs";
import path from "node:path";
import { passTimeUntilChecked, pausePageClock } from "./autoRefreshJourney.ts";
import { expect } from "./dashboardTest.ts";
import { publishCommittedOrigin } from "./committedOrigin.ts";
import { shortRevision, parts } from "./dashboardPage.ts";
import {
  consumer,
  test,
  recordDependency,
  publishDependencies,
  takeConsumer,
} from "./storyDependencyFixture.ts";
import { recordAssessed } from "./storyReadinessCli.ts";
import { openUntilRead } from "./pageRequestNotes.ts";

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
  recordDependency(origin, 0, "waiting");
  // The preparing agent reviews the story with its dependency agreement.
  recordAssessed(origin.project, consumer, {
    refinement: "refined",
    approach: "planned",
    plan: "../slice-plans/A/PLAN.md",
    assessment: "ready",
  });
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
  const card = parts(page).backlog.getByRole("article", {
    name: consumer.title,
    exact: true,
  });
  const execution = card.getByRole("button", { name: "Start execution" });
  await expect(
    card.getByText("Blocked by 1 dependency", { exact: true }),
  ).toBeVisible();
  await expect(card.locator(".badge-ready")).toHaveCount(0);
  await expect(card.getByText("Not ready", { exact: true })).toHaveCount(0);
  await expect(execution).toBeDisabled();
  await expect(execution).toHaveAccessibleDescription(/1 blocking dependency/);

  recordDependency(origin, 0, "satisfied", revision);
  const satisfied = await publishDependencies(origin);
  await passTimeUntilChecked(page);
  await expect(parts(page).readRevision).toContainText(
    shortRevision(satisfied),
  );
  await expect(
    card.getByText("Ready for execution", { exact: true }),
  ).toBeVisible();
  await expect(card.locator(".badge-blocked-by-dependencies")).toHaveCount(0);
  await expect(execution).toBeEnabled();
  await expect(card.locator(".dependency-start-reason")).toHaveCount(0);
  await expect(
    card.getByText("Changed since readiness review", { exact: true }),
  ).toHaveCount(0);
  // Only the dependency state changed; readiness was not rerecorded.
  expect(storyStateRecord(origin.project)).toBe(readiness);
  expect(dashboard.claudeLaunchCalls()).toEqual([]);
  expect(published.requests.length).toBeGreaterThan(0);
});

test("a Taken card's green badge waits on its dependency like a Backlog card's", async ({
  page,
  origin,
}) => {
  recordDependency(origin, 0, "waiting");
  recordAssessed(origin.project, consumer, {
    refinement: "refined",
    approach: "planned",
    plan: "../slice-plans/A/PLAN.md",
    assessment: "ready",
  });
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
  const card = parts(page).taken.getByRole("article", {
    name: consumer.title,
    exact: true,
  });
  await expect(
    card.getByText("Blocked by 1 dependency", { exact: true }),
  ).toBeVisible();
  await expect(card.locator(".badge-ready")).toHaveCount(0);

  recordDependency(origin, 0, "satisfied", revision);
  const satisfied = await publishDependencies(origin);
  await passTimeUntilChecked(page);
  await expect(parts(page).readRevision).toContainText(
    shortRevision(satisfied),
  );
  await expect(
    card.getByText("Ready for execution", { exact: true }),
  ).toBeVisible();
  await expect(card.locator(".badge-blocked-by-dependencies")).toHaveCount(0);
});
