// Managed delivery over a stalling Git transport: a fixture whose transport
// bound is lowered after setup, and the assertions its stop and retry share.
import assert from "node:assert/strict";
import { readRevisionCoverage } from "./ci-mailbox.mjs";
import {
  createManagedFixture,
  git,
} from "./execution-increment-managed-delivery-test-fixtures.mjs";
import { transportBoundSetting } from "./publication-git.mjs";
import { installTransportStall } from "./publication-stall-test-fixtures.mjs";
import { captureCheckout } from "./publication-test-fixtures.mjs";

export const trunkTarget = "refs/heads/main";
const repo = "owner/project";
// Lowered only after setup; leaves start-up room for Git, the stand-in,
// receive-pack, and hooks on a loaded machine.
export const boundMs = 2_000;
// Delivery establishes observation before publishing; the whole run still
// ends far inside the default bound.
const deliveryAllowanceMs = 15_000;

export async function stalledDeliveryFixture(t) {
  const fixture = await createManagedFixture();
  const stall = await installTransportStall({
    fixture: fixture.fixture,
    workspace: fixture.execution,
    origin: fixture.origin,
  });
  const previous = process.env[transportBoundSetting];
  process.env[transportBoundSetting] = String(boundMs);
  t.after(async () => {
    if (previous === undefined) delete process.env[transportBoundSetting];
    else process.env[transportBoundSetting] = previous;
    await stall.cleanup();
    await fixture.cleanup();
  });
  const deliver = (extra = {}) =>
    fixture.deliverManagedExecutionIncrement({
      ...fixture.requestBase,
      workspace: fixture.execution,
      branch: "exec/story",
      previouslyPublishedBase: fixture.trunkSha,
      targetRef: trunkTarget,
      repo,
      ...extra,
    });
  return { fixture, stall, deliver };
}

export async function workspaceState(execution) {
  return {
    checkout: await captureCheckout(execution),
    branch: (await git(execution, "branch", "--show-current")).stdout.trim(),
  };
}

export async function timed(operation) {
  const started = Date.now();
  const result = await operation();
  return { result, elapsed: Date.now() - started };
}

export function assertTransportStop(delivered, elapsed, fields) {
  assert.equal(delivered.ok, false);
  assert.equal(delivered.publication, "stopped");
  assert.equal(delivered.status, "transport-timeout");
  assert.equal(delivered.receipt, null);
  assert.equal(delivered.boundMs, boundMs);
  assert.equal(delivered.remote, "origin");
  assert.equal(delivered.target, trunkTarget);
  for (const [name, value] of Object.entries(fields)) {
    assert.deepEqual(delivered[name], value, name);
  }
  assert.ok(elapsed >= boundMs, `stopped before the bound: ${elapsed} ms`);
  assert.ok(
    elapsed < boundMs + deliveryAllowanceMs,
    `stopped long after the bound: ${elapsed} ms`,
  );
}

export function assertNoTransportTimeout(delivered) {
  assert.doesNotMatch(JSON.stringify(delivered), /transport-timeout/);
}

// How many pushes reached the remote, stalled or not.
export const receivePacks = (stall) =>
  stall.calls().filter(({ service }) => service === "receive-pack").length;

export function assertCoveredOnce(delivered, sha) {
  assert.deepEqual(
    readRevisionCoverage(delivered.observation.directory).map(
      (entry) => entry.sha,
    ),
    [sha.toLowerCase()],
  );
}
