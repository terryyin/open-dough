// A read request the local authenticated read boundary
// (`./authenticatedRead.ts`) refuses for its parameters alone, before any
// `gh` call: every parse of what a request asks for (`./requestedRead.ts`,
// `./listedRecordsRead.ts`, `./containmentRead.ts`) answers it the same way.

import { commitShaPattern } from "../src/authenticatedReadRules.ts";

export type RefusedParameters = {
  readonly kind: "refused";
  readonly status: 400;
  readonly message: string;
};

export function refused(message: string): RefusedParameters {
  return { kind: "refused", status: 400, message };
}

// A revision a read is pinned to must already be a resolved commit.
export function isPinnedRevision(revision: string | null): revision is string {
  return revision !== null && commitShaPattern.test(revision);
}

export const unpinnedRevision = refused(
  "The pinned revision is not a commit sha.",
);
