// @ts-check
// Builds one described history as a template: a bare origin, an integration
// checkout and, for a description with a workspace, its execution worktree.
// The repository harness (repository-fixture.mjs) copies templates to callers.
import { cpSync } from "node:fs";
import { join } from "node:path";
import { createBareFixtureRemote } from "../../src/skills/dough-execute-plan/scripts/bare-remote-test-fixtures.mjs";
import {
  exec,
  git,
  revParse,
} from "../../src/skills/dough-execute-plan/scripts/publication-git.mjs";
import { writeRevisionFiles } from "./repository-revision-files.mjs";

/** @typedef {import("./repositoryTestData.mjs").RepositoryDescription} RepositoryDescription */
/** @typedef {import("./repositoryTestData.mjs").RevisionFacts} RevisionFacts */
/** @typedef {import("./repositoryTestData.mjs").GitPerson} GitPerson */

/** @type {GitPerson} */
export const integrationDeveloper = {
  name: "Integration Checkout",
  email: "integration@example.test",
};

/** @param {string} fixture */
export const layout = (fixture) => ({
  origin: join(fixture, "remote.git"),
  integration: join(fixture, "integration"),
});

/** @param {string} fixture */
export const workspacePath = (fixture) => join(fixture, "execution");

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
 * Write a declared revision's files in a checkout and commit them: the
 * committer named, or else the checkout's identity; the author named, or else
 * the committer; the message given, or else the revision's name.
 * @param {string} checkout
 * @param {RevisionFacts & { name?: string }} revision
 * @param {GitPerson} [checkoutIdentity]
 * @returns {Promise<string>} the new commit
 */
export async function commitDeclaredRevision(
  checkout,
  revision,
  checkoutIdentity = integrationDeveloper,
) {
  writeRevisionFiles(checkout, revision);
  const {
    name,
    message = name ?? "Publish declared revision",
    committer = checkoutIdentity,
    author = committer,
  } = revision;
  const env = {
    ...process.env,
    GIT_AUTHOR_NAME: author.name,
    GIT_AUTHOR_EMAIL: author.email,
    GIT_COMMITTER_NAME: committer.name,
    GIT_COMMITTER_EMAIL: committer.email,
    ...(author.date !== undefined && { GIT_AUTHOR_DATE: author.date }),
    ...(committer.date !== undefined && { GIT_COMMITTER_DATE: committer.date }),
  };
  await git(checkout, "add", "--all");
  await exec("git", ["commit", "--allow-empty", "--quiet", "-m", message], {
    cwd: checkout,
    env,
  });
  return revParse(checkout, "HEAD");
}

/**
 * A built history's published revisions, laid out like a template at
 * `directory`, that a template starts from instead of an empty repository.
 * @typedef {{
 *   directory: string,
 *   revisions: Record<string, string>,
 *   trunkSha: string,
 * }} Snapshot
 */

/**
 * Start the template's bare origin and integration checkout: an independent
 * copy of `snapshot` with its own objects, refs, configuration, index and
 * working tree, named as this template's origin, or else a fresh repository
 * pair. Returns the commits the template already holds.
 * @param {string} fixture
 * @param {RepositoryDescription} description
 * @param {Snapshot | undefined} snapshot
 */
async function startTemplate(
  fixture,
  { trunkBranch = "main", checkoutIdentity = integrationDeveloper },
  snapshot,
) {
  const { origin, integration } = layout(fixture);
  if (snapshot) {
    const source = layout(snapshot.directory);
    cpSync(source.origin, origin, { recursive: true });
    cpSync(source.integration, integration, { recursive: true });
    await git(integration, "remote", "set-url", "origin", origin);
    return {
      commits: new Map(Object.entries(snapshot.revisions)),
      trunkSha: snapshot.trunkSha,
    };
  }
  await createBareFixtureRemote(origin, trunkBranch);
  await exec("git", ["init", "-b", trunkBranch, integration]);
  await git(integration, "config", "maintenance.auto", "false");
  await configureIdentity(integration, checkoutIdentity);
  await git(integration, "remote", "add", "origin", origin);
  return {
    commits: /** @type {Map<string, string>} */ (new Map()),
    trunkSha: "",
  };
}

/**
 * Build `description` into the existing empty `fixture`, from `snapshot` when
 * it holds the description's leading revisions. Returns every named commit.
 * @param {string} fixture
 * @param {RepositoryDescription} description
 * @param {Snapshot} [snapshot]
 */
export async function buildTemplate(fixture, description, snapshot) {
  const {
    revisions,
    trunkBranch = "main",
    checkoutIdentity = integrationDeveloper,
    workspace,
  } = description;
  const { integration } = layout(fixture);
  const started = await startTemplate(fixture, description, snapshot);
  const { commits } = started;
  let { trunkSha } = started;
  // Revision names are unique, so the started template holds exactly the
  // leading revisions it has commits for.
  for (const revision of revisions.slice(commits.size)) {
    trunkSha = await commitDeclaredRevision(
      integration,
      revision,
      checkoutIdentity,
    );
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
    candidateSha = await commitDeclaredRevision(
      execution,
      revision,
      workspace.checkoutIdentity ?? checkoutIdentity,
    );
    commits.set(revision.name, candidateSha);
  }
  return { revisions: Object.fromEntries(commits), trunkSha, candidateSha };
}

/** @typedef {Awaited<ReturnType<typeof buildTemplate>>} BuiltTemplate */
