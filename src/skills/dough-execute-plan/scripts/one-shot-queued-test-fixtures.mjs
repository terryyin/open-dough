// Queued one-shot journeys: story B queued between A and its unfinished
// sibling B2 in the same seed, the one-shot start for B, the result commit an
// agent composes for it, managed delivery with its ownership guard, and the
// rival holders another developer publishes through the production commands.
import assert from "node:assert/strict";
import { appendFileSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { takenHeading } from "../../dough-product-backlog/scripts/product-backlog-document.mjs";
import {
  backlogCli,
  createWorkspace,
  startPreparation,
} from "../../dough-story-refinement/scripts/preparation-assignment-test-fixtures.mjs";
import { deliverThroughCli } from "./execution-increment-managed-delivery-cli-test-fixtures.mjs";
import { installManagedDelivery } from "./execution-increment-managed-delivery-test-fixtures.mjs";
import { exec, git, revParse } from "./publication-test-fixtures.mjs";
import { listed } from "./workspace-publication-admission-fixtures.mjs";
import {
  createQueuedTrunk,
  identityB,
  startCliResult,
} from "./workspace-publication-fixtures.mjs";
import { configureDeveloper } from "./workspace-publication-startup-test-fixtures.mjs";

export { remoteText } from "./workspace-publication-admission-fixtures.mjs";
export { identityB };
export const identityB2 = "SEED-B#b2";
export const backlogFile = ".planning/PRODUCT-BACKLOG.md";
export const seedB = ".planning/seeds/B.md";
export const planB = ".planning/slice-plans/B/PLAN.md";
export const trunkTarget = "refs/heads/main";
const siblingSection =
  '\n<a id="b2"></a>\n\n### Story B2\n\n**Identity:** SEED-B#b2\n\nExecute B2 later.\n';

export const backlog = (cwd, ...args) =>
  exec(process.execPath, [backlogCli, ...args], { cwd });

// Queued trunk A, B, B2, where B2 is B's unfinished sibling in seed B;
// `options` are createQueuedTrunk's.
export async function createSiblingTrunk(options) {
  const trunk = await createQueuedTrunk(options);
  const { integration } = trunk;
  appendFileSync(join(integration, seedB), siblingSection);
  await backlog(
    integration,
    "add",
    "--identity",
    identityB2,
    "--title",
    "Story B2",
    "--link",
    "seeds/B.md#b2",
    "--position",
    "last",
  );
  // B stays ready for an ordinary Take after its seed gained the sibling.
  await recordStoryBReady(integration);
  await git(integration, "add", ".planning");
  await git(integration, "commit", "-qm", "queue sibling B2");
  await git(integration, "push", "-q", "origin", "main");
  await configureDeveloper(integration);
  return { ...trunk, trunkSha: await revParse(integration, "HEAD") };
}

// Records story B's readiness again over its current seed section and plan.
export async function recordStoryBReady(integration) {
  const link = "seeds/B.md#b";
  const { basis } = JSON.parse(
    (await backlog(integration, "read-state", "--link", link)).stdout,
  );
  await backlog(
    ...[integration, "record-state", "--identity", identityB, "--link", link],
    ...["--refinement", "refined", "--approach", "planned"],
    ...["--plan", "../slice-plans/B/PLAN.md", "--assessment", "ready"],
    ...["--expect-document", basis.document, "--expect-plan", basis.plan],
  );
}

// The one-shot start for queued story B; its branch is the delivery
// fixture's exec/story.
export function startQueuedOneShot(trunk, options = {}) {
  return startCliResult(trunk, "story-branch", ["--one-shot"], {
    identity: identityB,
    name: "story",
    ...options,
  });
}

// The agent's result commit for B: its result (unless none was needed),
// B's backlog completion, its spent story section and its plan.
export async function commitQueuedResult(workspace, { result = true } = {}) {
  if (result) writeFileSync(join(workspace, "feature.txt"), "B's result\n");
  await backlog(workspace, "complete", "--identity", identityB);
  const seed = readFileSync(join(workspace, seedB), "utf8");
  const start = seed.indexOf('<a id="b"></a>');
  writeFileSync(
    join(workspace, seedB),
    seed.slice(0, start) + seed.slice(seed.indexOf('<a id="b2"></a>')),
  );
  rmSync(join(workspace, ".planning/slice-plans/B"), { recursive: true });
  const paths = [backlogFile, seedB, planB, ...(result ? ["feature.txt"] : [])];
  await git(workspace, "add", "-A", "--", ...paths);
  await git(workspace, "commit", "-qm", "Complete story B as one-shot work");
  return revParse(workspace, "HEAD");
}

// Managed delivery installed in the one-shot workspace.
export async function queuedDelivery(trunk, workspace) {
  const delivery = await installManagedDelivery(
    trunk,
    trunk.fixture,
    workspace,
  );
  return { ...delivery, execution: workspace };
}

// The taught `deliver` command for B with its ownership guard.
export function deliverQueued(fixture, base, extra = []) {
  return deliverThroughCli(fixture, {
    base,
    host: "cursor",
    extra: ["--one-shot-identity", identityB, ...extra],
  });
}

// Another developer Takes B through the production start command.
export async function rivalTake(trunk) {
  const taken = await startCliResult(trunk, "trunk", [], {
    identity: identityB,
    name: "rival",
  });
  assert.equal(taken.receipt.ok, true, taken.stdout);
  return taken.receipt.publishedSha;
}

// Another developer announces preparation of B through its production start.
export async function rivalPreparation(trunk) {
  const { workspace } = await createWorkspace(trunk, "rival");
  const { code, receipt } = await startPreparation(trunk, workspace, identityB);
  assert.equal(code, 0, JSON.stringify(receipt));
  return receipt.publishedSha;
}

// Queue order on remote trunk at `rev`, and who is Taken there.
export async function remoteLists(trunk, rev = "main") {
  const entries = await listed(trunk, rev);
  const named = (taken) =>
    entries
      .filter((entry) => (entry.list === takenHeading) === taken)
      .map((entry) => entry.identity);
  return { taken: named(true), queued: named(false) };
}

// Commits on remote trunk after `base`, oldest first.
export async function remoteCommitsSince(origin, base) {
  const { stdout } = await git(
    origin,
    "rev-list",
    "--reverse",
    `${base}..main`,
  );
  return stdout.trim().split("\n").filter(Boolean);
}
