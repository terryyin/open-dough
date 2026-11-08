// @ts-check
// The repository harness: materializes a described history as a caller's own
// bare origin and checkout. Templates are built once per process
// (repository-template.mjs), from a run-wide snapshot when a registered
// prefix matches (repository-snapshot.mjs).
import { cpSync, mkdtempSync, realpathSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fixtureTeardown } from "../../src/skills/dough-execute-plan/scripts/fixture-teardown-test-fixtures.mjs";
import { git } from "../../src/skills/dough-execute-plan/scripts/publication-git.mjs";
import { locateSnapshot } from "./repository-snapshot.mjs";
import {
  buildTemplate,
  layout,
  workspacePath,
} from "./repository-template.mjs";

export {
  commitDeclaredRevision,
  integrationDeveloper,
} from "./repository-template.mjs";
export {
  prepareRepositorySnapshot,
  registerPreparedPrefix,
} from "./repository-snapshot.mjs";

/** @typedef {import("./repositoryTestData.mjs").RepositoryDescription} RepositoryDescription */
/** @typedef {import("./repository-template.mjs").BuiltTemplate} BuiltTemplate */

/** @type {Map<string, { root: string, built: Promise<BuiltTemplate> }>} */
const templates = new Map();
process.once("exit", () => {
  for (const { root } of templates.values())
    rmSync(root, { recursive: true, force: true });
});

/** @param {RepositoryDescription} description */
function repositoryTemplate(description) {
  const key = JSON.stringify(description);
  const existing = templates.get(key);
  if (existing) return existing;
  const root = realpathSync(
    mkdtempSync(join(tmpdir(), "repository-template-")),
  );
  const built = locateSnapshot(description)
    .then((snapshot) => buildTemplate(root, description, snapshot))
    .catch((error) => {
      rmSync(root, { recursive: true, force: true });
      templates.delete(key);
      throw error;
    });
  const template = { root, built };
  templates.set(key, template);
  return template;
}

/**
 * Build each described history once per process, from a registered prefix's
 * snapshot when one matches and its owner supplies it. Every caller gets its
 * own mutable bare origin and integration checkout, and its own execution
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
