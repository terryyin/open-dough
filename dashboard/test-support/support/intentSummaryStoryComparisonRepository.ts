// The comparison story as declared Git history: Yui's Take of Story A through
// a story branch, her implementation of the comparison changes, its
// integration with another writer's trunk, and her completion, then later
// trunk. A worker keeps it on a start origin for scope history reading
// (./keptPublishedStory.ts). The source journeys retain installed CLI
// completion in ./intentSummaryStoryComparisonFixture.ts.
import { agentIdentity } from "../../../Distribution/src/skills/dough-product-backlog/scripts/product-backlog-agent-profile.mjs";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { direction } from "../../../Distribution/tests/support/product-backlog-fixture.mjs";
import {
  queuedReadyRepository,
  storyA,
  storyB,
  takeRevision,
} from "../../../Distribution/tests/support/queued-repository.mjs";
import {
  laterWithoutBuildBeforeClaim,
  withPlanningBeforeClaim,
} from "./storyCiComparisonFixture.ts";
import {
  comparisonWorkflow,
  comparisonWorkflowPath,
} from "./storyCiComparisonWorkflows.ts";
import {
  summaryComparisonChangeRevision,
  summaryComparisonTrunkRevision,
} from "./intentSummaryStoryComparisonShared.ts";
import type { StartOrigin } from "./startOrigin.ts";
import { dashboardDeveloper } from "./startOriginPreparation.ts";
import { lines } from "./storyReviewWorktree.ts";

const claimant = agentIdentity("Yui");
const author = { name: claimant.agent, email: claimant.email };
const branch = "claude/another-agent";

// The declared history, its done record completed at the call.
export function declaredSummaryComparisonHistory() {
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
  return withPlanningBeforeClaim(
    queuedReadyRepository()
      .withCheckoutIdentity(dashboardDeveloper)
      .withRevision("locations", summaryComparisonTrunkRevision)
      .withRevision("baseline", {
        files: {
          "src/built.ts": "built before story\n",
          [comparisonWorkflowPath]: comparisonWorkflow,
        },
      }),
  )
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
}

// The comparison's endpoints in an origin started from the history, answered
// by the origin's named revisions.
export function declaredSummaryComparisonEndpointsIn(
  origin: Pick<StartOrigin, "revision">,
) {
  return {
    baseline: origin.revision("baseline"),
    completion: origin.revision("completion"),
    branchSide: origin.revision("branch completion"),
    laterWithoutBuild: laterWithoutBuildBeforeClaim,
    agent: claimant.agent,
    branch,
  };
}
