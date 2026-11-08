import { readFileSync, rmSync } from "node:fs";
import { join } from "node:path";
import { makeMe } from "../../../../tests/support/makeMe.mjs";
import { materializeRepository } from "../../../../tests/support/repository-fixture.mjs";
import {
  exec,
  worktreeCount,
} from "../../dough-execute-plan/scripts/publication-test-fixtures.mjs";

export { worktreeCount };

// Reads one file from the bare origin by cloning it. The clone is removed
// before the text is returned.
export async function cloneFile(origin, file) {
  const dir = (await exec("mktemp", ["-d"])).stdout.trim();
  await exec("git", ["clone", origin, dir]);
  const text = readFileSync(join(dir, file), "utf8");
  rmSync(dir, { recursive: true, force: true });
  return text;
}

// The branch of the preparation workspace every preparation case owns.
const preparationBranch = "prep/seed-1-refinement";

// A repository whose preparation workspace starts from the `trunk` revision
// and holds one committed, unpublished `record` revision: the
// already-committed part of a reviewed worktree. Each states the revision
// facts a case reads.
export const preparationRepository = ({ trunk, record } = {}) =>
  makeMe.aRepository
    .withRevision("trunk", trunk)
    .withWorkspace(preparationBranch, { from: "trunk" })
    .withUnpublishedRevision("record", record)
    .please();

// Preparation's own case from `description`: a bare origin at trunkSha, the
// recorded integration checkout, and the preparation worktree (a temporary
// branch and worktree pair created from trunkSha, per [own a temporary
// exploration workspace] "Select the checkout") at preparationSha.
export async function createPreparationFixture(
  description = preparationRepository(),
) {
  const repository = await materializeRepository(description);
  return {
    ...repository,
    preparation: repository.execution,
    preparationBranch: description.workspace.branch,
    preparationSha: repository.candidateSha,
  };
}
