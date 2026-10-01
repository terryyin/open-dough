// One-shot start refusals: admission, automatic landing without publication
// authority, tracked automatic landing, missing workspace authority, or Taken
// work stops before any workspace is created or anything reaches the remote.
import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";
import { remoteHeads } from "./publication-test-fixtures.mjs";
import {
  createQueuedTrunk,
  identityA,
  startCliResult,
} from "./workspace-publication-fixtures.mjs";
import { startExecution } from "./execution-start.mjs";

// An unlisted one-shot start in Story Branch Mode, the default.
function startOneShot(trunk, extra, options) {
  return startCliResult(trunk, "story-branch", ["--one-shot", ...extra], {
    identity: null,
    ...options,
  });
}

test("one-shot refuses admission, automatic landing without publication authority, tracked automatic landing, missing workspace authority, and Taken work without creating a workspace", async (t) => {
  const trunk = await createQueuedTrunk();
  t.after(trunk.cleanup);
  const taken = await startCliResult(trunk, "trunk");
  assert.equal(taken.receipt.ok, true, taken.stdout);
  const headsBefore = await remoteHeads(trunk.origin);

  const refusals = [
    [
      "admission",
      startOneShot(
        trunk,
        ["--admit", "--link", "seeds/C.md#c", "--title", "C"],
        {
          name: "admit",
        },
      ),
      "invalid-request",
      /--one-shot or --admit/,
    ],
    [
      "automatic landing without publication authority",
      startOneShot(trunk, ["--auto-land"], {
        name: "auto-land",
        pushAuthorized: false,
      }),
      "authority-required",
      /trunk publication authority/,
    ],
    [
      "tracked automatic landing",
      startCliResult(trunk, "trunk", ["--auto-land"], {
        name: "tracked-auto-land",
        identity: "SEED-B#b",
      }),
      "invalid-request",
      /--auto-land applies to one-shot work/,
    ],
    [
      "Taken identity",
      startOneShot(trunk, [], { name: "taken", identity: identityA }),
      "source-refused",
      /already Taken on fetched trunk/,
    ],
  ];
  for (const [label, pending, status, error] of refusals) {
    const refused = await pending;
    assert.equal(refused.code, 1, label);
    assert.equal(refused.receipt.status, status, label);
    assert.match(refused.receipt.error, error, label);
    assert.equal(existsSync(refused.workspace), false, label);
  }

  const workspace = join(trunk.fixture, "start-unauthorized");
  const unauthorized = await startExecution({
    integration: trunk.integration,
    workspace,
    branch: "exec/unauthorized",
    mode: "story-branch",
    target: "main",
    oneShot: true,
    pushAuthorized: true,
  });
  assert.equal(unauthorized.status, "authority-required");
  assert.match(unauthorized.error, /workspace authority/);
  assert.equal(existsSync(workspace), false);
  assert.equal(await remoteHeads(trunk.origin), headsBefore);
});
