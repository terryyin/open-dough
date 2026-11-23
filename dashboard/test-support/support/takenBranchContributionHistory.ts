import {
  queuedReadyRepository,
  storyA,
  storyB,
  takeRevision,
} from "../../../Distribution/tests/support/queued-repository.mjs";
import { withLocalState } from "../../../Distribution/tests/support/repository-local-state.mjs";
import { dashboardDeveloper } from "./startOriginPreparation.ts";
import { yui } from "./storyReviewTrunkCommits.ts";
import { branch } from "./storyReviewWorktree.ts";

export function takenBranchContributionHistory({
  laterIntegrations = false,
}: { readonly laterIntegrations?: boolean } = {}) {
  const incoming = queuedReadyRepository()
    .withRevision("story start", {
      files: { "guides/mixed.txt": "original\n" },
    })
    .withRevision(
      "take",
      takeRevision({
        story: storyA,
        queued: [storyB],
        agent: yui.name as string,
        branch,
        committer: dashboardDeveloper,
      }),
    )
    .withRevision("incoming trunk", {
      files: {
        "guides/incoming.txt": "incoming trunk change\n",
        "guides/mixed.txt": "trunk edit\n",
      },
    });
  const trunk = laterIntegrations
    ? incoming.withRevision("next trunk", {
        files: { "guides/second-incoming.txt": "more incoming trunk change\n" },
      })
    : incoming;
  const integrated = trunk
    .withRevision("later trunk", {
      files: { "guides/later.txt": "not merged\n" },
    })
    .withWorkspace(branch, { from: "take", agent: yui.agent })
    .withUnpublishedRevision("branch contribution", {
      files: {
        "guides/branch.txt": "branch contribution\n",
        "guides/mixed.txt": "branch edit\n",
      },
    })
    .withUnpublishedRevision("merge trunk", {
      parents: ["branch contribution", "incoming trunk"],
      files: {
        "guides/incoming.txt": "incoming trunk change\n",
        "guides/mixed.txt": "branch edit and trunk edit\n",
        "guides/merge.txt": "authored during the merge\n",
      },
    });
  const workspace = laterIntegrations
    ? integrated
        .withUnpublishedRevision("merge clean trunk", {
          parents: ["merge trunk", "next trunk"],
          files: {
            "guides/second-incoming.txt": "more incoming trunk change\n",
            "guides/clean-merge.txt": "authored during the clean merge\n",
          },
        })
        .withUnpublishedRevision("merge later trunk", {
          parents: ["merge clean trunk", "later trunk"],
          files: { "guides/later.txt": "merged after the chosen range\n" },
        })
    : integrated;
  return withLocalState(
    workspace.please(),
    { untracked: { "guides/draft.txt": "uncommitted draft\n" } },
    branch,
  );
}
