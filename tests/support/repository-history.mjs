// @ts-check
// Builds a described repository history in a fixture directory.
import { join } from "node:path";
import { createBareFixtureRemote } from "../../src/skills/dough-execute-plan/scripts/bare-remote-test-fixtures.mjs";
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

/**
 * Where a fixture's repositories live. Without an origin, the fixture
 * directory is itself the one checkout.
 * @param {string} fixture
 * @param {boolean} withoutOrigin
 */
export const layout = (fixture, withoutOrigin) =>
  withoutOrigin
    ? { integration: fixture }
    : {
        origin: join(fixture, "remote.git"),
        integration: join(fixture, "integration"),
      };

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

/**
 * Tag a committed revision: a release gets its annotated `v<version>` tag
 * dated `taggedAt`, and each stated name a lightweight tag. Returns the tag
 * refs it created.
 * @param {string} checkout
 * @param {RepositoryRevision} revision
 */
async function tagRevision(checkout, { release, tags = [] }) {
  /** @type {string[]} */
  const created = [];
  if (release) {
    const tag = `v${release.version}`;
    await exec("git", ["tag", "-a", tag, "-m", tag], {
      cwd: checkout,
      env: {
        ...process.env,
        GIT_AUTHOR_DATE: release.taggedAt,
        GIT_COMMITTER_DATE: release.taggedAt,
      },
    });
    created.push(`refs/tags/${tag}`);
  }
  for (const tag of tags) {
    await git(checkout, "tag", tag);
    created.push(`refs/tags/${tag}`);
  }
  return created;
}

/**
 * Commit every described revision into a new fixture at `fixture`: its
 * integration checkout, pushed to a bare origin unless `withoutOrigin`, and
 * its execution worktree when the description has a workspace.
 * @param {string} fixture
 * @param {RepositoryDescription} description
 * @param {boolean} withoutOrigin
 */
export async function buildRepository(
  fixture,
  {
    revisions,
    trunkBranch = "main",
    checkoutIdentity = integrationDeveloper,
    workspace,
  },
  withoutOrigin,
) {
  const { origin, integration } = layout(fixture, withoutOrigin);
  if (origin) await createBareFixtureRemote(origin, trunkBranch);
  await exec("git", ["init", "-b", trunkBranch, integration]);
  await git(integration, "config", "maintenance.auto", "false");
  await configureIdentity(integration, checkoutIdentity);
  if (origin) await git(integration, "remote", "add", "origin", origin);

  /** @type {Map<string, string>} */
  const commits = new Map();
  let trunkSha = "";
  for (const revision of revisions) {
    writeRevisionFiles(integration, revision);
    trunkSha = await commitRevision(integration, revision, checkoutIdentity);
    const tags = await tagRevision(integration, revision);
    if (origin)
      await git(integration, "push", "--quiet", "origin", trunkBranch, ...tags);
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
    await tagRevision(execution, revision);
    commits.set(revision.name, candidateSha);
  }
  return { revisions: Object.fromEntries(commits), trunkSha, candidateSha };
}
