// The trunk history a CI comparison fixture (./storyCiComparisonFixture.ts)
// starts a story from: a built baseline, then planning-only revisions up to
// the claim, declared once and committed by the repository harness.

import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import type { RepositoryBuilder } from "../../../Distribution/tests/support/repositoryTestData.mjs";
import { commitDeclaredRevision } from "../../../Distribution/tests/support/repository-fixture.mjs";
import type { StartOrigin } from "./startOrigin.ts";
import { dashboardDeveloper } from "./startOriginPreparation.ts";
import { push } from "./storyReviewTrunkCommits.ts";
import { lines } from "./storyReviewWorktree.ts";
import {
  comparisonCiWorkflow,
  comparisonWorkflow,
  comparisonWorkflowPath,
} from "./storyCiComparisonWorkflows.ts";

// Planning-only revisions after a built trunk revision and before the claim,
// so the baseline is a measured ancestor this many first-parent commits back.
export const planningBeforeClaim = [
  "plan one",
  "plan two",
  "plan three",
  "plan four",
] as const;

export function withPlanningBeforeClaim<Name extends string>(
  history: RepositoryBuilder<Name>,
) {
  type Planned = RepositoryBuilder<Name | (typeof planningBeforeClaim)[number]>;
  return planningBeforeClaim.reduce<Planned>(
    (planned, name, index) =>
      planned.withRevision(name, {
        message: `planning: ${name}`,
        files: { [`.planning/notes-${String(index)}.md`]: `${name}\n` },
      }),
    history,
  );
}

// The built baseline keeps the workflow as it ran for the observed builds.
// `withCiWorkflow` precedes it with a paths-ignore CI workflow;
// `sharedInBaseline` adds shared.txt so a later completed story can skip its
// initial shared commit and leave a planning-only claim parent.
function comparisonBaselineHistory(options?: {
  readonly withCiWorkflow?: boolean;
  readonly sharedInBaseline?: boolean;
}) {
  const history =
    options?.withCiWorkflow === true
      ? makeMe.aRepository.withRevision("ci workflow", {
          backlog: null,
          message: "add CI workflow with paths-ignore",
          files: { ".github/workflows/ci.yml": comparisonCiWorkflow },
        })
      : makeMe.aRepository;
  return withPlanningBeforeClaim(
    history.withRevision("built baseline", {
      backlog: null,
      message: "ship a built revision",
      files: {
        "src/built.ts": "built before story\n",
        [comparisonWorkflowPath]: comparisonWorkflow,
        ...(options?.sharedInBaseline === true && {
          "shared.txt": lines("line"),
        }),
      },
    }),
  ).please().revisions;
}

// Publishes `comparisonBaselineHistory` on trunk, transported once since no
// reader observes the intermediate publications, and answers the commit the
// built baseline became.
export async function precedeClaimWithPlanning(
  origin: StartOrigin,
  options?: Parameters<typeof comparisonBaselineHistory>[0],
): Promise<string> {
  const commits = new Map<string, string>();
  for (const revision of comparisonBaselineHistory(options)) {
    commits.set(
      revision.name,
      await commitDeclaredRevision(
        origin.project,
        revision,
        dashboardDeveloper,
      ),
    );
  }
  push(origin.project);
  const baseline = commits.get("built baseline");
  if (baseline === undefined) throw new Error("No built baseline committed");
  return baseline;
}
