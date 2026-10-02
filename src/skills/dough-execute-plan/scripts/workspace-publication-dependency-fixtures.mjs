// Shared published dependency setup for real startup and recovery command cases.
import assert from "node:assert/strict";
import { updateDependency } from "../../../../tests/support/story-dependencies-fixture.mjs";
import { git, revParse } from "./publication-test-fixtures.mjs";
import { identityA, identityB } from "./workspace-publication-fixtures.mjs";

export const consumer = { identity: identityA, link: "seeds/A.md#a" };
export const supplier = { identity: identityB, link: "seeds/B.md#b" };
export const projectOf = (trunk) => ({
  directory: trunk.integration,
  inputDirectory: trunk.fixture,
});

export async function publishDependency(trunk, entry, story = consumer) {
  const result = await updateDependency(projectOf(trunk), story, entry);
  assert.equal(result.code, 0, result.stderr);
  await git(trunk.integration, "add", ".planning");
  await git(trunk.integration, "commit", "-m", "record prerequisite");
  await git(trunk.integration, "push", "origin", "main");
  return revParse(trunk.integration, "HEAD");
}
