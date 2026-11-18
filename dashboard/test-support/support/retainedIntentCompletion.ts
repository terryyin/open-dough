// Real CLI published completion with a retained readable workspace; callers
// supply the story, later-trunk and uncommitted facts through MakeMe revisions.
import type { Page } from "@playwright/test";
import type { RevisionFacts } from "../../../Distribution/tests/support/repositoryTestData.mjs";
import { writeRevisionFiles } from "../../../Distribution/tests/support/repository-revision-files.mjs";
import { publishCommittedOrigin } from "../committedOrigin.ts";
import {
  completedPublishedStory,
  advanceCompletedTrunk,
} from "./completedPublishedStory.ts";
import type { DashboardServer } from "./dashboardServer.ts";
import { publishIntentTrunk } from "./intentStoryWorktree.ts";
import { keepLaunchRecord } from "./storyLaunchRecord.ts";
import type { StartOrigin } from "./startOrigin.ts";
import { commitAll, git } from "./storyReviewWorktree.ts";
import { push } from "./storyReviewTrunkCommits.ts";

export async function retainedIntentCompletion(
  page: Page,
  dashboard: DashboardServer,
  origin: StartOrigin,
  facts: {
    readonly implementation: RevisionFacts;
    readonly local: RevisionFacts;
    readonly later?: RevisionFacts;
    readonly shallow?: boolean;
  },
) {
  publishIntentTrunk(origin.project);
  const story = await completedPublishedStory(
    origin,
    "trunk",
    undefined,
    (workspace) => {
      writeRevisionFiles(workspace, facts.implementation);
    },
    undefined,
    { retainWorkspace: true, interleaved: false },
  );
  keepLaunchRecord(dashboard, story.workspace);
  advanceCompletedTrunk(origin);
  if (facts.later !== undefined) {
    writeRevisionFiles(origin.project, facts.later);
    commitAll(origin.project, "later trunk changes after completion");
    push(origin.project);
  }
  writeRevisionFiles(story.workspace, facts.local);
  if (facts.shallow === true)
    git(origin.project, "fetch", "--quiet", "--depth=1", "origin", "main");
  const published = git(origin.origin, "rev-parse", "main");
  await publishCommittedOrigin(page, {
    repoDir: origin.origin,
    revision: published,
    repository: "terryyin/open-dough",
    follows: true,
  });
  return { ...story, published };
}
