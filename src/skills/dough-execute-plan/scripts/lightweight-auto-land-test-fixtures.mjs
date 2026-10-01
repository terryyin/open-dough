// Automatically landed one-shot results: the start with `--auto-land`, managed
// delivery installed beside the result without joining it, the taught
// `deliver` command from any checkout, and the observer's coverage.
import assert from "node:assert/strict";
import { appendFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import { readRevisionCoverage } from "./ci-mailbox.mjs";
import { deliverThroughCli } from "./execution-increment-managed-delivery-cli-test-fixtures.mjs";
import { installManagedDelivery } from "./execution-increment-managed-delivery-test-fixtures.mjs";
import { identityB } from "./one-shot-queued-test-fixtures.mjs";
import { git } from "./publication-test-fixtures.mjs";
import { startCliResult } from "./workspace-publication-fixtures.mjs";

// The one-shot start for queued story B with automatic landing; its branch is
// the delivery fixture's exec/story.
export const startAutoLand = (trunk, options = {}) =>
  startCliResult(trunk, "story-branch", ["--one-shot", "--auto-land"], {
    identity: identityB,
    name: "story",
    ...options,
  });

// Managed delivery installed in `checkout`. The installation stays out of Git
// status, as a real installation's committed copy would, so it never joins
// the landed content or makes the checkout look dirty.
export async function autoLandDelivery(trunk, checkout) {
  const common = (
    await git(
      checkout,
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
  const delivery = await installManagedDelivery(trunk, trunk.fixture, checkout);
  return { ...delivery, execution: checkout };
}

// The taught `deliver` from the fixture's checkout on `branch` in the
// fixture's host session, with B's ownership guard unless `identity` is null;
// `extra` adds flags such as a validated candidate.
export function deliverFrom(
  fixture,
  { base, branch = "exec/story", identity = identityB, extra = [], env },
) {
  return deliverThroughCli(fixture, {
    base,
    host: "cursor",
    workspace: fixture.execution,
    branch,
    ...(env ? { env } : {}),
    extra: [
      ...["--session-json", JSON.stringify(fixture.session)],
      ...(identity ? ["--one-shot-identity", identity] : []),
      ...extra,
    ],
  });
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
