import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";
import { readCiPathIgnorePolicy } from "./ci-workflow-path-policy.mjs";
import { checkoutRoot } from "./ci-mailbox-location.mjs";
import { acceptedWorkflow } from "./ci-path-applicability-test-fixtures.mjs";

test("readCiPathIgnorePolicy reads the accepted literal push/pull_request paths-ignore form and workflow_dispatch presence", () => {
  const policy = readCiPathIgnorePolicy(acceptedWorkflow);
  assert.equal(policy.supported, true);
  assert.deepEqual(policy.events.push.pathsIgnore, [".planning/**", "docs/**"]);
  assert.deepEqual(policy.events.pull_request.pathsIgnore, [
    ".planning/**",
    "docs/**",
  ]);
  assert.equal(policy.workflowDispatch, true);
});

test("readCiPathIgnorePolicy fails closed for unsupported YAML forms", () => {
  const alias = acceptedWorkflow.replace(
    "      - '.planning/**'",
    "      - *shared",
  );
  assert.equal(readCiPathIgnorePolicy(alias).supported, false);

  const expression = acceptedWorkflow.replace(
    "      - '.planning/**'",
    "      - ${{ env.IGNORED }}",
  );
  assert.equal(readCiPathIgnorePolicy(expression).supported, false);

  const extraKey = acceptedWorkflow.replace(
    "  push:\n    paths-ignore:",
    "  push:\n    branches:\n      - main\n    paths-ignore:",
  );
  assert.equal(readCiPathIgnorePolicy(extraKey).supported, false);

  const unsupportedGlob = acceptedWorkflow.replace(
    "      - 'docs/**'",
    "      - 'docs/*.md'",
  );
  assert.equal(readCiPathIgnorePolicy(unsupportedGlob).supported, false);

  const noOnBlock = "name: CI\njobs:\n  check:\n    runs-on: ubuntu-24.04\n";
  assert.equal(readCiPathIgnorePolicy(noOnBlock).supported, false);

  assert.equal(readCiPathIgnorePolicy(42).supported, false);
});

test("readCiPathIgnorePolicy sees this repository's actual .github/workflows/ci.yml", () => {
  const workflowPath = join(checkoutRoot, ".github", "workflows", "ci.yml");
  const content = readFileSync(workflowPath, "utf8");
  const policy = readCiPathIgnorePolicy(content);
  assert.equal(
    policy.supported,
    true,
    "expected the narrow literal form to parse",
  );
  assert.deepEqual(policy.events.push.pathsIgnore.sort(), [
    ".planning/**",
    "docs/**",
  ]);
  assert.deepEqual(policy.events.pull_request.pathsIgnore.sort(), [
    ".planning/**",
    "docs/**",
  ]);
  assert.equal(policy.workflowDispatch, true);
});
