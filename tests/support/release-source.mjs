// @ts-check
// Shell fixture entry point: build a release source checkout at <dest>.
//   node release-source.mjs <dest> [<shared release source name>]
// Without a name, read the release-source facts as JSON from stdin. The
// source is one local checkout without an origin; installers read it by path.
import { copyFileSync, mkdirSync, readFileSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { makeMe } from "./makeMe.mjs";
import { materializeRepository } from "./repository-fixture.mjs";
import { openDoughSource } from "./repository-revision-files.mjs";
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

/** The installer's managed payload declaration, as install.sh lists it. */
function declaredPayload() {
  const installer = readFileSync(join(openDoughSource, "install.sh"), "utf8");
  const declaration = /^managed_files=\(\n([\s\S]*?)^\)/m.exec(installer);
  if (!declaration) throw new Error("install.sh declares no managed_files");
  return /** @type {string} */ (declaration[1]).split(/\s+/).filter(Boolean);
}

/**
 * The harness layer every revision starts from: the working tree's installer,
 * its modules, and its declared payload.
 * @param {string} dest
 */
function copyPayloadLayer(dest) {
  /** @param {string} path */
  const copy = (path) => {
    mkdirSync(dirname(join(dest, path)), { recursive: true });
    copyFileSync(join(openDoughSource, path), join(dest, path));
  };
  copy("install.sh");
  for (const module of readdirSync(join(openDoughSource, "src/install")))
    if (/\.(sh|mjs)$/.test(module)) copy(`src/install/${module}`);
  for (const path of declaredPayload()) copy(`src/skills/${path}`);
}

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
copyPayloadLayer(dest);
await materializeRepository(describeReleaseSource(facts), {
  at: dest,
  withoutOrigin: true,
});
