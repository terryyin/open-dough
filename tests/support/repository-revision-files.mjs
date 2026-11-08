// @ts-check
import {
  chmodSync,
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  rmdirSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { dirname, join, posix } from "node:path";
import {
  agentIdentity,
  renderAgentProfile,
} from "../../src/skills/dough-product-backlog/scripts/product-backlog-agent-profile.mjs";
import {
  doneRecordPath,
  isDoneRecordFileName,
  renderDoneRecord,
} from "../../src/skills/dough-product-backlog/scripts/product-backlog-done-record.mjs";
import { splitHref } from "../../src/skills/dough-product-backlog/scripts/product-backlog-identity.mjs";
import { recordStoryState } from "../../src/skills/dough-product-backlog/scripts/product-backlog-story-state.mjs";
import { renderPublishedBacklog } from "./published-backlog.mjs";
import { backlogPath } from "./repositoryTestData.mjs";
import {
  catalogFile,
  doneDirectory,
  doneCatalogOf,
} from "./revision-done-catalog.mjs";

/** @typedef {import("./repositoryTestData.mjs").RevisionFacts} RevisionFacts */
/** @typedef {import("./repositoryTestData.mjs").StoryState} StoryState */
/**
 * A checkout's files by repository-relative path, as a revision publishes them.
 * @typedef {Readonly<Record<string, string | Buffer>>} RevisionFiles
 */

const planning = ".planning";

/** @param {string} path */
function fixturePath(path) {
  const normalized = posix.normalize(path.replaceAll("\\", "/"));
  if (
    posix.isAbsolute(normalized) ||
    normalized === "." ||
    normalized === ".." ||
    normalized.startsWith("../")
  )
    throw new Error(`Repository fixture path leaves its checkout: ${path}`);
  return normalized.replace(/\/$/, "");
}

/** @param {RevisionFiles} files @param {string} path */
function readText(files, path) {
  const content = files[path];
  if (content === undefined)
    throw new Error(`Repository fixture has no file ${path}`);
  return content.toString();
}

// The seed path `state` records and its source after recording.
/** @param {RevisionFiles} files @param {StoryState} state */
function renderStoryState(files, state) {
  const file = fixturePath(posix.join(planning, splitHref(state.href).path));
  const source = readText(files, file);
  const { assessment, reasons, ...preparation } = state;
  const planFile = state.plan
    ? fixturePath(posix.join(posix.dirname(file), splitHref(state.plan).path))
    : undefined;
  const options = {
    planSource:
      planFile !== undefined && planFile !== file
        ? readText(files, planFile)
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
  return { path: file, source: final.source };
}

/**
 * The files a checkout holds after `revision`, starting from `start`: its
 * removals, backlog, files, story states, agent profiles and done records,
 * and the done catalog rebuilt from the records, each written by the
 * encoder the product uses. Pure: nothing is read from or written to disk.
 * @param {RevisionFiles} start
 * @param {RevisionFacts} revision
 * @returns {Record<string, string | Buffer>}
 */
export function renderRevisionFiles(start, revision) {
  const {
    backlog,
    files: declared = {},
    storyStates = [],
    agentProfiles = [],
    doneRecords,
    remove = [],
  } = revision;
  /** @type {Record<string, string | Buffer>} */
  const files = { ...start };

  for (const path of remove.map(fixturePath))
    for (const existing of Object.keys(files))
      if (existing === path || existing.startsWith(`${path}/`))
        delete files[existing];
  if (backlog) files[backlogPath] = renderPublishedBacklog(backlog);
  for (const [path, content] of Object.entries(declared))
    files[fixturePath(path)] = content;
  for (const state of storyStates) {
    const { path, source } = renderStoryState(files, state);
    files[path] = source;
  }
  for (const profile of agentProfiles)
    files[`${planning}/${agentIdentity(profile.name).path}`] =
      renderAgentProfile(profile);
  for (const record of doneRecords ?? [])
    files[`${planning}/${doneRecordPath(record.identity)}`] =
      renderDoneRecord(record);

  // A revision can supply or remove an exact catalog itself for reader cases.
  const removedRecord = remove.some(
    (path) =>
      path.startsWith(doneDirectory) &&
      isDoneRecordFileName(path.slice(doneDirectory.length)),
  );
  if (
    (doneRecords !== undefined || removedRecord) &&
    !Object.hasOwn(declared, catalogFile) &&
    !remove.includes(catalogFile)
  ) {
    const catalog = doneCatalogOf(files);
    if (catalog === undefined) delete files[catalogFile];
    else files[catalogFile] = catalog;
  }
  return files;
}

/**
 * The files each named trunk revision of `description` publishes: the first
 * starts from no files, and each later one from the files before it.
 * @template {string} Name
 * @param {import("./repositoryTestData.mjs").RepositoryDescription<Name>} description
 * @returns {Record<Name, Record<string, string | Buffer>>}
 */
export function renderPublishedRevisions({ revisions }) {
  /** @type {Record<string, Record<string, string | Buffer>>} */
  const published = {};
  /** @type {RevisionFiles} */
  let files = {};
  for (const revision of revisions) {
    files = renderRevisionFiles(files, revision);
    published[revision.name] = files;
  }
  return /** @type {Record<Name, Record<string, string | Buffer>>} */ (
    published
  );
}

// Every file in the checkout at `root`, by repository-relative path, outside
// Git's own metadata.
/** @param {string} root @param {string} [directory] @returns {Record<string, Buffer>} */
function checkoutFiles(root, directory = "") {
  /** @type {Record<string, Buffer>} */
  const files = {};
  for (const entry of readdirSync(join(root, directory), {
    withFileTypes: true,
  })) {
    if (directory === "" && entry.name === ".git") continue;
    const path = directory === "" ? entry.name : `${directory}/${entry.name}`;
    if (entry.isDirectory()) Object.assign(files, checkoutFiles(root, path));
    else files[path] = readFileSync(join(root, path));
  }
  return files;
}

/** @param {string | Buffer} a @param {string | Buffer} b */
const sameBytes = (a, b) =>
  Buffer.compare(
    Buffer.isBuffer(a) ? a : Buffer.from(a),
    Buffer.isBuffer(b) ? b : Buffer.from(b),
  ) === 0;

/**
 * Writes `revision` into the checkout at `integration` through the same
 * renderer that serves it without Git.
 * @param {string} integration
 * @param {RevisionFacts} revision
 */
export function writeRevisionFiles(integration, revision) {
  // A checkout not created yet starts from no files, as a fresh clone would.
  const start = existsSync(integration) ? checkoutFiles(integration) : {};
  const after = renderRevisionFiles(start, revision);
  for (const path of Object.keys(start)) {
    if (Object.hasOwn(after, path)) continue;
    rmSync(join(integration, path), { force: true });
    // Git publishes no empty directory; leave none behind either.
    for (let parent = dirname(path); parent !== "."; parent = dirname(parent)) {
      try {
        rmdirSync(join(integration, parent));
      } catch {
        break;
      }
    }
  }
  for (const [path, content] of Object.entries(after)) {
    const before = start[path];
    if (before !== undefined && sameBytes(before, content)) continue;
    mkdirSync(dirname(join(integration, path)), { recursive: true });
    writeFileSync(join(integration, path), content);
  }
  // Paths the revision commits with the executable mode.
  for (const path of revision.executables ?? [])
    chmodSync(join(integration, fixturePath(path)), 0o755);
}
