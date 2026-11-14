// Queued one-shot journeys over the trunk where story B is queued between A
// and its unfinished sibling B2 in the same seed: the one-shot start for B,
// the result commit an agent composes for it, managed delivery with its
// ownership guard, and the rival holders another developer publishes through
// the production commands.
import assert from "node:assert/strict";
import {
  appendFileSync,
  mkdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { join } from "node:path";
import { takenHeading } from "../../dough-product-backlog/scripts/product-backlog-document.mjs";
import {
  backlogCli,
  createWorkspace,
  startPreparation,
} from "../../dough-story-refinement/scripts/preparation-assignment-test-fixtures.mjs";
import { readRevisionCoverage } from "./ci-mailbox.mjs";
import { deliverThroughCli } from "./execution-increment-managed-delivery-cli-test-fixtures.mjs";
import { installManagedDelivery } from "./execution-increment-managed-delivery-test-fixtures.mjs";
import { exec, git, revParse } from "./publication-test-fixtures.mjs";
import { storyB2 } from "./one-shot-queued-repository.mjs";
import { listed } from "./workspace-publication-admission-fixtures.mjs";
import {
  identityB,
  startCliResult,
} from "./workspace-publication-fixtures.mjs";

export { remoteText } from "./workspace-publication-admission-fixtures.mjs";
export { identityB };
export const identityB2 = storyB2.identity;
export const backlogFile = ".planning/PRODUCT-BACKLOG.md";
export const seedB = ".planning/seeds/B.md";
export const planB = ".planning/slice-plans/B/PLAN.md";
export const trunkTarget = "refs/heads/main";

export const backlog = (cwd, ...args) =>
  exec(process.execPath, [backlogCli, ...args], { cwd });

// The one-shot start for queued story B; its branch is the delivery
// fixture's exec/story.
export function startQueuedOneShot(trunk, { extra = [], ...options } = {}) {
  return startCliResult(trunk, "story-branch", ["--one-shot", ...extra], {
    identity: identityB,
    name: "story",
    ...options,
  });
}

// The agent's result commit for B: its result (unless none was needed),
// B's backlog completion with its done record, its spent story section and
// its plan; with `stageAll`, everything else in the checkout too, as in the
// default checkout.
export async function commitQueuedResult(
  workspace,
  { result = true, stageAll = false } = {},
) {
  if (result) writeFileSync(join(workspace, "feature.txt"), "B's result\n");
  await backlog(workspace, "complete", "--identity", identityB);
  const seed = readFileSync(join(workspace, seedB), "utf8");
  const start = seed.indexOf('<a id="b"></a>');
  writeFileSync(
    join(workspace, seedB),
    seed.slice(0, start) + seed.slice(seed.indexOf('<a id="b2"></a>')),
  );
  rmSync(join(workspace, ".planning/slice-plans/B"), { recursive: true });
  const paths = [
    backlogFile,
    ".planning/done",
    seedB,
    planB,
    ...(result ? ["feature.txt"] : []),
  ];
  await git(workspace, "add", "-A", ...(stageAll ? [] : ["--", ...paths]));
  await git(workspace, "commit", "-qm", "Complete story B as one-shot work");
  return revParse(workspace, "HEAD");
}

// Managed delivery installed in the one-shot workspace. Exclude a test-only
// installation when it must stay outside landed content and Git status.
export async function queuedDelivery(
  trunk,
  workspace,
  { excludeInstallation = false } = {},
) {
  if (excludeInstallation) {
    const common = (
      await git(
        workspace,
        "rev-parse",
        "--path-format=absolute",
        "--git-common-dir",
      )
    ).stdout.trim();
    mkdirSync(join(common, "info"), { recursive: true });
    appendFileSync(
      join(common, "info/exclude"),
      "/.agents/\n/.planning/open-dough.json\n",
    );
  }
  const delivery = await installManagedDelivery(
    trunk,
    trunk.fixture,
    workspace,
  );
  return { ...delivery, execution: workspace };
}

// The taught `deliver` command, optionally in a host session. B's ownership
// guard is the default; null identity omits it for unqueued results.
export function deliverQueued(
  fixture,
  base,
  extra = [],
  { session, identity = identityB, ...options } = {},
) {
  return deliverThroughCli(fixture, {
    base,
    host: "cursor",
    mode: "story-branch",
    tracking: "one-shot",
    ...options,
    extra: [
      ...(session ? ["--session-json", JSON.stringify(session)] : []),
      ...(identity ? ["--one-shot-identity", identity] : []),
      ...extra,
    ],
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

// The observer delivery bound for trunk, newly or reused from an earlier
// delivery that pushed nothing, covers exactly the accepted SHA; CI itself
// has not concluded.
export function assertTrunkObserved(delivered) {
  assert.match(delivered.observation.state, /^(attached|reused)$/);
  const coverage = readRevisionCoverage(delivered.observation.directory);
  assert.deepEqual(
    coverage.map(({ sha }) => sha),
    [delivered.receipt.sha.toLowerCase()],
  );
}

// The merge base of `checkout`'s HEAD and its freshly fetched trunk: the base
// a default-checkout result extends, its earlier local commits included.
export async function fetchedMergeBase(checkout) {
  await git(checkout, "fetch", "-q", "origin");
  return (
    await git(checkout, "merge-base", "HEAD", "origin/main")
  ).stdout.trim();
}
