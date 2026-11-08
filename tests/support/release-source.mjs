// @ts-check
// Shell fixture entry point: build a release source checkout at <dest>.
//   node release-source.mjs <dest> [<shared release source name>]
// Without a name, read the release-source facts as JSON from stdin. The
// source is one local checkout without an origin; installers read it by path.
// Each release revision ships the working tree's payload with its deltas.
import { readFileSync } from "node:fs";
import { makeMe } from "./makeMe.mjs";
import { materializeRepository } from "./repository-fixture.mjs";
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

const [dest, shared] = process.argv.slice(2);
if (!dest || process.argv.length > 4) {
  console.error("Usage: release-source.mjs <dest> [<shared release source>]");
  process.exit(2);
}
const facts =
  shared === undefined
    ? JSON.parse(readFileSync(0, "utf8"))
    : releaseSources[shared];
if (!facts) {
  console.error(`No shared release source named ${shared}`);
  process.exit(2);
}
await materializeRepository(describeReleaseSource(facts), {
  at: dest,
  withoutOrigin: true,
});
