import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";
import { readCiPathIgnorePolicy } from "./ci-workflow-path-policy.mjs";
import { checkoutRoot } from "./ci-mailbox-location.mjs";
import {
  acceptedWorkflow,
  allBranchesWorkflow,
} from "./ci-path-applicability-test-fixtures.mjs";

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

test("push paths-ignore accepts only the all-branches literal filter, in either key order", () => {
  for (const content of [
    allBranchesWorkflow,
    allBranchesWorkflow.replace('"**"', "'**'"),
    allBranchesWorkflow
      .replace('    branches:\n      - "**"\n', "")
      .replace("jobs:", '    branches:\n      - "**"\njobs:'),
  ]) {
    assert.deepEqual(readCiPathIgnorePolicy(content), {
      supported: true,
      workflowDispatch: false,
      events: { push: { pathsIgnore: [".planning/**", "docs/**"] } },
    });
  }
});

test("branch patterns and trigger structures outside the all-branches push form fail closed", () => {
  for (const filter of [
    '    branches:\n      - "main"',
    '    branches:\n      - "*"',
    '    branches:\n      - "release/**"',
    '    branches:\n      - "**"\n      - "!main"',
    "    branches:\n      - **",
    '    branches: ["**"]',
    "    branches:",
    '    branches-ignore:\n      - "main"',
    '    tags:\n      - "**"',
    '    branches:\n      - "**"\n    branches:\n      - "main"',
    '    branches:\n      - "**"\n    paths-ignore:\n      - "src/**"',
    '    branches:\n      - "**"\n    types:\n      - opened',
  ]) {
    assert.equal(
      readCiPathIgnorePolicy(
        allBranchesWorkflow.replace('    branches:\n      - "**"', filter),
      ).supported,
      false,
      filter,
    );
  }
  assert.equal(
    readCiPathIgnorePolicy(
      allBranchesWorkflow.replace("  push:", "  pull_request:"),
    ).supported,
    false,
  );
});

test("duplicate push triggers cannot override branch or path policy", () => {
  assert.equal(
    readCiPathIgnorePolicy(
      allBranchesWorkflow.replace(
        "jobs:",
        '  push:\n    paths-ignore:\n      - "src/**"\njobs:',
      ),
    ).supported,
    false,
  );
});
