// Git mechanics (not guidance-following): with no default checkout, refresh
// and publication's inspection are not applicable; a supplied checkout that is
// missing or where Git fails is deferred (`refresh-failed`) and left unchanged,
// while the accepted publication stands. Native agent behavior is not this
// file.
import assert from "node:assert/strict";
import { join } from "node:path";
import { test } from "node:test";
import { refreshDefaultCheckout } from "./maintain-default-checkout.mjs";
import { inspectDefaultCheckoutMaintenance } from "./publication-git.mjs";
import {
  assertCheckoutUnchanged,
  assertRemoteCandidate,
  captureCheckout,
  createCleanTrunkFixture,
  git,
  pushCandidate,
} from "./publication-test-fixtures.mjs";

const refresh = (checkout) => refreshDefaultCheckout({ checkout });
const inspect = (workspace, checkout) =>
  inspectDefaultCheckoutMaintenance(
    workspace,
    checkout,
    "origin",
    "refs/heads/main",
  );

test("without a default checkout refresh is not applicable, and a missing path or failing Git reports refresh-failed while preserving the checkout", async (t) => {
  const { fixture, origin, integration, execution, candidateSha, cleanup } =
    await createCleanTrunkFixture();
  t.after(cleanup);
  await pushCandidate(execution, candidateSha);
  await git(execution, "fetch", "origin");

  assert.deepEqual(await refreshDefaultCheckout({}), {
    result: "not applicable",
  });
  assert.equal(await inspect(execution, undefined), "not applicable");

  const missing = join(fixture, "moved-checkout");
  assert.deepEqual(await refresh(missing), {
    result: "deferred",
    reason: "refresh-failed",
    error: `default checkout not found: ${missing}`,
  });
  assert.equal(await inspect(execution, missing), "deferred");

  await git(
    integration,
    "remote",
    "set-url",
    "origin",
    join(fixture, "gone.git"),
  );
  const before = await captureCheckout(integration);
  const failed = await refresh(integration);
  assert.equal(failed.result, "deferred");
  assert.equal(failed.reason, "refresh-failed");
  assert.match(failed.error, /gone\.git/);
  assertCheckoutUnchanged(before, await captureCheckout(integration));
  await assertRemoteCandidate(origin, candidateSha);
});
