// Releasing a lost workspace's preparation assignment through the production
// `abandon --profile` command, run from the integration checkout: only the
// developer's confirmation of the exact allocation publishes its end, and
// nothing else on remote trunk or in that checkout changes.
import assert from "node:assert/strict";
import { writeFileSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";
import {
  abandonLostPreparation,
  backlogFile,
  createPreparationTrunk,
  createWorkspace,
  git,
  identityC,
  lsRemoteSha,
  profileOf,
  read,
  remoteChanges,
  remoteFile,
  remoteProfileNames,
  revParse,
  startPreparation,
} from "./preparation-assignment-test-fixtures.mjs";
import {
  occupyAllBut,
  snapshot,
} from "./preparation-assignment-recovery-fixtures.mjs";

const remoteTip = (trunk) => lsRemoteSha(trunk.origin, "refs/heads/main");

// Every remote profile's bytes at `rev`.
async function remoteProfiles(trunk, rev = "main") {
  const paths = await remoteProfileNames(trunk, rev);
  return Object.fromEntries(
    await Promise.all(
      paths.map(async (path) => [path, await remoteFile(trunk, rev, path)]),
    ),
  );
}

test("a lost workspace's preparation assignment is released only by confirming its exact allocation, and never a later allocation of the same name", async (t) => {
  const trunk = await createPreparationTrunk();
  t.after(trunk.cleanup);
  // Every other name is another developer's execution assignment, so the
  // name this preparation takes is the only one a later preparation can reuse.
  const [execution] = await occupyAllBut(trunk, "Yui");
  const { workspace } = await createWorkspace(trunk, "c");
  const { receipt: announced } = await startPreparation(
    trunk,
    workspace,
    identityC,
    ["--host", "claude", "--model", "claude-opus-5-5"],
  );
  assert.equal(announced.status, "announced", JSON.stringify(announced));
  const profile = profileOf("Yui");
  assert.equal(announced.profile, profile);
  // The announcing workspace is lost; the integration checkout holds a
  // developer's pending edit.
  await git(trunk.integration, "worktree", "remove", "--force", workspace);
  await git(
    trunk.integration,
    "pull",
    "--quiet",
    "--ff-only",
    "origin",
    "main",
  );
  writeFileSync(join(trunk.integration, "trunk.txt"), "base\nhuman edit\n");
  const checkout = await snapshot(trunk.integration, ["trunk.txt"]);
  const held = await remoteTip(trunk);
  const queue = await remoteFile(trunk, held, backlogFile);
  const profiles = await remoteProfiles(trunk, held);
  const unchanged = async () => {
    assert.equal(await remoteTip(trunk), held);
    assert.deepEqual(
      await snapshot(trunk.integration, ["trunk.txt"]),
      checkout,
    );
  };

  // Without confirmation, the receipt reports what holds the name.
  const unconfirmed = await abandonLostPreparation(trunk, profile);
  assert.equal(unconfirmed.code, 1);
  assert.deepEqual(
    {
      status: unconfirmed.receipt.status,
      agent: unconfirmed.receipt.agent,
      identity: unconfirmed.receipt.identity,
      activity: unconfirmed.receipt.activity,
      profile: unconfirmed.receipt.profile,
      allocation: unconfirmed.receipt.allocation,
    },
    {
      status: "confirmation-required",
      agent: "Yui-chan",
      identity: identityC,
      activity: "preparation",
      profile,
      allocation: announced.allocation,
    },
  );
  const allocation = ["--allocation", announced.allocation];
  const withoutFlag = await abandonLostPreparation(trunk, profile, allocation);
  assert.equal(withoutFlag.receipt.status, "confirmation-required");
  await unchanged();

  // A confirmed request naming another allocation, or an execution
  // assignment, publishes nothing.
  const stale = await abandonLostPreparation(trunk, profile, [
    "--allocation",
    trunk.trunkSha,
    "--confirmed-abandoned",
  ]);
  assert.equal(stale.receipt.status, "allocation-mismatch");
  assert.equal(stale.receipt.allocation, announced.allocation);
  const executionProfile = profileOf(execution);
  const refused = await abandonLostPreparation(trunk, executionProfile, [
    "--allocation",
    announced.allocation,
    "--confirmed-abandoned",
  ]);
  assert.equal(refused.receipt.status, "not-preparation");
  assert.equal(refused.receipt.activity, "execution");
  await unchanged();

  // Confirmed for the exact allocation: one commit ends only that profile.
  const confirmed = [...allocation, "--confirmed-abandoned"];
  const { code, receipt } = await abandonLostPreparation(
    trunk,
    profile,
    confirmed,
  );
  assert.equal(code, 0, JSON.stringify(receipt));
  assert.equal(receipt.status, "abandoned");
  assert.equal(receipt.allocation, announced.allocation);
  const ended = await remoteTip(trunk);
  assert.equal(receipt.publishedSha, ended);
  assert.equal(await revParse(trunk.origin, `${ended}^`), held);
  assert.deepEqual(await remoteChanges(trunk, ended), [`D\t${profile}`]);
  assert.equal(await remoteFile(trunk, ended, backlogFile), queue);
  const { [profile]: released, ...others } = profiles;
  assert.equal(typeof released, "string");
  assert.deepEqual(await remoteProfiles(trunk, ended), others);
  assert.equal(receipt.refresh.result, "deferred");
  assert.equal(receipt.refresh.reason, "pending-edit");
  assert.deepEqual(await snapshot(trunk.integration, ["trunk.txt"]), checkout);

  // Repeating it publishes nothing more.
  const again = await abandonLostPreparation(trunk, profile, confirmed);
  assert.equal(again.receipt.status, "already-released");
  assert.equal(again.receipt.endedBy, ended);
  assert.equal(await remoteTip(trunk), ended);

  // Once the name is allocated again for the same story, a delayed release
  // of the old allocation leaves the later one in place.
  const { workspace: reused } = await createWorkspace(trunk, "c2");
  const { receipt: later } = await startPreparation(trunk, reused, identityC);
  assert.equal(later.status, "announced", JSON.stringify(later));
  assert.equal(later.profile, profile);
  const successorBytes = await remoteFile(trunk, later.allocation, profile);
  const delayed = await abandonLostPreparation(trunk, profile, confirmed);
  assert.equal(delayed.receipt.status, "already-released");
  assert.equal(delayed.receipt.endedBy, ended);
  assert.equal(delayed.receipt.successor, later.allocation);
  assert.equal(await remoteTip(trunk), later.allocation);
  assert.equal(await remoteFile(trunk, "main", profile), successorBytes);
  assert.equal(read(trunk.integration, "trunk.txt"), "base\nhuman edit\n");
});
