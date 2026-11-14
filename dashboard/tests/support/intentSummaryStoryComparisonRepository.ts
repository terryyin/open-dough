// The comparison story as declared Git history: Yui's Take of Story A through
// a story branch, her implementation of the comparison changes, its
// integration with another writer's trunk, and her completion, then later
// trunk. Sort materializes it privately; a worker keeps it on a start origin
// for scope history reading (./keptPublishedStory.ts). The source journeys
// retain installed CLI completion in ./intentSummaryStoryComparisonFixture.ts.
import { agentIdentity } from "../../../Distribution/src/skills/dough-product-backlog/scripts/product-backlog-agent-profile.mjs";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { direction } from "../../../Distribution/tests/support/product-backlog-fixture.mjs";
import {
  queuedReadyRepository,
  storyA,
  storyB,
  takeRevision,
} from "../../../Distribution/tests/support/queued-repository.mjs";
import { materializeRepository } from "../../../Distribution/tests/support/repository-fixture.mjs";
import { planningBeforeClaim, revList } from "./storyCiComparisonFixture.ts";
import {
  comparisonWorkflow,
  comparisonWorkflowPath,
} from "./storyCiComparisonWorkflows.ts";
import {
  summaryComparisonChangeRevision,
  summaryComparisonTrunkRevision,
} from "./intentSummaryStoryComparisonShared.ts";
import { dashboardDeveloper } from "./startOriginPreparation.ts";
import { git, lines } from "./storyReviewWorktree.ts";

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
  return queuedReadyRepository()
    .withCheckoutIdentity(dashboardDeveloper)
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
}

type EndpointName = "baseline" | "completion" | "branch completion" | "shared";

// The comparison's endpoints in `checkout`, which holds the history, given
// each named revision's commit.
function declaredSummaryComparisonEndpoints(
  checkout: string,
  revision: (name: EndpointName) => string,
) {
  const baseline = revision("baseline");
  return {
    baseline,
    completion: revision("completion"),
    branchSide: revision("branch completion"),
    laterWithoutBuild: revList(checkout, revision("shared"), 20).indexOf(
      baseline,
    ),
    agent: claimant.agent,
    branch,
  };
}

// The same endpoints in a checkout started from the history, where each
// named revision is the commit whose message is its name.
export function declaredSummaryComparisonEndpointsIn(checkout: string) {
  const named = new Map(
    git(checkout, "log", "--format=%s%x00%H", "main")
      .split("\n")
      .map((line) => line.split("\0") as [string, string]),
  );
  return declaredSummaryComparisonEndpoints(checkout, (name) => {
    const commit = named.get(name);
    if (commit === undefined)
      throw new Error(`No revision named ${name} on main in ${checkout}`);
    return commit;
  });
}

export async function materializeDeclaredSummaryComparisonRepository(
  parent: string,
) {
  const built = await materializeRepository(
    declaredSummaryComparisonHistory(),
    { parent },
  );
  return {
    ...built,
    ...declaredSummaryComparisonEndpoints(
      built.integration,
      (name) => built.revisions[name],
    ),
  };
}
