// The Take a source-freshness comparison starts from, for
// `source-freshness.mjs`.
//
// Fetches the authorized remote and takes merge-base(<fetched trunk>, HEAD)
// as the base (the Take: Story Branch increments never reach trunk). The
// Taken entry on fetched trunk carries the story's link and plan link; the
// identity must also be Taken at the base. Reads Git only and writes nothing
// beyond the fetch.
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

// The revision HEAD shares with fetched trunk: the candidate for the Take.
async function sharedBase(repository, trunkRevision, trackingRef) {
  try {
    return (
      await git(repository, "merge-base", trunkRevision, "HEAD")
    ).stdout.trim();
  } catch {
    throw new FreshnessRefusal(
      "no-common-base",
      `HEAD shares no history with ${trackingRef}`,
    );
  }
}

// `candidate` as the base when `identity` is Taken there; otherwise refused.
async function takenBase(repository, candidate, identity) {
  if (!(await takenEntry(repository, candidate, identity)))
    throw new FreshnessRefusal(
      "not-taken-at-base",
      `${identity} is not Taken in the backlog at the branch's base ${candidate}`,
    );
  return candidate;
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
  const candidate = await sharedBase(repository, trunkRevision, trackingRef);
  const entry = await takenEntry(repository, trunkRevision, identity);
  if (!entry)
    throw new FreshnessRefusal(
      "not-taken",
      `${identity} is not Taken in the backlog on fetched ${trackingRef}`,
    );
  const base = await takenBase(repository, candidate, identity);
  return { trunkRevision, base, entry };
}
