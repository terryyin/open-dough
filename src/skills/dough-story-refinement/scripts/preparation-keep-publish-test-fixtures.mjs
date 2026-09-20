import { mkdtempSync, realpathSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import {
  exec,
  git,
  lsRemoteSha,
  revParse,
} from "../../dough-execute-plan/scripts/trunk-publication-local-main-test-fixtures.mjs";

// Shared by preparation-workspace-keep-publish.test.mjs (Slice 3) and
// preparation-keep-publish-resume.test.mjs (Slice 5): both prove behavior
// against the same preparation workspace shape, so the shape is built here
// once rather than duplicated per test file.

// Builds a disposable repository modeling preparation's own case: a bare
// origin at trunkSha, an "integration" checkout (this preparation's recorded
// integration checkout, per "Select or reuse the workspace"), and a
// "preparation" worktree -- a temporary branch/worktree pair created from
// trunkSha, per [own a temporary exploration workspace] "Select the
// checkout" -- holding one committed retained seed-draft record, matching
// "Keep and publish the retained result" step 1's already-committed case.
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

// Simulates "let another writer advance origin": a disjoint commit pushed
// from a third, unrelated checkout. Each caller's own comment at its call
// site says what that timing means for its own scenario (a proactive
// pre-push rebase for Slice 3, or an interruption-window advance for
// Slice 5's resume proof).
export async function advanceOriginFromAnotherWriter(origin) {
  const thirdCheckout = (await exec("mktemp", ["-d"])).stdout.trim();
  await exec("git", ["clone", origin, thirdCheckout]);
  await git(thirdCheckout, "config", "user.name", "Another Writer");
  await git(thirdCheckout, "config", "user.email", "another@example.test");
  writeFileSync(join(thirdCheckout, "other-writer.txt"), "their work\n");
  await git(thirdCheckout, "add", "other-writer.txt");
  await git(thirdCheckout, "commit", "-m", "another writer's own increment");
  await git(thirdCheckout, "push", "origin", "main");
  const disjointSha = await lsRemoteSha(origin, "refs/heads/main");
  rmSync(thirdCheckout, { recursive: true, force: true });
  return disjointSha;
}
