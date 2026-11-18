// The three done stories the Recently done review-state journeys publish on
// the private origin's trunk, none of them ever run here, and what this
// machine keeps of a story's review state. A card's Story actions are
// ./doneStoryReviewPage.ts.

import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import type { Page } from "@playwright/test";
import { makeMe } from "../../Distribution/tests/support/makeMe.mjs";
import { doneRecordFileName } from "../../Distribution/src/skills/dough-product-backlog/scripts/product-backlog-done-record.mjs";
import { publishCommittedOrigin } from "./committedOrigin.ts";
import type { DashboardServer } from "./support/dashboardServer.ts";
import type { StartOrigin } from "./support/startOrigin.ts";
import { git } from "./support/storyReviewWorktree.ts";

type Story = { readonly identity: string; readonly title: string };

// Newest first, as Recently done lists them.
export const storyC: Story = {
  identity: "SEED-330#tidy-the-terminal-tab",
  title: "Tidy the terminal tab",
};
export const storyA: Story = {
  identity: "SEED-331#explain-the-ci-pause",
  title: "Explain the CI pause",
};
export const storyB: Story = {
  identity: "SEED-332#keep-the-board-scroll",
  title: "Keep the board scroll",
};
export const doneStories = [storyC, storyA, storyB];

const hour = 60 * 60 * 1000;

// The three stories' done records completed an hour apart before `now` by a
// developer on another machine — shared by origin publish and Frontend arrange.
export function boardReviewDoneRecords(now = Date.now()) {
  return doneStories.map((story, index) =>
    makeMe.aDoneRecord
      .with({
        ...story,
        completedAt: new Date(now - (index + 1) * hour).toISOString(),
        developer: "Terry Yin",
        agent: "Akiho-chan",
        host: "codex",
      })
      .please(),
  );
}

// Publishes the three stories' done records on the origin's trunk and serves
// that trunk to the page. The page is not opened yet.
export async function publishDoneStories(
  page: Page,
  origin: StartOrigin,
  now = Date.now(),
) {
  const revision = await origin.publishRevision({
    message: "Complete three stories elsewhere",
    doneRecords: boardReviewDoneRecords(now),
  });
  return publishCommittedOrigin(page, {
    repoDir: origin.origin,
    revision,
    repository: "terryyin/open-dough",
  });
}

// Done-record file name as authenticated `done=bodies` asks it.
export const recordFileOf = (story: Story) =>
  doneRecordFileName(story.identity);

// Where this machine keeps its story review states.
export const reviewStatesFile = (dashboard: DashboardServer) =>
  path.join(dashboard.home, ".open-dough/dashboard/story-review-states.json");

// The story review states this machine keeps, by project id and story
// identity, or undefined while it keeps none at all.
export function keptReviewStates(
  dashboard: DashboardServer,
): Record<string, Record<string, unknown>> | undefined {
  const file = reviewStatesFile(dashboard);
  return existsSync(file)
    ? (JSON.parse(readFileSync(file, "utf8")) as Record<
        string,
        Record<string, unknown>
      >)
    : undefined;
}

// What the project's repository holds: the origin's trunk, the checkout's
// status, and every ref of both.
export async function repositoryState(origin: StartOrigin) {
  return {
    trunk: (await origin.originGit("rev-parse", "main")).trim(),
    originRefs: await origin.originGit("for-each-ref"),
    status: git(origin.project, "status", "--porcelain", "--untracked=all"),
    projectRefs: git(origin.project, "for-each-ref"),
  };
}

// The three stories published on the origin, and how a journey publishes them
// or names a done-record file. Local review files and repository bytes stay
// separate measurements.
export const boardReviewRecords = {
  storyA,
  storyB,
  storyC,
  doneStories,
  publish: publishDoneStories,
  recordFile: recordFileOf,
};
