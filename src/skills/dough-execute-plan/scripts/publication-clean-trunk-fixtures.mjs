// The clean-trunk publication fixture and the authorized remotes its
// checkouts know.
import { join } from "node:path";
import { makeMe } from "../../../../tests/support/makeMe.mjs";
import { materializeRepository } from "../../../../tests/support/repository-fixture.mjs";
import { createBareFixtureRemote } from "./bare-remote-test-fixtures.mjs";
import { git } from "./publication-git.mjs";

// The publication family's shared repository: one `trunk.txt` commit on
// `main`, and an `exec/story` workspace one unpublished `increment.txt`
// commit ahead. Each checkout configures its own committer.
export const trunkWithOneUnpublishedIncrement = makeMe.aRepository
  .withCheckoutIdentity({
    name: "Integration Checkout",
    email: "integration@example.test",
  })
  .withRevision("trunk", {
    backlog: undefined,
    files: { "trunk.txt": "base\n" },
    message: "base trunk commit",
  })
  .withWorkspace("exec/story", {
    from: "trunk",
    checkoutIdentity: {
      name: "Execution Worktree",
      email: "execution@example.test",
    },
  })
  .withUnpublishedRevision("increment", {
    files: { "increment.txt": "increment\n" },
    message: "verified increment",
  })
  .please();

// Builds a clean-trunk publication fixture from `description`: a disposable
// repository whose integration checkout is clean on the trunk branch at the
// same SHA as its bare origin, plus an execution worktree whose unpublished
// suffix is based on that trunk.
export async function createCleanTrunkFixture(
  description = trunkWithOneUnpublishedIncrement,
) {
  return materializeRepository(description);
}

// The URL of `remote`: origin, or a new empty bare repository on `branch` the
// fixture's checkouts know by that name.
export async function authorizedRemote(fixture, remote, branch) {
  if (remote === "origin") return fixture.origin;
  const url = join(fixture.fixture, `${remote}.git`);
  await createBareFixtureRemote(url, branch);
  await git(fixture.integration, "remote", "add", remote, url);
  return url;
}
