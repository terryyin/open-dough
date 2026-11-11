// Sort's completed-story precondition is actual private Git history. The source
// journeys retain installed CLI completion in intentSummaryStoryComparisonFixture.
import type { Page } from "@playwright/test";
import { agentIdentity } from "../../../src/skills/dough-product-backlog/scripts/product-backlog-agent-profile.mjs";
import { makeMe } from "../../../tests/support/makeMe.mjs";
import { direction } from "../../../tests/support/product-backlog-fixture.mjs";
import {
  storyA,
  storyB,
  takeRevision,
} from "../../../tests/support/queued-repository.mjs";
import { commitDeclaredRevision } from "../../../tests/support/repository-fixture.mjs";
import { planningBeforeClaim, revList } from "./storyCiComparisonFixture.ts";
import {
  comparisonWorkflow,
  comparisonWorkflowPath,
} from "./storyCiComparisonWorkflows.ts";
import {
  summaryComparisonChangeRevision,
  summaryComparisonTrunkRevision,
} from "./intentSummaryStoryComparisonShared.ts";
import { serveSummaryComparisonStory } from "./intentSummaryStoryComparisonServing.ts";
import type { StartOrigin } from "./startOrigin.ts";
import { dashboardDeveloper } from "./startOriginPreparation.ts";
import { lines } from "./storyReviewWorktree.ts";
import { push } from "./storyReviewTrunkCommits.ts";

export async function publishDeclaredSummaryComparisonStory(
  page: Page,
  origin: StartOrigin,
) {
  const claimant = agentIdentity("Yui");
  const author = { name: claimant.agent, email: claimant.email };
  const branch = "claude/another-agent";
  const implementation = {
    ...summaryComparisonChangeRevision.files,
    "shared.txt": lines("line").replace("line 0\n", "story first\n"),
    "[literal]*.txt": "delivered on another machine\n",
  };
  const integrated = {
    ...implementation,
    "shared.txt": implementation["shared.txt"].replace(
      "line 11\n",
      "other last\n",
    ),
    "other-story.txt": "another story\n",
  };
  const done = {
    backlog: { direction, queued: [storyB] },
    remove: [
      `.planning/${claimant.path}`,
      ...(summaryComparisonChangeRevision.remove ?? []),
    ],
    doneRecords: [
      makeMe.aDoneRecord
        .with({
          identity: storyA.identity,
          title: storyA.title,
          completedAt: new Date().toISOString(),
          agent: claimant.agent,
          host: "claude",
        })
        .please(),
    ],
  };
  const history = makeMe.aRepository
    .withRevision("locations", summaryComparisonTrunkRevision)
    .withRevision("baseline", {
      files: {
        "src/built.ts": "built before story\n",
        [comparisonWorkflowPath]: comparisonWorkflow,
      },
    })
    .withRevision("plan one", planningBeforeClaim[0])
    .withRevision("plan two", planningBeforeClaim[1])
    .withRevision("plan three", planningBeforeClaim[2])
    .withRevision("plan four", planningBeforeClaim[3])
    .withRevision("shared", { files: { "shared.txt": lines("line") } })
    .withRevision(
      "claim",
      takeRevision({
        story: storyA,
        queued: [storyB],
        agent: "Yui",
        committer: dashboardDeveloper,
        host: "claude",
        publisher: "another-publisher",
        branch,
      }),
    )
    .withRevision("implementation", {
      author,
      files: implementation,
      remove: summaryComparisonChangeRevision.remove ?? [],
    })
    .withRevision("trunk writer", {
      parents: ["claim"],
      files: {
        "shared.txt": lines("line").replace("line 11\n", "other last\n"),
        "other-story.txt": "another story\n",
      },
    })
    .withRevision("integration", {
      parents: ["implementation", "trunk writer"],
      author,
      files: integrated,
    })
    .withRevision("branch completion", { author, ...done })
    .withRevision("trunk before landing", {
      parents: ["trunk writer"],
      files: { "integration-other.txt": "another change before integration\n" },
    })
    .withRevision("completion", {
      parents: ["trunk before landing", "branch completion"],
      author,
      committer: author,
      files: integrated,
      ...done,
    })
    .withRevision("later test", {
      files: { "dashboard/tests/later.spec.ts": "later trunk file\n" },
    })
    .withRevision("later trunk", {
      files: {
        "later.txt": "later trunk\n",
        "[literal]*.txt": "later rewrite\n",
      },
    })
    .please();

  const revisions: Record<string, string> = {};
  const revisionSha = (name: string) => {
    const sha = revisions[name];
    if (sha === undefined)
      throw new Error(`Missing declared revision: ${name}`);
    return sha;
  };
  for (const revision of history.revisions) {
    revisions[revision.name] = await commitDeclaredRevision(
      origin.project,
      revision,
      dashboardDeveloper,
      revision.parents?.map(revisionSha),
    );
  }
  push(origin.project);
  const baseline = revisionSha("baseline");
  return serveSummaryComparisonStory(page, origin, {
    baseline,
    completion: revisionSha("completion"),
    branchSide: revisionSha("branch completion"),
    laterWithoutBuild: revList(
      origin.project,
      revisionSha("shared"),
      20,
    ).indexOf(baseline),
    agent: claimant.agent,
    branch,
  });
}
