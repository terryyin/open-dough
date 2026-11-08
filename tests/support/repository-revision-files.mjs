// @ts-check
import {
  chmodSync,
  copyFileSync,
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { dirname, join, relative, resolve, sep } from "node:path";
import {
  agentIdentity,
  renderAgentProfile,
} from "../../src/skills/dough-product-backlog/scripts/product-backlog-agent-profile.mjs";
import { rebuildDoneCatalog } from "../../src/skills/dough-product-backlog/scripts/product-backlog-complete.mjs";
import { doneCatalogPath } from "../../src/skills/dough-product-backlog/scripts/product-backlog-done-catalog.mjs";
import {
  doneRecordPath,
  isDoneRecordFileName,
  renderDoneRecord,
} from "../../src/skills/dough-product-backlog/scripts/product-backlog-done-record.mjs";
import { splitHref } from "../../src/skills/dough-product-backlog/scripts/product-backlog-identity.mjs";
import { recordStoryState } from "../../src/skills/dough-product-backlog/scripts/product-backlog-story-state.mjs";
import { renderPublishedBacklog } from "./published-backlog.mjs";
import {
  openDoughSource,
  releaseInstaller,
  shippedPayload,
} from "./releaseTestData.mjs";
import { backlogPath } from "./repositoryTestData.mjs";

/** @typedef {import("./repositoryTestData.mjs").RevisionFacts} RevisionFacts */
/** @typedef {import("./repositoryTestData.mjs").StoryState} StoryState */
/** @typedef {import("./releaseTestData.mjs").Release} Release */

const markedSkill = "src/skills/dough-update/SKILL.md";

/** @param {string} root @param {string} path */
function fixturePath(root, path) {
  const target = resolve(root, path);
  const fromRoot = relative(root, target);
  if (!fromRoot || fromRoot === ".." || fromRoot.startsWith(`..${sep}`))
    throw new Error(`Repository fixture path leaves its checkout: ${path}`);
  return target;
}

/** @param {string} file @param {string | Buffer} content */
function writeFixtureFile(file, content) {
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, content);
}

/** @param {string} planning @param {StoryState} state */
function writeStoryState(planning, state) {
  const file = fixturePath(planning, splitHref(state.href).path);
  const source = readFileSync(file, "utf8");
  const { assessment, reasons, ...preparation } = state;
  const planFile = state.plan
    ? resolve(dirname(file), splitHref(state.plan).path)
    : undefined;
  const options = {
    planSource:
      planFile !== undefined && planFile !== file
        ? readFileSync(planFile, "utf8")
        : undefined,
    planIsCanonical: planFile === file,
  };
  // The recorded preparation reports the current scoped basis. Use that
  // basis for an assessment of these same seed and plan bytes.
  const recorded = recordStoryState(source, preparation, options);
  const final =
    assessment === undefined
      ? recorded
      : recordStoryState(
          recorded.source,
          {
            ...preparation,
            assessment,
            reasons,
            expectedBasis: recorded.state.basis,
          },
          options,
        );
  writeFileSync(file, final.source);
}

/**
 * A release ships the working tree's installer, its modules, the declared
 * payload it does not remove, and the payload it adds. Paths the checkout
 * lacks are copied, so a first release copies the payload once and a later
 * release restores what an earlier one removed. It writes its installer, its
 * `VERSION`, its one changelog entry, and the dough-update skill with the
 * release's payload marker appended.
 * @param {string} checkout
 * @param {Release} release
 */
function writeRelease(checkout, release) {
  const { version, marker, removed, added } = release;
  const shipped = [
    ...readdirSync(join(openDoughSource, "src/install"))
      .filter((module) => /\.(sh|mjs)$/.test(module))
      .map((module) => `src/install/${module}`),
    ...shippedPayload(release).map((path) => `src/skills/${path}`),
  ];
  for (const path of shipped) {
    const target = join(checkout, path);
    if (existsSync(target)) continue;
    mkdirSync(dirname(target), { recursive: true });
    copyFileSync(join(openDoughSource, path), target);
  }
  for (const path of removed)
    rmSync(fixturePath(checkout, `src/skills/${path}`), {
      recursive: true,
      force: true,
    });
  for (const [path, content] of Object.entries(added))
    writeFixtureFile(fixturePath(checkout, `src/skills/${path}`), content);
  writeFixtureFile(join(checkout, "install.sh"), releaseInstaller(release));
  writeFixtureFile(join(checkout, "VERSION"), `${version}\n`);
  writeFixtureFile(
    join(checkout, "CHANGELOG.md"),
    `## ${version} - 2026-09-06\n\n${marker}\n`,
  );
  writeFixtureFile(
    join(checkout, markedSkill),
    `${readFileSync(join(openDoughSource, markedSkill), "utf8")}\n<!-- open-dough-payload ${marker} -->\n`,
  );
}

/** @param {string} integration @param {RevisionFacts} revision */
export function writeRevisionFiles(integration, revision) {
  const planning = join(integration, ".planning");
  const {
    backlog,
    release,
    files = {},
    executables = [],
    storyStates = [],
    agentProfiles = [],
    doneRecords,
    remove = [],
  } = revision;

  for (const path of remove)
    rmSync(fixturePath(integration, path), { recursive: true, force: true });
  if (release) writeRelease(integration, release);
  if (backlog)
    writeFixtureFile(
      fixturePath(integration, backlogPath),
      renderPublishedBacklog(backlog),
    );
  for (const [path, content] of Object.entries(files))
    writeFixtureFile(fixturePath(integration, path), content);
  // Paths the revision commits with the executable mode.
  for (const path of executables)
    chmodSync(fixturePath(integration, path), 0o755);
  for (const state of storyStates) writeStoryState(planning, state);
  for (const profile of agentProfiles)
    writeFixtureFile(
      join(planning, agentIdentity(profile.name).path),
      renderAgentProfile(profile),
    );
  for (const record of doneRecords ?? [])
    writeFixtureFile(
      join(planning, doneRecordPath(record.identity)),
      renderDoneRecord(record),
    );

  // A revision can supply or remove an exact catalog itself for reader cases.
  const catalogFile = `.planning/${doneCatalogPath}`;
  const removedRecord = remove.some(
    (path) =>
      path.startsWith(".planning/done/") &&
      isDoneRecordFileName(path.slice(".planning/done/".length)),
  );
  if (
    (doneRecords !== undefined || removedRecord) &&
    !Object.hasOwn(files, catalogFile) &&
    !remove.includes(catalogFile)
  )
    rebuildDoneCatalog(planning);
}
