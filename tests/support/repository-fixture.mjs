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

/**
 * The committer Git records for later commits in `checkout`. With
 * `worktreeOnly`, it is that worktree's own configuration and the
 * repository's other checkouts keep theirs.
 * @param {string} checkout
 * @param {GitPerson} identity
 * @param {{ worktreeOnly?: boolean }} [options]
 */
async function configureIdentity(
  checkout,
  identity,
  { worktreeOnly = false } = {},
) {
  const scope = worktreeOnly ? ["--worktree"] : [];
  if (worktreeOnly)
    await git(checkout, "config", "extensions.worktreeConfig", "true");
  await git(checkout, "config", ...scope, "user.name", identity.name);
  await git(checkout, "config", ...scope, "user.email", identity.email);
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

/** @param {string} fixture @param {RepositoryDescription} description */
async function buildTemplate(
  fixture,
  {
    revisions,
    trunkBranch = "main",
    checkoutIdentity = integrationDeveloper,
    workspace,
  },
) {
  const { origin, integration } = layout(fixture);
  await createBareFixtureRemote(origin, trunkBranch);
  await exec("git", ["init", "-b", trunkBranch, integration]);
  await git(integration, "config", "maintenance.auto", "false");
  await configureIdentity(integration, checkoutIdentity);
  await git(integration, "remote", "add", "origin", origin);

  /** @type {Map<string, string>} */
  const commits = new Map();
  let trunkSha = "";
  for (const revision of revisions) {
    writeRevisionFiles(integration, revision);
    trunkSha = await commitRevision(integration, revision, checkoutIdentity);
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
  if (workspace.checkoutIdentity)
    await configureIdentity(execution, workspace.checkoutIdentity, {
      worktreeOnly: true,
    });
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
  const { root, built } = repositoryTemplate(description);
  const { revisions, trunkSha, candidateSha } = await built;
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
    /** @type {{ execution?: string, candidateSha?: string }} */
    const workspace =
      candidateSha === undefined
        ? {}
        : { execution: workspacePath(fixture), candidateSha };
    // The copied worktree and its administrative entry still name the
    // template's paths; point them at this copy.
    if (workspace.execution)
      await git(
        checkout.integration,
        "worktree",
        "repair",
        workspace.execution,
      );
    return {
      ...checkout,
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
