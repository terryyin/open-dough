// @ts-check
import { cpSync, mkdtempSync, realpathSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createBareFixtureRemote } from "../../src/skills/dough-execute-plan/scripts/bare-remote-test-fixtures.mjs";
import { fixtureTeardown } from "../../src/skills/dough-execute-plan/scripts/fixture-teardown-test-fixtures.mjs";
import {
  exec,
  git,
  revParse,
} from "../../src/skills/dough-execute-plan/scripts/publication-git.mjs";
import { writeRevisionFiles } from "./repository-revision-files.mjs";

/** @typedef {import("./repositoryTestData.mjs").RepositoryDescription} RepositoryDescription */
/** @typedef {import("./repositoryTestData.mjs").RepositoryRevision} RepositoryRevision */
/** @typedef {import("./repositoryTestData.mjs").GitPerson} GitPerson */

/** @type {GitPerson} */
export const integrationDeveloper = {
  name: "Integration Checkout",
  email: "integration@example.test",
};

/** @param {string} fixture */
const layout = (fixture) => ({
  origin: join(fixture, "remote.git"),
  integration: join(fixture, "integration"),
});

/** @param {string} fixture */
const workspacePath = (fixture) => join(fixture, "execution");

/** @param {string} checkout @param {GitPerson} identity */
async function configureIdentity(checkout, identity) {
  await git(checkout, "config", "user.name", identity.name);
  await git(checkout, "config", "user.email", identity.email);
}

/**
 * @param {string} checkout
 * @param {RepositoryRevision} revision
 * @param {GitPerson} checkoutIdentity
 */
