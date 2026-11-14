// A profile addition read for the local authenticated read boundary
// (`./requestedRead.ts`, `./avatarRead.ts`): which commit added an agent
// profile's current allocation as of a pinned revision.

import { profileAgentName } from "../../Distribution/src/skills/dough-product-backlog/scripts/product-backlog-agent-profile.mjs";
import { parseSafeRepositoryPath } from "./reachablePaths.ts";
import {
  isPinnedRevision,
  refused,
  unpinnedRevision,
  type RefusedParameters,
} from "./refusedParameters.ts";

export type AdditionRead = {
  readonly kind: "addition-at";
  readonly revision: string;
  readonly path: string;
};

// Which commit added an agent profile, asked only on trunk at a pinned
// revision and only for a path the shared profile module names as a profile;
// whether that profile is listed at the revision is the performed read's to
// decide. An avatar read (`./avatarRead.ts`) names its profile the same way.
export function parseAdditionRead(
  revision: string | null,
  path: string | null,
): AdditionRead | RefusedParameters {
  if (!isPinnedRevision(revision)) {
    return unpinnedRevision;
  }
  const repositoryPath = parseSafeRepositoryPath(path);
  const file = repositoryPath?.split("/").pop();
  if (
    repositoryPath === undefined ||
    file === undefined ||
    profileAgentName(file) === undefined
  ) {
    return refused("An addition read names only an agent profile path.");
  }
  return { kind: "addition-at", revision, path: repositoryPath };
}
