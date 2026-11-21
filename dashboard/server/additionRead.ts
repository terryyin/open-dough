// A profile addition read for the local authenticated read boundary
// (`./requestedRead.ts`, `./avatarRead.ts`): which commit added an agent
// profile's current allocation as of a pinned revision. The performed read
// (`./performedRead.ts`) answers it here.

import { profileAgentName } from "../../Distribution/src/skills/dough-product-backlog/scripts/product-backlog-agent-profile.mjs";
import type { PublishedSource } from "../src/publishedSource.ts";
import type { PinnedTexts } from "./pinnedTexts.ts";
import { parseSafeRepositoryPath } from "./reachablePaths.ts";
import { answered, unreachable, type Outcome } from "./readOutcome.ts";
import { listedProfileAddition } from "./recordsBesideBacklog.ts";
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

// Which commit added the profile, unreachable when the revision lists no such
// profile. The avatar source stays here: the page asks for the image through
// `./avatarRead.ts`, never from GitHub itself.
export async function performAdditionRead(
  pinned: PinnedTexts,
  source: PublishedSource,
  read: AdditionRead,
  signal: AbortSignal,
): Promise<Outcome> {
  const added = await listedProfileAddition(pinned, source, read, signal);
  if (added === undefined) {
    return unreachable;
  }
  return answered({
    revision: read.revision,
    path: read.path,
    added: added && {
      commit: added.commit,
      committerName: added.committerName,
      committedAt: added.committedAt,
      login: added.login,
    },
  });
}