async function commitRevision(checkout, revision, checkoutIdentity) {
  const {
    name,
    message = name,
    committer = checkoutIdentity,
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
  await git(checkout, "add", "--all");
  await exec("git", ["commit", "--allow-empty", "--quiet", "-m", message], {
    cwd: checkout,
    env,
  });
  return revParse(checkout, "HEAD");
}

/** @typedef {import("./repository-revision-files.mjs").HarnessLayer} HarnessLayer */

/**
 * How the harness sets the history up, beside what the description states:
 * whether the checkout publishes to a bare origin, whether `git init`
 * copies Git's templates (an init without them has no `info/` or hooks), and
 * the harness layer its first commit also holds. Per-process reuse keys on
 * the whole shape, layer bytes included.
 * @typedef {{ origin: boolean, gitTemplates: boolean, layer?: HarnessLayer | undefined }} TemplateShape
 */

/**
 * @param {string} fixture
 * @param {RepositoryDescription} description
 * @param {TemplateShape} shape
 */
async function buildTemplate(
  fixture,
  {
    revisions,
    trunkBranch = "main",
    checkoutIdentity = integrationDeveloper,
    workspace,
  },
  { origin: published, gitTemplates, layer },
) {
  const { origin, integration } = layout(fixture);
  if (published) await createBareFixtureRemote(origin, trunkBranch);
  await exec("git", [
    "init",
    ...(gitTemplates ? [] : ["--template="]),
    "-b",
    trunkBranch,
    integration,
  ]);
  await git(integration, "config", "maintenance.auto", "false");
  await configureIdentity(integration, checkoutIdentity);
  if (published) await git(integration, "remote", "add", "origin", origin);

  /** @type {Map<string, string>} */
  const commits = new Map();
  let trunkSha = "";
  for (const [index, revision] of revisions.entries()) {
    if (index === 0 && layer) writeRevisionFiles(integration, layer);
    writeRevisionFiles(integration, revision);
    trunkSha = await commitRevision(integration, revision, checkoutIdentity);
    if (published)
      await git(integration, "push", "--quiet", "origin", trunkBranch);
    commits.set(revision.name, trunkSha);
  }
  if (!workspace)
    return {
      revisions: Object.fromEntries(commits),
      trunkSha,
      candidateSha: undefined,
    };

  // The workspace is a worktree of the integration checkout. Its revisions
  // are committed there and never pushed. The builder has checked that it
  // starts from a trunk revision and that every revision name is new.
  const start = /** @type {string} */ (commits.get(workspace.from));
  const execution = workspacePath(fixture);
  await git(integration, "branch", workspace.branch, start);
  await git(integration, "worktree", "add", execution, workspace.branch);
  // Without per-worktree configuration Git keeps this in the configuration the
  // checkouts share, so later commits in either checkout carry it.
  if (workspace.checkoutIdentity)
    await configureIdentity(execution, workspace.checkoutIdentity);
  let candidateSha = start;
  for (const revision of workspace.revisions) {
    writeRevisionFiles(execution, revision);
    candidateSha = await commitRevision(
      execution,
      revision,
      workspace.checkoutIdentity ?? checkoutIdentity,
    );
    commits.set(revision.name, candidateSha);
  }
  return { revisions: Object.fromEntries(commits), trunkSha, candidateSha };
}

/** @typedef {Awaited<ReturnType<typeof buildTemplate>>} BuiltTemplate */
/** @type {Map<string, { root: string, built: Promise<BuiltTemplate> }>} */
const templates = new Map();
process.once("exit", () => {
  for (const { root } of templates.values())
    rmSync(root, { recursive: true, force: true });
});

/** @param {RepositoryDescription} description @param {TemplateShape} shape */
function repositoryTemplate(description, shape) {
  const key = JSON.stringify({ description, shape });
  const existing = templates.get(key);
  if (existing) return existing;
  const root = realpathSync(
    mkdtempSync(join(tmpdir(), "repository-template-")),
  );
  const built = buildTemplate(root, description, shape).catch((error) => {
    rmSync(root, { recursive: true, force: true });
    templates.delete(key);
    throw error;
  });
  const template = { root, built };
  templates.set(key, template);
  return template;
}

/**
 * A private mutable copy of the described history's template.
 * @template {string} Name
 * @param {import("./repositoryTestData.mjs").RepositoryDescription<Name>} description
 * @param {TemplateShape & { parent: string }} options
 */
async function copyTemplate(description, { parent, ...shape }) {
  const { root, built } = repositoryTemplate(description, shape);
  const { revisions, trunkSha, candidateSha } = await built;
  const fixture = realpathSync(mkdtempSync(join(parent, "workspace-claim-")));
  const { origin, integration } = layout(fixture);
  const { cleanup, defer } = fixtureTeardown(fixture);
  try {
    cpSync(root, fixture, { recursive: true });
    /** @type {{ execution?: string, candidateSha?: string }} */
    const workspace =
      candidateSha === undefined
        ? {}
        : { execution: workspacePath(fixture), candidateSha };
    // The copied remote, worktree and its administrative entry still name
    // the template's paths; point them at this copy.
    if (shape.origin)
      await git(integration, "remote", "set-url", "origin", origin);
    if (workspace.execution)
      await git(integration, "worktree", "repair", workspace.execution);
    return {
      ...workspace,
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

/**
 * Build each described history once per process. Every caller gets its own
 * mutable bare origin and integration checkout, and its own execution
 * worktree when the description has a workspace.
 * @template {string} Name
 * @param {import("./repositoryTestData.mjs").RepositoryDescription<Name>} description
 * @param {{ parent?: string }} [options]
 */
export async function materializeRepository(
  description,
  { parent = tmpdir() } = {},
) {
  const shape = { origin: true, gitTemplates: true };
  const copy = await copyTemplate(description, { parent, ...shape });
  return { ...layout(copy.fixture), ...copy };
}

/**
 * The described history in one local checkout on its trunk branch, with no
 * origin, for a case that reads no remote; removed after test `t`. Built once
 * per process like `materializeRepository`, each caller its own mutable copy.
 * `gitTemplates: false` skips Git's templates; `layer` adds harness files.
 * @template {string} Name
 * @param {{ after: (fn: () => Promise<void>) => void }} t
 * @param {import("./repositoryTestData.mjs").RepositoryDescription<Name>} description
 * @param {{ parent?: string, gitTemplates?: boolean, layer?: HarnessLayer }} [options]
 */
export async function materializeLocalCheckout(
  t,
  description,
  { parent = tmpdir(), gitTemplates = true, layer } = {},
) {
  const shape = { origin: false, gitTemplates, layer };
  const copy = await copyTemplate(description, { parent, ...shape });
  t.after(copy.cleanup);
  return { integration: layout(copy.fixture).integration, ...copy };
}
