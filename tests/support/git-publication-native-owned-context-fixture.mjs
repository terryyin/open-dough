// Builds an owned-context publication native-journey fixture: a repository
// with no default checkout, only its Git directory and one retained owned
// worktree, then prints its coordinates as JSON.
//
// The project's installed guidance is committed and pushed to trunk before
// the retained worktree is created, so that worktree and every workspace made
// from trunk hold it. Another writer then advances trunk, leaving the
// retained worktree clean and behind.
//
// startup-owned-context: the queued trunk with ready setup; the retained
// worktree also holds an uncommitted, ready-looking local copy of Story A's
// section that differs from the published one. The session is to start a new
// owned workspace.
//
// preparation-land: the preparation trunk with queued, unrefined Story C; the
// retained worktree is the owned preparation workspace.
//
// Usage: node git-publication-native-owned-context-fixture.mjs <source-dir>
//   <journey> <parent> <host>
import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { pathToFileURL } from "node:url";

const [sourceDir, journey, parent, host] = process.argv.slice(2);
const load = (path) => import(pathToFileURL(join(sourceDir, path)).href);
const scripts = "src/skills/dough-execute-plan/scripts";
const { createQueuedTrunk, readyContributing, identityA } = await load(
  `${scripts}/workspace-publication-fixtures.mjs`,
);
const { ownedWorktreeOnly } = await load(
  `${scripts}/default-checkout-test-fixtures.mjs`,
);
const { advanceOriginFromAnotherWriter } = await load(
  `${scripts}/publication-test-fixtures.mjs`,
);
const { computeBasis, recordStoryState } = await load(
  "src/skills/dough-product-backlog/scripts/product-backlog-story-state.mjs",
);
const preparation = await load(
  "src/skills/dough-story-refinement/scripts/preparation-assignment-test-fixtures.mjs",
);

const git = (cwd, ...args) =>
  execFileSync("git", args, { cwd, encoding: "utf8" }).trim();
const isStartup = journey === "startup-owned-context";
if (!isStartup && journey !== "preparation-land")
  throw new Error(`unknown owned-context journey ${journey}`);

const trunk = isStartup
  ? await createQueuedTrunk({
      contributing: readyContributing,
      durableCommandEvidence: true,
      parent,
    })
  : await preparation.createPreparationTrunk({ parent });
const { fixture, origin, integration } = trunk;

execFileSync(
  "bash",
  [
    join(sourceDir, "install.sh"),
    "--target",
    integration,
    "--source",
    sourceDir,
    "--platform",
    host,
  ],
  { stdio: ["ignore", "ignore", "inherit"] },
);
git(integration, "add", "-A");
git(integration, "commit", "-qm", "install Open Dough guidance");
git(integration, "push", "-q", "origin", "main");
const installed = git(integration, "rev-parse", "HEAD");

const owned = isStartup
  ? await ownedWorktreeOnly(trunk, "retained", "work/retained")
  : await ownedWorktreeOnly(trunk, "prep-c", "prep/c");
const fetched = await advanceOriginFromAnotherWriter(origin);

// A local copy of Story A's section changed after preparation, with its
// readiness recorded again over the changed bytes, so it looks ready.
function writeReadyLookingLocalCopy(workspace) {
  const seedPath = join(workspace, ".planning/seeds/A.md");
  const plan = readFileSync(
    join(workspace, ".planning/slice-plans/A/PLAN.md"),
    "utf8",
  );
  const seed = readFileSync(seedPath, "utf8").replace(
    "Execute A.",
    "Changed locally after preparation.",
  );
  const recorded = recordStoryState(
    seed,
    {
      href: "seeds/A.md#a",
      identity: identityA,
      refinement: "refined",
      approach: "planned",
      plan: "../slice-plans/A/PLAN.md",
      assessment: "ready",
      reasons: [],
      expectedBasis: computeBasis(seed, plan),
    },
    { planSource: plan },
  );
  writeFileSync(seedPath, recorded.source);
}

if (isStartup) writeReadyLookingLocalCopy(owned.workspace);

process.stdout.write(
  JSON.stringify({
    root: fixture,
    origin,
    repository: owned.repository,
    retained: owned.workspace,
    workspace: isStartup ? join(fixture, "native-execution") : owned.workspace,
    branch: isStartup ? "exec/native-startup" : owned.branch,
    identity: isStartup ? identityA : preparation.identityC,
    installed,
    base: fetched,
  }),
);
