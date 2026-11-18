// Frontend answers for a project whose consumer story states supplier
// agreements (../storyDependencyFixture.ts): the queued-ready project with
// one dependency revision, published as the substitute's backlog and files.

import { queuedReadyRepository } from "../../../Distribution/tests/support/queued-repository.mjs";
import type { RevisionFacts } from "../../../Distribution/tests/support/repositoryTestData.mjs";
import { backlogApart, describedRevisions } from "../describedRevisions.ts";
import {
  putFrontendPublished,
  type FrontendServiceState,
} from "./frontendServiceState.ts";

// The queued-ready project after a revision stating `dependencies` (for
// example `twoDependencies(...)`); a case may describe later revisions after it.
export const dependenciesRepository = (dependencies: RevisionFacts) =>
  queuedReadyRepository().withRevision("dependencies", dependencies);

// The SHAs of that project's revisions: its dependency revision is the
// substitute's revision.
export const dependenciesRevisions = (services: FrontendServiceState) => ({
  base: "b0".repeat(20),
  dependencies: services.revision,
});

// Publishes the queued-ready project after a revision stating `dependencies`
// at the substitute's revision.
export function putFrontendDependencies(
  services: FrontendServiceState,
  dependencies: RevisionFacts,
): void {
  const published = describedRevisions(
    dependenciesRepository(dependencies).please(),
    dependenciesRevisions(services),
  );
  putFrontendPublished(services, backlogApart(published.dependencies));
}
