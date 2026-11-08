// @ts-check
// Builds a described repository history at a fixture layout.
import { join } from "node:path";
import { createBareFixtureRemote } from "../../src/skills/dough-execute-plan/scripts/bare-remote-test-fixtures.mjs";
import {
  exec,
  git,
} from "../../src/skills/dough-execute-plan/scripts/publication-git.mjs";
import { writeRevisionFiles } from "./repository-revision-files.mjs";
import {
  commitDeclaredRevision,
  configureIdentity,
  integrationDeveloper,
} from "./repository-revision-commit.mjs";

/** @typedef {import("./repositoryTestData.mjs").RepositoryDescription} RepositoryDescription */
/** @typedef {import("./repositoryTestData.mjs").RepositoryRevision} RepositoryRevision */
/** @typedef {import("./repository-revision-files.mjs").HarnessLayer} HarnessLayer */

/**
 * Where a history's repositories live: its bare origin, if it publishes to
 * one, its integration checkout, and its execution worktree, if the
 * description has a workspace.
 * @typedef {{ origin?: string, integration: string, execution: string }} RepositoryLayout
 */

/**
 * The layout of a fixture directory holding the whole history.
 * @param {string} fixture
 */
export const layout = (fixture) => ({
  origin: join(fixture, "remote.git"),
  integration: join(fixture, "integration"),
  execution: join(fixture, "execution"),
});

/**
 * How the harness sets the history up, beside what the description states:
 * whether `git init` copies Git's templates (an init without them has no
 * `info/` or hooks), and the harness layer its first commit also holds.
 * @typedef {{ gitTemplates: boolean, layer?: HarnessLayer | undefined }} BuildShape
 */

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
 * Commit every described revision, with its tags, into a new integration
 * checkout, pushed to the bare origin when the layout has one, and its
 * execution worktree when the description has a workspace. An existing
 * integration directory's files are committed with the first revision.
 * @param {RepositoryLayout} paths
 * @param {RepositoryDescription} description
 * @param {BuildShape} shape
 */
export async function buildRepository(
  { origin, integration, execution },
  {
    revisions,
    trunkBranch = "main",
    checkoutIdentity = integrationDeveloper,
    workspace,
  },
  { gitTemplates, layer },
) {
  if (origin) await createBareFixtureRemote(origin, trunkBranch);
  await exec("git", [
    "init",
    ...(gitTemplates ? [] : ["--template="]),
    "-b",
    trunkBranch,
    integration,
  ]);
  await git(integration, "config", "maintenance.auto", "false");
  await configureIdentity(integration, checkoutIdentity);
  if (origin) await git(integration, "remote", "add", "origin", origin);

  /** @type {Map<string, string>} */
  const commits = new Map();
  let trunkSha = "";
  for (const [index, revision] of revisions.entries()) {
    if (index === 0 && layer) writeRevisionFiles(integration, layer);
    trunkSha = await commitDeclaredRevision(
      integration,
      revision,
      checkoutIdentity,
    );
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
    await tagRevision(execution, revision);
    commits.set(revision.name, candidateSha);
  }
  return { revisions: Object.fromEntries(commits), trunkSha, candidateSha };
}
