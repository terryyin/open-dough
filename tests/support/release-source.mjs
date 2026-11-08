// @ts-check
// Shell fixture entry point: build a release source checkout at <dest>.
//   node release-source.mjs <dest> [<shared release source name>]
//   node release-source.mjs --add <source>
// Without a name, read the release-source facts as JSON from stdin. The
// source is one local checkout without an origin; installers read it by path.
// Each release revision ships the working tree's payload with its deltas.
// With --add, commit and tag the stated revisions on an existing source, for a
// release that appears after the check has read the source.
import { readFileSync } from "node:fs";
import { makeMe } from "./makeMe.mjs";
import {
  commitDeclaredRevision,
  materializeLocalCheckout,
} from "./repository-fixture.mjs";
import { tagRevision } from "./repository-history.mjs";
import { releaseSources } from "./release-sources.mjs";

/** @typedef {import("./repositoryTestData.mjs").RevisionFacts} RevisionFacts */
/**
 * @typedef {{
 *   revisions: readonly (Omit<RevisionFacts, "release"> & {
 *     name: string,
 *     release?: import("./releaseTestData.mjs").ReleaseFacts,
 *   })[],
 * }} ReleaseSourceFacts
 */

/**
 * A release source states no product backlog unless a revision says otherwise.
 * @param {ReleaseSourceFacts} facts
 */
function describeReleaseSource({ revisions }) {
  /** @type {import("./repositoryTestData.mjs").RepositoryBuilder<string>} */
  let source = makeMe.aRepository;
  for (const { name, release, ...facts } of revisions)
    source = source.withRevision(name, {
      backlog: null,
      ...facts,
      ...(release && { release: makeMe.aRelease.with(release).please() }),
    });
  return source.please();
}

const usage =
  "Usage: release-source.mjs <dest> [<shared release source>] | --add <source>";
const [first, second] = process.argv.slice(2);
if (!first || process.argv.length > 4 || (first === "--add" && !second)) {
  console.error(usage);
  process.exit(2);
}
if (first === "--add") {
  /** @type {ReleaseSourceFacts} */
  const facts = JSON.parse(readFileSync(0, "utf8"));
  for (const revision of describeReleaseSource(facts).revisions) {
    await commitDeclaredRevision(second, revision);
    await tagRevision(second, revision);
  }
} else {
  const facts =
    second === undefined
      ? JSON.parse(readFileSync(0, "utf8"))
      : releaseSources[second];
  if (!facts) {
    console.error(`No shared release source named ${second}`);
    process.exit(2);
  }
  // The shell check that asked for the source owns and removes <dest>.
  await materializeLocalCheckout(undefined, describeReleaseSource(facts), {
    at: first,
  });
}
