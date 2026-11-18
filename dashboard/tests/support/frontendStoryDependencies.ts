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

// Publishes the queued-ready project after a revision stating `dependencies`
// (for example `twoDependencies(...)`) at the substitute's revision.
export function putFrontendDependencies(
  services: FrontendServiceState,
  dependencies: RevisionFacts,
): void {
  const published = describedRevisions(
    queuedReadyRepository().withRevision("dependencies", dependencies).please(),
    { base: "b0".repeat(20), dependencies: services.revision },
  );
  putFrontendPublished(services, backlogApart(published.dependencies));
}
