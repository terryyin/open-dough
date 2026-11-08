// @ts-check
import { cpSync, mkdirSync, mkdtempSync, realpathSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fixtureTeardown } from "../../src/skills/dough-execute-plan/scripts/fixture-teardown-test-fixtures.mjs";
import { git } from "../../src/skills/dough-execute-plan/scripts/publication-git.mjs";
import { buildRepository, layout } from "./repository-history.mjs";

export {
  commitDeclaredRevision,
  integrationDeveloper,
} from "./repository-revision-commit.mjs";

/** @typedef {import("./repositoryTestData.mjs").RepositoryDescription} RepositoryDescription */
/** @typedef {import("./repository-revision-files.mjs").HarnessLayer} HarnessLayer */

/**
 * How the harness sets the history up, beside what the description states:
 * whether the checkout publishes to a bare origin, and how `git init` and the
 * first commit are shaped. Per-process reuse keys on the whole shape, layer
 * bytes included.
 * @typedef {import("./repository-history.mjs").BuildShape & { origin: boolean }} TemplateShape
 */

/**
 * @param {string} fixture
 * @param {RepositoryDescription} description
 * @param {TemplateShape} shape
 */
function buildTemplate(fixture, description, { origin: published, ...build }) {
  const { origin, ...local } = layout(fixture);
  return buildRepository(
    published ? { origin, ...local } : local,
    description,
    build,
  );
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
  const { origin, integration, execution } = layout(fixture);
  const { cleanup, defer } = fixtureTeardown(fixture);
  try {
    cpSync(root, fixture, { recursive: true });
    // The copied remote, worktree and its administrative entry still name
    // the template's paths; point them at this copy.
    if (shape.origin)
      await git(integration, "remote", "set-url", "origin", origin);
    if (candidateSha !== undefined)
      await git(integration, "worktree", "repair", execution);
    return {
      ...(candidateSha === undefined ? {} : { execution, candidateSha }),
      integration,
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
  return { origin: layout(copy.fixture).origin, ...copy };
}

/**
 * The described history in one local checkout on its trunk branch, with no
 * origin, for a case that reads no remote; removed after test `t` when one is
 * given. Built once per process like `materializeRepository`, each caller its
 * own mutable copy. `gitTemplates: false` skips Git's templates; `layer` adds
 * harness files. `at` builds the checkout in place at that new or existing
 * directory instead, without the per-process template, for a caller that
 * builds it once; files already there are committed with the first revision.
 * @template {string} Name
 * @param {{ after: (fn: () => Promise<void>) => void } | undefined} t
 * @param {import("./repositoryTestData.mjs").RepositoryDescription<Name>} description
 * @param {{ parent?: string, gitTemplates?: boolean, layer?: HarnessLayer, at?: string }} [options]
 */
export async function materializeLocalCheckout(
  t,
  description,
  { parent = tmpdir(), gitTemplates = true, layer, at } = {},
) {
  const shape = { origin: false, gitTemplates, layer };
  const copy =
    at === undefined
      ? await copyTemplate(description, { parent, ...shape })
      : await buildInPlace(at, description, shape);
  t?.after(copy.cleanup);
  return copy;
}

/**
 * @template {string} Name
 * @param {string} at
 * @param {import("./repositoryTestData.mjs").RepositoryDescription<Name>} description
 * @param {import("./repository-history.mjs").BuildShape} shape
 */
async function buildInPlace(at, description, shape) {
  mkdirSync(at, { recursive: true });
  const integration = realpathSync(at);
  const { cleanup, defer } = fixtureTeardown(integration);
  try {
    const execution = layout(integration).execution;
    const { revisions, trunkSha, candidateSha } = await buildRepository(
      { integration, execution },
      description,
      shape,
    );
    return {
      ...(candidateSha === undefined ? {} : { execution, candidateSha }),
      integration,
      fixture: integration,
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
