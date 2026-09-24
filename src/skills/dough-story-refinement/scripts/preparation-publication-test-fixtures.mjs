import {
  mkdtempSync,
  readFileSync,
  realpathSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import {
  exec,
  git,
  revParse,
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

// Shared preparation-workspace fixture for the preparation publication tests.
// Git mechanics only: an integration checkout plus a separately branched
// preparation worktree holding one retained-record commit.

// Builds a disposable repository modeling preparation's own case: a bare
// origin at trunkSha, an "integration" checkout (this preparation's recorded
// integration checkout, per "Select or reuse the workspace"), and a
// "preparation" worktree -- a temporary branch/worktree pair created from
// trunkSha, per [own a temporary exploration workspace] "Select the
// checkout" -- holding one committed retained seed-draft record, the
// already-committed part of a reviewed worktree.
// `tmpPrefix` distinguishes each caller's disposable directories for easier
// debugging; it has no effect on the fixture's Git behavior.
export async function createPreparationFixture(tmpPrefix) {
  const fixture = realpathSync(mkdtempSync(join(tmpdir(), tmpPrefix)));
  const origin = join(fixture, "remote.git");
  const integration = join(fixture, "integration");
  const preparation = join(fixture, "preparation");
  const preparationBranch = "prep/seed-1-refinement";

  await exec("git", ["init", "--bare", "-b", "main", origin]);

  await exec("git", ["init", "-b", "main", integration]);
  await git(integration, "config", "user.name", "Integration Checkout");
  await git(integration, "config", "user.email", "integration@example.test");
  await git(integration, "remote", "add", "origin", origin);
  writeFileSync(join(integration, "trunk.txt"), "base\n");
  await git(integration, "add", "trunk.txt");
  await git(integration, "commit", "-m", "base trunk commit");
  await git(integration, "push", "origin", "main");
  const trunkSha = await revParse(integration, "main");

  await git(
    integration,
    "worktree",
    "add",
    preparation,
    "-b",
    preparationBranch,
    trunkSha,
  );
  await git(preparation, "config", "user.name", "Preparation Workspace");
  await git(preparation, "config", "user.email", "preparation@example.test");

  writeFileSync(
    join(preparation, "seed-draft.md"),
    "SEED-1: refined goal and scope\n",
  );
  await git(preparation, "add", "seed-draft.md");
  await git(preparation, "commit", "-m", "Refine SEED-1 draft");
  const preparationSha = await revParse(preparation, preparationBranch);

  return {
    fixture,
    origin,
    integration,
    preparation,
    preparationBranch,
    trunkSha,
    preparationSha,
    cleanup: () => rmSync(fixture, { recursive: true, force: true }),
  };
}
