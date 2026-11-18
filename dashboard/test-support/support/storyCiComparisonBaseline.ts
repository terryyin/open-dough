// Trunk histories a CI comparison fixture (./storyCiComparisonFixture.ts)
// starts a story from, declared once and committed by the repository harness:
// a built baseline followed by planning-only revisions up to the claim, or a
// trunk opening with the paths-ignore CI workflow.

import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import type { RepositoryBuilder } from "../../../Distribution/tests/support/repositoryTestData.mjs";
import { commitDeclaredRevision } from "../../../Distribution/tests/support/repository-fixture.mjs";
import type { StartOrigin } from "./startOrigin.ts";
import { dashboardDeveloper } from "./startOriginPreparation.ts";
import { push } from "./storyReviewTrunkCommits.ts";
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

// A trunk whose CI workflow's paths-ignore confirms skips at planning-only
// revisions, as the observed builds ran it.
export const aComparisonCiTrunk = () =>
  makeMe.aRepository.withRevision("ci workflow", {
    backlog: null,
    message: "add CI workflow with paths-ignore",
    files: { ".github/workflows/ci.yml": comparisonCiWorkflow },
  });

// The built baseline keeps the workflow as it ran for the observed builds.
function comparisonBaselineHistory() {
  return withPlanningBeforeClaim(
    makeMe.aRepository.withRevision("built baseline", {
      backlog: null,
      message: "ship a built revision",
      files: {
        "src/built.ts": "built before story\n",
        [comparisonWorkflowPath]: comparisonWorkflow,
      },
    }),
  );
}

// Publishes a declared trunk history, transported once since no reader
// observes the intermediate publications, and answers the commit each named
// revision became.
export async function publishDeclaredTrunk<Name extends string>(
  origin: StartOrigin,
  history: RepositoryBuilder<Name>,
): Promise<Record<Name, string>> {
  const commits: Record<string, string> = {};
  for (const revision of history.please().revisions) {
    commits[revision.name] = await commitDeclaredRevision(
      origin.project,
      revision,
      dashboardDeveloper,
    );
  }
  push(origin.project);
  return commits;
}

// Publishes `comparisonBaselineHistory` on trunk and answers the commit the
// built baseline became.
export async function precedeClaimWithPlanning(
  origin: StartOrigin,
): Promise<string> {
  const commits = await publishDeclaredTrunk(
    origin,
    comparisonBaselineHistory(),
  );
  return commits["built baseline"];
}
