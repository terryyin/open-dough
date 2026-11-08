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
/** @typedef {import("./repositoryTestData.mjs").RevisionFacts} RevisionFacts */
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

/**
 * Commit a declared revision's files in a checkout: the committer named, or
 * else the checkout's developer; the author named, or else the committer; the
 * message given, or else the revision's name.
 * @param {string} checkout
 * @param {RevisionFacts & { name?: string }} revision
 * @param {GitPerson} [developer]
 */
export async function commitDeclaredRevision(
  checkout,
  revision,
  developer = integrationDeveloper,
) {
  writeRevisionFiles(checkout, revision);
  const {
    name,
    message = name ?? "Publish declared revision",
    committer = developer,
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
    await commitDeclaredRevision(integration, revision);
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
