// @ts-check
import {
  exec,
  git,
  revParse,
} from "../../src/skills/dough-execute-plan/scripts/publication-git.mjs";
import { writeRevisionFiles } from "./repository-revision-files.mjs";

/** @typedef {import("./repositoryTestData.mjs").RevisionFacts} RevisionFacts */
/** @typedef {import("./repositoryTestData.mjs").GitPerson} GitPerson */

/** @type {GitPerson} */
export const integrationDeveloper = {
  name: "Integration Checkout",
  email: "integration@example.test",
};

/**
 * The committer Git records for later commits in `checkout`. With
 * `worktreeOnly`, it is that worktree's own configuration and the
 * repository's other checkouts keep theirs.
 * @param {string} checkout
 * @param {GitPerson} identity
 * @param {{ worktreeOnly?: boolean }} [options]
 */
export async function configureIdentity(
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
 * The commits of the parents `revision` names, each an earlier revision of
 * `commits` (revision name to commit), or undefined when it names none.
 * @param {{ name: string; parents?: readonly string[] }} revision
 * @param {ReadonlyMap<string, string>} commits
 * @returns {string[] | undefined}
 */
export function declaredParents(revision, commits) {
  return revision.parents?.map((parent) => {
    const commit = commits.get(parent);
    if (!commit)
      throw new Error(`Unknown parent ${parent} for ${revision.name}`);
    return commit;
  });
}

/**
 * Write a declared revision's files in a checkout and commit them: the
 * committer named, or else the checkout's identity; the author named, or else
 * the committer; the message given, or else the revision's name.
 * @param {string} checkout
 * @param {RevisionFacts & { name?: string }} revision
 * @param {GitPerson} [checkoutIdentity]
 * @param {readonly string[]} [parents] Resolved explicit parent commits.
 * @returns {Promise<string>} the new commit
 */
export async function commitDeclaredRevision(
  checkout,
  revision,
  checkoutIdentity = integrationDeveloper,
  parents,
) {
  if (parents !== undefined)
    await git(checkout, "read-tree", "--reset", "-u", parents[0]);
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
  if (parents !== undefined) {
    const tree = (await git(checkout, "write-tree")).stdout.trim();
    const commit = (
      await exec(
        "git",
        [
          "commit-tree",
          tree,
          ...parents.flatMap((parent) => ["-p", parent]),
          "-m",
          message,
        ],
        { cwd: checkout, env },
      )
    ).stdout.trim();
    await git(checkout, "update-ref", "HEAD", commit);
    return commit;
  }
  await exec("git", ["commit", "--allow-empty", "--quiet", "-m", message], {
    cwd: checkout,
    env,
  });
  return revParse(checkout, "HEAD");
}
