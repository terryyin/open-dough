// @ts-check
import { cpSync, mkdirSync, mkdtempSync, realpathSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fixtureTeardown } from "../../src/skills/dough-execute-plan/scripts/fixture-teardown-test-fixtures.mjs";
import { git } from "../../src/skills/dough-execute-plan/scripts/publication-git.mjs";
import {
  buildRepository,
  layout,
  workspacePath,
} from "./repository-history.mjs";

export { integrationDeveloper } from "./repository-history.mjs";

/** @typedef {Awaited<ReturnType<typeof buildRepository>>} BuiltTemplate */
/** @type {Map<string, { root: string, built: Promise<BuiltTemplate> }>} */
const templates = new Map();
process.once("exit", () => {
  for (const { root } of templates.values())
    rmSync(root, { recursive: true, force: true });
});

/**
 * @param {import("./repositoryTestData.mjs").RepositoryDescription} description
 * @param {boolean} withoutOrigin
 */
function repositoryTemplate(description, withoutOrigin) {
  const key = JSON.stringify({ description, withoutOrigin });
  const existing = templates.get(key);
  if (existing) return existing;
  const root = realpathSync(
    mkdtempSync(join(tmpdir(), "repository-template-")),
  );
  const built = buildRepository(root, description, withoutOrigin).catch(
    (error) => {
      rmSync(root, { recursive: true, force: true });
      templates.delete(key);
      throw error;
    },
  );
  const template = { root, built };
  templates.set(key, template);
  return template;
}

/**
 * @template {string} Name
 * @template {boolean} WithoutOrigin
 * @typedef {{
 *   integration: string,
 *   execution?: string,
 *   candidateSha?: string,
 *   fixture: string,
 *   trunkSha: string,
 *   revisions: Record<Name, string>,
 *   cleanup: () => Promise<void>,
 *   defer: (step: () => unknown) => void,
 * } & (WithoutOrigin extends true ? {} : { origin: string })} MaterializedRepository
 */

/**
 * Build each described history once per process. Every caller gets its own
 * mutable bare origin and integration checkout, and its own execution
 * worktree when the description has a workspace.
 *
 * `withoutOrigin` gives a single local checkout, the fixture directory itself,
 * with no remote. `at` builds the fixture in place at that new or existing
 * directory, without a per-process template, for a process that builds it
 * once; files already there are committed with the first revision.
 * @template {string} Name
 * @template {boolean} [WithoutOrigin=false]
 * @param {import("./repositoryTestData.mjs").RepositoryDescription<Name>} description
 * @param {{ parent?: string, at?: string, withoutOrigin?: WithoutOrigin }} [options]
 * @returns {Promise<MaterializedRepository<Name, WithoutOrigin>>}
 */
export async function materializeRepository(
  description,
  { parent = tmpdir(), at, withoutOrigin } = {},
) {
  const local = withoutOrigin === true;
  const template =
    at === undefined ? repositoryTemplate(description, local) : undefined;
  const copied = await template?.built;
  if (at !== undefined) mkdirSync(at, { recursive: true });
  const fixture = realpathSync(
    at ?? mkdtempSync(join(parent, "workspace-claim-")),
  );
  const checkout = layout(fixture, local);
  const { cleanup, defer } = fixtureTeardown(fixture);
  try {
    if (template) cpSync(template.root, fixture, { recursive: true });
    const { revisions, trunkSha, candidateSha } =
      copied ?? (await buildRepository(fixture, description, local));
    if (copied && checkout.origin)
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
    if (copied && workspace.execution)
      await git(
        checkout.integration,
        "worktree",
        "repair",
        workspace.execution,
      );
    return /** @type {MaterializedRepository<Name, WithoutOrigin>} */ ({
      ...checkout,
      ...workspace,
      fixture,
      trunkSha,
      revisions: /** @type {Record<Name, string>} */ ({ ...revisions }),
      cleanup,
      defer,
    });
  } catch (error) {
    await cleanup();
    throw error;
  }
}
