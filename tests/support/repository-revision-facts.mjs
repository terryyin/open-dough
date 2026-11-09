// @ts-check
// Validation and presence rules for the facts one declared revision carries.
/** @typedef {import("./repositoryTestData.mjs").RepositoryRevision} RepositoryRevision */
/** @typedef {import("./repositoryTestData.mjs").RevisionFacts} RevisionFacts */

// Where a revision's backlog lives, whether stated as membership or bytes.
export const backlogPath = ".planning/PRODUCT-BACKLOG.md";

/** @param {RepositoryRevision} revision */
function statesBacklogBytes(revision) {
  return (
    revision.files !== undefined && Object.hasOwn(revision.files, backlogPath)
  );
}

/** @param {RepositoryRevision} revision */
export function assertOneBacklogFact(revision) {
  if (Object.hasOwn(revision, "backlog") && revision.backlog === undefined)
    throw new Error(
      `Repository revision ${revision.name} states an undefined backlog; state backlog: null for a revision without a backlog`,
    );
  if (revision.backlog && statesBacklogBytes(revision))
    throw new Error(
      `Repository revision ${revision.name} states its backlog twice: as backlog and as files["${backlogPath}"]`,
    );
}

/** @param {string} name @param {RevisionFacts} facts @param {readonly RepositoryRevision[]} known */
export function assertKnownParents(name, facts, known) {
  if (facts.parents === undefined) return;
  if (facts.parents.length === 0)
    throw new Error(
      `Repository revision ${name} must name at least one parent`,
    );
  for (const parent of facts.parents)
    if (!known.some((revision) => revision.name === parent))
      throw new Error(
        `Repository revision ${name} names unknown parent ${parent}`,
      );
  if (new Set(facts.parents).size !== facts.parents.length)
    throw new Error(`Repository revision ${name} repeats a parent`);
}

/** @param {RepositoryRevision} revision */
export function statesBacklog(revision) {
  return Object.hasOwn(revision, "backlog") || statesBacklogBytes(revision);
}
