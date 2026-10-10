// Managed delivery never borrows an observer its coordinator did not claim:
// foreign, unclaimed, and ambiguous ownership through installed `deliver`,
// the installed host hook's own owner claims, and real workers. Observers are
// starting conditions only; every registration below is a product outcome.
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { existsSync, realpathSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";
import {
  git,
  watchCount,
} from "./execution-increment-managed-delivery-test-fixtures.mjs";
import {
  commitIncrement,
  coverage,
  hosts,
  ownerClaim,
  revisions,
  siblingCheckouts,
  startReceipt,
  trunkTarget,
} from "./execution-increment-managed-delivery-owner-test-fixtures.mjs";
import { lsRemoteSha } from "./publication-test-fixtures.mjs";

for (const host of Object.keys(hosts)) {
  test(`a ${host} coordinator with only foreign or unclaimed observers of its target reports an ownership gap without its identity and establishes its own observer with it`, async (t) => {
    const { fixture, startObserver, hook, deliver, isLive } =
      await siblingCheckouts(t, host);
    const sibling = await startObserver("sibling");
    assert.match(
      await hook("sibling", "sibling-coordinator", startReceipt(sibling)),
      /CI observer attached to this coordinator/,
    );
    // Started in the publisher's own checkout, and claimed by nobody.
    const unclaimed = await startObserver("publisher");

    const { delivered: unidentified } = await deliver(fixture.trunkSha);
    assert.equal(unidentified.publication, "accepted");
    assert.equal(unidentified.observation.state, "unobserved");
    assert.equal(unidentified.observation.pendingCi, "unobserved");
    assert.equal(unidentified.observation.ownership, "unidentified");
    assert.match(
      unidentified.observation.reason,
      new RegExp(`${hosts[host].variable} is unset`),
    );
    assert.equal(unidentified.observation.directory, undefined);
    assert.equal(
      await lsRemoteSha(fixture.origin, trunkTarget),
      unidentified.receipt.sha,
    );
    assert.equal(watchCount(fixture.storage), 2);

    await commitIncrement(fixture, "second");
    const { delivered } = await deliver(
      unidentified.receipt.sha,
      "publisher-coordinator",
    );
    assert.equal(delivered.publication, "accepted");
    assert.equal(
      delivered.observation.state,
      "attached",
      delivered.observation.reason,
    );
    const own = delivered.observation.directory;
    assert.equal([sibling, unclaimed].includes(own), false);
    assert.notEqual(ownerClaim(own), ownerClaim(sibling));
    assert.deepEqual(coverage(own), revisions(delivered.receipt.sha));

    for (const other of [sibling, unclaimed]) {
      assert.deepEqual(coverage(other), []);
      assert.equal(isLive(other), true);
      assert.equal(existsSync(join(other, "stop")), false);
    }
    assert.equal(existsSync(join(unclaimed, "owner")), false);
  });
}

test("explicit session JSON selects the observer its owner claimed from another worktree, not the ambient coordinator's observer in the delivering checkout", async (t) => {
  const { fixture, startObserver, hook, deliver } = await siblingCheckouts(
    t,
    "claude",
  );
  const session = "shared-session";
  const explicit = { session_id: session, agent_id: "publishing-agent" };
  // The ambient coordinator of that session owns an observer in the checkout
  // delivery runs from.
  const ambient = await startObserver("publisher");
  assert.match(
    await hook("publisher", session, startReceipt(ambient)),
    /CI observer attached to this coordinator/,
  );
  // The explicit owner's observer lives in the other worktree and carries
  // only the claim an earlier hook wrote: the repository's common Git
  // directory, host, session, and child identity.
  const retained = await startObserver("sibling");
  const commonDirectory = realpathSync(
    (
      await git(
        fixture.integration,
        "rev-parse",
        "--path-format=absolute",
        "--git-common-dir",
      )
    ).stdout.trim(),
  );
  writeFileSync(
    join(retained, "owner"),
    createHash("sha256")
      .update(
        JSON.stringify([
          commonDirectory,
          "claude",
          explicit.session_id,
          explicit.agent_id,
        ]),
      )
      .digest("hex"),
  );

  const { delivered } = await deliver(fixture.trunkSha, session, [
    "--session-json",
    JSON.stringify(explicit),
  ]);
  assert.equal(delivered.publication, "accepted");
  assert.equal(
    delivered.observation.state,
    "reused",
    delivered.observation.reason,
  );
  assert.equal(delivered.observation.directory, retained);
  assert.deepEqual(coverage(retained), revisions(delivered.receipt.sha));
  assert.deepEqual(coverage(ambient), []);
  assert.equal(watchCount(fixture.storage), 2);
});

test("a coordinator owning two live observers of its target gets an ambiguous ownership gap, and neither is chosen", async (t) => {
  const { fixture, startObserver, hook, deliver, isLive } =
    await siblingCheckouts(t, "cursor");
  const claimed = [
    await startObserver("publisher"),
    await startObserver("sibling"),
  ].sort();
  for (const directory of claimed)
    assert.match(
      await hook("publisher", "publisher-coordinator", startReceipt(directory)),
      /CI observer attached to this coordinator/,
    );

  const { delivered } = await deliver(
    fixture.trunkSha,
    "publisher-coordinator",
  );
  assert.equal(delivered.publication, "accepted");
  assert.equal(
    await lsRemoteSha(fixture.origin, trunkTarget),
    delivered.receipt.sha,
  );
  assert.equal(delivered.observation.state, "unobserved");
  assert.equal(delivered.observation.pendingCi, "unobserved");
  assert.equal(delivered.observation.ownership, "ambiguous");
  assert.deepEqual([...delivered.observation.directories].sort(), claimed);
  assert.equal(delivered.observation.directory, undefined);
  for (const directory of claimed) {
    assert.match(delivered.observation.reason, new RegExp(directory));
    assert.deepEqual(coverage(directory), []);
    assert.equal(isLive(directory), true);
  }
  assert.equal(watchCount(fixture.storage), 2);
});
