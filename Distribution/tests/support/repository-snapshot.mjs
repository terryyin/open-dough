// @ts-check
// A run owner builds a shared leading history once as a snapshot; every
// process of the run registers that history as a prepared prefix and the
// repository harness (repository-fixture.mjs) copies the snapshot instead of
// rebuilding those revisions.
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { buildRepository, layout } from "./repository-history.mjs";
import { integrationDeveloper } from "./repository-revision-commit.mjs";

/** @typedef {import("./repositoryTestData.mjs").RepositoryDescription} RepositoryDescription */
/** @typedef {import("./repository-history.mjs").Snapshot} Snapshot */
/** @typedef {import("./repository-fixture.mjs").TemplateShape} TemplateShape */

/**
 * A described history another process built once with
 * `prepareRepositorySnapshot`, borrowed as the immutable base of every
 * description that starts with the same repository facts and revisions. Such
 * a description is materialized from an independent copy of the snapshot
 * `locate` names plus its remaining revisions; when `locate` names none, it
 * is built from scratch as usual.
 * @typedef {{
 *   description: RepositoryDescription,
 *   locate: () => Promise<string | undefined>,
 * }} PreparedPrefix
 */

/** @type {Set<PreparedPrefix>} */
const preparedPrefixes = new Set();

/**
 * Offer `prefix` to every later `materializeRepository` of this process.
 * Returns its withdrawal.
 * @param {PreparedPrefix} prefix
 */
export function registerPreparedPrefix(prefix) {
  preparedPrefixes.add(prefix);
  return () => {
    preparedPrefixes.delete(prefix);
  };
}

// The named commits a snapshot holds, recorded beside its repositories once
// the whole snapshot is built; a snapshot without it is incomplete.
const snapshotFactsFile = "snapshot.json";

/**
 * The shape every snapshot is built in: the one `materializeRepository`
 * materializes, with a bare origin and Git's templates.
 * @type {TemplateShape}
 */
const snapshotShape = { origin: true, gitTemplates: true };

/**
 * @typedef {{
 *   description: RepositoryDescription,
 *   shape: TemplateShape,
 *   revisions: Record<string, string>,
 *   trunkSha: string,
 * }} SnapshotFacts
 */

/**
 * The facts every revision of a description is committed under.
 * @param {RepositoryDescription} description
 */
function repositoryFacts({
  trunkBranch = "main",
  checkoutIdentity = integrationDeveloper,
}) {
  return JSON.stringify({ trunkBranch, checkoutIdentity });
}

/**
 * The shape a history is built in, as one comparable key.
 * @param {TemplateShape} shape
 */
function shapeKey({ origin, gitTemplates, layer }) {
  return JSON.stringify({ origin, gitTemplates, layer });
}

/**
 * The registered prefix `description` starts with.
 * @param {RepositoryDescription} description
 */
function matchingPrefix(description) {
  for (const prefix of preparedPrefixes) {
    const { revisions } = prefix.description;
    if (
      repositoryFacts(prefix.description) === repositoryFacts(description) &&
      JSON.stringify(description.revisions.slice(0, revisions.length)) ===
        JSON.stringify(revisions)
    )
      return prefix;
  }
  return undefined;
}

/**
 * The snapshot a description built in `shape` is copied from: the one its
 * matching prefix's owner supplies, checked to be complete and to hold that
 * prefix in that shape. A shape no snapshot is built in asks no owner.
 * @param {RepositoryDescription} description
 * @param {TemplateShape} shape
 * @returns {Promise<Snapshot | undefined>}
 */
export async function locateSnapshot(description, shape) {
  if (shapeKey(shape) !== shapeKey(snapshotShape)) return undefined;
  const prefix = matchingPrefix(description);
  if (!prefix) return undefined;
  const directory = await prefix.locate();
  if (directory === undefined) return undefined;
  const factsFile = join(directory, snapshotFactsFile);
  if (!existsSync(factsFile))
    throw new Error(
      `Repository snapshot ${directory} is incomplete: ${snapshotFactsFile} is missing`,
    );
  /** @type {SnapshotFacts} */
  const held = JSON.parse(readFileSync(factsFile, "utf8"));
  if (
    JSON.stringify(held.description) !== JSON.stringify(prefix.description) ||
    shapeKey(held.shape) !== shapeKey(shape)
  )
    throw new Error(
      `Repository snapshot ${directory} holds another history than the registered prefix describes`,
    );
  return { directory, revisions: held.revisions, trunkSha: held.trunkSha };
}

/**
 * Build `description` from scratch into the existing empty `directory` as a
 * snapshot other processes materialize matching descriptions from. A snapshot
 * holds published revisions only; a workspace belongs to the materialized
 * repository.
 * @param {string} directory
 * @param {RepositoryDescription} description
 */
export async function prepareRepositorySnapshot(directory, description) {
  if (description.workspace)
    throw new Error(
      `A repository snapshot holds published revisions only; workspace ${description.workspace.branch} belongs to the materialized repository`,
    );
  const { gitTemplates } = snapshotShape;
  const { revisions, trunkSha } = await buildRepository(
    layout(directory),
    description,
    { gitTemplates },
  );
  /** @type {SnapshotFacts} */
  const facts = { description, shape: snapshotShape, revisions, trunkSha };
  writeFileSync(join(directory, snapshotFactsFile), JSON.stringify(facts));
}
