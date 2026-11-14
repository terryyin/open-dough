// Actual refused endpoints through CI acquisition and its short-poll observer;
// no fixture supplies a preclassified request or observation failure.
import assert from "node:assert/strict";
import { chmodSync } from "node:fs";
import { test } from "node:test";
import { instrumentedGithubFixture } from "./ci-github-test-fixtures.mjs";
import {
  ownerSecret,
  refusingOwner,
} from "./github-request-owner-refusal-test-fixtures.mjs";
import { watchCiExecution } from "./watch-ci-execution.mjs";

for (const [fault, message] of [
  ["privacy", "endpoint is open to other users"],
  ["incompatible", "explicitly refused the protocol"],
  ["unauthenticated", "explicitly refused this caller"],
  ["unknown", "gave no usable answer"],
]) {
  test(`a short-poll observer reports observed owner ${fault} rather than an upstream failure`, async (t) => {
    const github = instrumentedGithubFixture(t, {});
    github.enter();
    const root = github.env.DOUGH_GITHUB_REQUEST_OWNER_ROOT;
    if (fault === "privacy") chmodSync(root, 0o755);
    else
      await refusingOwner(github, {
        refused: fault === "unknown" ? ownerSecret : fault,
      });
    const events = [];
    await watchCiExecution({
      repo: "owner/repo",
      branch: "main",
      pollMs: 1,
      maxDurationMs: 2_000,
      emit: (event) => events.push(event),
    });
    assert.equal(events.length, 1);
    assert.equal(events[0].type, "CI_MONITOR_UNAVAILABLE");
    assert.ok(events[0].reason.includes(message), events[0].reason);
    for (const secret of [
      root,
      ownerSecret,
      "gh auth",
      "gh failed",
      "budget expired",
    ])
      assert.equal(events[0].reason.includes(secret), false, events[0].reason);
    assert.deepEqual(github.asked(), []);
  });
}
