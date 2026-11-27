// Declared published completion with a retained readable workspace; callers
// supply the story, later-trunk and uncommitted facts through MakeMe revisions.
// Retained landing records stay a visible keepLaunchRecord action.
import type { Page } from "@playwright/test";
import type { RevisionFacts } from "../../../Distribution/tests/support/repositoryTestData.mjs";
import { writeRevisionFiles } from "../../../Distribution/tests/support/repository-revision-files.mjs";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { publishCommittedOrigin } from "../committedOrigin.ts";
import {
  intentTrunkCompletionOntoTip,
  retainedDeclaredStoryWorkspace,
} from "./intentCompletedHistory.ts";
import type { DashboardServer } from "./dashboardServer.ts";
import { publishIntentTrunk } from "./intentStoryWorktree.ts";
import { keepLaunchRecord } from "./storyLaunchRecord.ts";
import type { StartOrigin } from "./startOrigin.ts";
import { publishDeclaredTrunk } from "./storyCiComparisonBaseline.ts";
import { shallowPublishedHistory } from "./reviewRepositoryFixture.ts";
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
  const publishedCommits = await publishDeclaredTrunk(
    origin,
    intentTrunkCompletionOntoTip({
      interleaved: false,
      implementation: facts.implementation,
      advance: true,
    }),
  );
  const story = await retainedDeclaredStoryWorkspace(
    origin,
    publishedCommits,
    "retained-intent",
  );
  keepLaunchRecord(dashboard, story.workspace);
  let published = publishedCommits["advance after completion"];
  if (facts.later !== undefined) {
    writeRevisionFiles(origin.project, facts.later);
    published = makeMe
      .theWorkspace(origin.project)
      .commitAll("later trunk changes after completion")
      .please();
    push(origin.project);
  }
  writeRevisionFiles(story.workspace, facts.local);
  if (facts.shallow === true) shallowPublishedHistory(origin);
  await publishCommittedOrigin(page, {
    repoDir: origin.origin,
    revision: published,
    repository: "terryyin/open-dough",
    follows: true,
  });
  return { ...story, published };
}
