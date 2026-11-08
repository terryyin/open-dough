// @ts-check
import {
  cpSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  realpathSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, relative, resolve, sep } from "node:path";
import { createBareFixtureRemote } from "../../src/skills/dough-execute-plan/scripts/bare-remote-test-fixtures.mjs";
import { fixtureTeardown } from "../../src/skills/dough-execute-plan/scripts/fixture-teardown-test-fixtures.mjs";
import {
  exec,
  git,
  revParse,
} from "../../src/skills/dough-execute-plan/scripts/publication-git.mjs";
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

/** @typedef {import("./repositoryTestData.mjs").RepositoryDescription} RepositoryDescription */
/** @typedef {import("./repositoryTestData.mjs").RepositoryRevision} RepositoryRevision */
/** @typedef {import("./repositoryTestData.mjs").StoryState} StoryState */

/** @type {import("./repositoryTestData.mjs").GitPerson} */
export const integrationDeveloper = {
  name: "Integration Checkout",
  email: "integration@example.test",
};

/** @param {string} fixture */
const layout = (fixture) => ({
  origin: join(fixture, "remote.git"),
  integration: join(fixture, "integration"),
});

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

/** @param {string} integration @param {RepositoryRevision} revision */
function writeRevision(integration, revision) {
  const planning = join(integration, ".planning");
  const {
    backlog,
    files = {},
    storyStates = [],
    agentProfiles = [],
    doneRecords,
    remove = [],
  } = revision;

  for (const path of remove)
    rmSync(fixturePath(integration, path), { recursive: true, force: true });
  if (backlog !== undefined)
    writeFixtureFile(
      join(planning, "PRODUCT-BACKLOG.md"),
      renderPublishedBacklog(backlog),
    );
  for (const [path, content] of Object.entries(files))
    writeFixtureFile(fixturePath(integration, path), content);
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

/** @param {string} integration @param {RepositoryRevision} revision */
async function commitRevision(integration, revision) {
  const {
    name,
    message = name,
    committer = integrationDeveloper,
    author = committer,
  } = revision;
  const env = {
    ...process.env,
    GIT_AUTHOR_NAME: author.name,
    GIT_AUTHOR_EMAIL: author.email,
    GIT_COMMITTER_NAME: committer.name,
    GIT_COMMITTER_EMAIL: committer.email,
    ...("date" in author && { GIT_AUTHOR_DATE: author.date }),
    ...("date" in committer && { GIT_COMMITTER_DATE: committer.date }),
  };
  await git(integration, "add", "--all");
  await exec("git", ["commit", "--allow-empty", "--quiet", "-m", message], {
    cwd: integration,
    env,
  });
}

/** @param {string} fixture @param {RepositoryDescription} description */
async function buildTemplate(fixture, { revisions }) {
  const { origin, integration } = layout(fixture);
  await createBareFixtureRemote(origin);
  await exec("git", ["init", "-b", "main", integration]);
  await git(integration, "config", "maintenance.auto", "false");
  await git(integration, "config", "user.name", integrationDeveloper.name);
  await git(integration, "config", "user.email", integrationDeveloper.email);
  await git(integration, "remote", "add", "origin", origin);

  const commits = new Map();
  let trunkSha = "";
  for (const revision of revisions) {
    writeRevision(integration, revision);
    await commitRevision(integration, revision);
    await git(integration, "push", "--quiet", "origin", "main");
    trunkSha = await revParse(integration, "HEAD");
    commits.set(revision.name, trunkSha);
  }
  return { revisions: Object.fromEntries(commits), trunkSha };
}

/** @typedef {Awaited<ReturnType<typeof buildTemplate>>} BuiltTemplate */
/** @type {Map<string, { root: string, built: Promise<BuiltTemplate> }>} */
const templates = new Map();
process.once("exit", () => {
  for (const { root } of templates.values())
    rmSync(root, { recursive: true, force: true });
});

/** @param {import("./repositoryTestData.mjs").RepositoryDescription} description */
function repositoryTemplate(description) {
  const key = JSON.stringify(description);
  const existing = templates.get(key);
  if (existing) return existing;
  const root = realpathSync(
    mkdtempSync(join(tmpdir(), "repository-template-")),
  );
  const built = buildTemplate(root, description).catch((error) => {
    rmSync(root, { recursive: true, force: true });
    templates.delete(key);
    throw error;
  });
  const template = { root, built };
  templates.set(key, template);
  return template;
}

/**
 * Build each described history once per process. Every caller gets its own
 * mutable bare origin and integration checkout.
 * @template {string} Name
 * @param {import("./repositoryTestData.mjs").RepositoryDescription<Name>} description
 * @param {{ parent?: string }} [options]
 */
export async function materializeRepository(
  description,
  { parent = tmpdir() } = {},
) {
  const { root, built } = repositoryTemplate(description);
  const { revisions, trunkSha } = await built;
  const fixture = realpathSync(mkdtempSync(join(parent, "workspace-claim-")));
  const checkout = layout(fixture);
  const { cleanup, defer } = fixtureTeardown(fixture);
  try {
    cpSync(root, fixture, { recursive: true });
    await git(
      checkout.integration,
      "remote",
      "set-url",
      "origin",
      checkout.origin,
    );
    return {
      ...checkout,
      fixture,
      trunkSha,
      revisions: /** @type {Record<Name, string>} */ ({ ...revisions }),
      cleanup,
      defer,
    };
  } catch (error) {
    await cleanup();
    throw error;
  }
}
