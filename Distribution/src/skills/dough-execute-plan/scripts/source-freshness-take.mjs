// The Take a source-freshness comparison starts from, for
// `source-freshness.mjs`.
//
// Fetches the authorized remote and takes as the base the best common base of
// fetched trunk and HEAD (`git merge-base --all`) at which the identity is
// Taken (the Take: Story Branch increments never reach trunk, while a merged
// sibling or contributor history can add a second best base without it). The
// Taken entry on fetched trunk carries the story's link and plan link. No
// best base with the Taken entry is refused `not-taken-at-base`, several are
// refused `ambiguous-base`; both name the bases. Reads Git only and writes
// nothing beyond the fetch.
import {
  parseBacklog,
  takenHeading,
} from "../../dough-product-backlog/scripts/product-backlog-document.mjs";
import { show } from "./execution-source.mjs";
import { fetchedTarget, git, originTrackingRef } from "./publication-git.mjs";
import { backlogPath } from "./workspace-publication-ownership.mjs";

export class FreshnessRefusal extends Error {
  constructor(reason, message, fields = {}) {
    super(message);
    this.reason = reason;
    this.fields = fields;
  }
}

// The Taken entry for `identity` in the backlog at `rev`, or undefined.
async function takenEntry(workspace, rev, identity) {
  const backlog = await show(workspace, rev, backlogPath);
  if (backlog === null) return undefined;
  return parseBacklog(backlog).entries.find(
    (item) => item.identity === identity && item.list === takenHeading,
  );
}

// The best common bases of HEAD and fetched trunk: the candidates for the Take.
async function sharedBases(repository, trunkRevision, trackingRef) {
  try {
    return (
      await git(repository, "merge-base", "--all", trunkRevision, "HEAD")
    ).stdout
      .trim()
      .split("\n");
  } catch {
    throw new FreshnessRefusal(
      "no-common-base",
      `HEAD shares no history with ${trackingRef}`,
    );
  }
}

// The one of `candidates` at which `identity` is Taken; none or several are
// refused, naming every base examined or every base that holds the Take.
async function takenBase(repository, candidates, identity) {
  const taken = [];
  for (const candidate of candidates)
    if (await takenEntry(repository, candidate, identity))
      taken.push(candidate);
  if (taken.length === 1) return taken[0];
  if (taken.length > 1)
    throw new FreshnessRefusal(
      "ambiguous-base",
      `${identity} is Taken in the backlog at several of the branch's bases: ${taken.join(", ")}`,
      { bases: taken },
    );
  if (candidates.length === 1)
    throw new FreshnessRefusal(
      "not-taken-at-base",
      `${identity} is not Taken in the backlog at the branch's base ${candidates[0]}`,
    );
  throw new FreshnessRefusal(
    "not-taken-at-base",
    `${identity} is not Taken in the backlog at any of the branch's bases: ${candidates.join(", ")}`,
    { bases: candidates },
  );
}

// The fetched trunk revision, the base the comparison starts from, and the
// Taken entry on fetched trunk.
export async function resolveTake({ repository, identity, remote, targetRef }) {
  const trackingRef = originTrackingRef(targetRef, remote);
  try {
    await git(repository, "fetch", remote);
  } catch (error) {
    throw new FreshnessRefusal("fetch-failed", error.message.trim());
  }
  const trunkRevision = await fetchedTarget(repository, targetRef, remote);
  if (trunkRevision === null)
    throw new FreshnessRefusal("trunk-absent", `${trackingRef} is not fetched`);
  const candidates = await sharedBases(repository, trunkRevision, trackingRef);
  const entry = await takenEntry(repository, trunkRevision, identity);
  if (!entry)
    throw new FreshnessRefusal(
      "not-taken",
      `${identity} is not Taken in the backlog on fetched ${trackingRef}`,
    );
  const base = await takenBase(repository, candidates, identity);
  return { trunkRevision, base, entry };
}
