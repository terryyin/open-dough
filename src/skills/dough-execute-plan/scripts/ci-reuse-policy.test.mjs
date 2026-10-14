import assert from "node:assert/strict";
import { test } from "node:test";
import { reusableValidation } from "./ci-reuse-policy.mjs";

const policy = {
  repo: "owner/project",
  workflow: "ci.yml",
  unit: "covered",
  configuration: "checks-v1",
  context: "pinned-inputs-v1",
  targetRef: "main",
  refs: ["exec/story", "main"],
  events: ["push"],
  maxAgeMs: 10000,
};
const now = 20000;
const sha = "a".repeat(40);
const source = {
  ...policy,
  sha,
  ref: "exec/story",
  event: "push",
  runId: "run:opaque/z",
  attemptId: "attempt:opaque/z",
  url: "https://ci.example/source",
  current: true,
  order: 10000,
  outcome: "success",
  direct: true,
  validatedAt: 15000,
  validUntil: 25000,
};
const input = (attempts = [source], query = {}) => ({
  sha,
  targetRef: "main",
  policy,
  now,
  query: { complete: true, freshOverride: false, attempts, ...query },
});

test("exact SHA/context current direct success retains opaque identity", () => {
  assert.deepEqual(reusableValidation(input()), {
    reuse: true,
    reason: "current-direct-success",
    sha,
    source,
  });
});

test("every unsupported or unresolved fact selects ordinary validation", () => {
  for (const changed of [
    { sha: "b".repeat(40) },
    { repo: "untrusted/project" },
    { ref: "fork" },
    { event: "pull_request" },
    { workflow: "other.yml" },
    { context: "changed" },
    { configuration: "changed" },
    { unit: "other" },
    { outcome: "pending" },
    { outcome: "failure" },
    { direct: false },
    { current: false },
    { order: undefined },
    { validatedAt: 0 },
    { validatedAt: now + 1 },
    { validUntil: now },
    { validUntil: undefined },
    { url: undefined },
    { runId: "" },
    { attemptId: "" },
  ])
    assert.equal(
      reusableValidation(input([{ ...source, ...changed }])).reuse,
      false,
      JSON.stringify(changed),
    );
  for (const query of [
    { complete: false },
    { freshOverride: true },
    { freshOverride: undefined },
    { attempts: [] },
    { attempts: [null] },
    { attempts: [source, source] },
  ])
    assert.equal(reusableValidation(input(undefined, query)).reuse, false);
  assert.equal(
    reusableValidation({ ...input(), targetRef: "release" }).reuse,
    false,
  );
  assert.equal(
    reusableValidation({ ...input(), policy: undefined }).reuse,
    false,
  );
  assert.equal(
    reusableValidation({ ...input(), sha: "a".repeat(41) }).reuse,
    false,
  );
});

test("newer unresolved attempts prevent reuse, proved later success supersedes them without sorting IDs", () => {
  const newer = {
    ...source,
    runId: "run:opaque/a",
    attemptId: "alpha",
    order: 18000,
    outcome: "pending",
  };
  assert.equal(reusableValidation(input([source, newer])).reuse, false);
  assert.equal(
    reusableValidation(input([source, { ...newer, outcome: "failure" }])).reuse,
    false,
  );
  assert.equal(
    reusableValidation(input([source, { ...newer, order: source.order }]))
      .reason,
    "ambiguous-order",
  );
  const latest = {
    ...newer,
    attemptId: "beta",
    outcome: "success",
    order: 19000,
  };
  assert.equal(
    reusableValidation(input([source, latest])).source.attemptId,
    "beta",
  );
});
