// scripts/test-share-declaration.mjs: any job's shards from the workflow, a
// browser group's caller job as well as the distribution-tests matrix.
import assert from "node:assert/strict";
import { test } from "node:test";
import { readShareDeclaration } from "../../../scripts/test-share-declaration.mjs";
import { selectShare } from "../../../scripts/test-share-matrix.mjs";

const file = "ci.yml";

// The workflow text is the format under proof, so each case states it.
const callerWith = (inputLines, job = "dashboard-backend") => `jobs:
  e2e:
    uses: ./.github/workflows/browser-test-group.yml
    with:
      group: e2e
      shards: "[1, 2]"
      specs: |
        1: e2e/other/**
  ${job}:
    uses: ./.github/workflows/browser-test-group.yml
    with:
      group: ${job}
      settings: OPEN_DOUGH_DASHBOARD_BACKEND
${inputLines.map((line) => `      ${line}`).join("\n")}
  ci-proof:
    runs-on: ubuntu-24.04
`;
const threeShards = callerWith([
  "# Starting shards: the story's plan.",
  'shards: "[1, 2, 3]"',
  "specs: |",
  "  1: backend-tests/launches/** backend-tests/runtime/**",
  "  2: backend-tests/sessions/**",
  "lint: true",
]);
const labels = [
  "backend-tests/launches/agent-a.spec.ts",
  "backend-tests/runtime/deep/b.spec.ts",
  "backend-tests/sessions/c.spec.ts",
  "backend-tests/intent/d.spec.ts",
];

const read = (text, job = "dashboard-backend") =>
  readShareDeclaration(text, file, job);

test("a caller job's shards input lists its shards and its specs block gives each one's patterns", () => {
  const declared = read(threeShards);
  assert.deepEqual(selectShare(declared, labels, "1"), [
    "backend-tests/launches/agent-a.spec.ts",
    "backend-tests/runtime/deep/b.spec.ts",
  ]);
  assert.deepEqual(selectShare(declared, labels, "2"), [
    "backend-tests/sessions/c.spec.ts",
  ]);
  assert.deepEqual(
    selectShare(declared, [...labels, "backend-tests/fresh/e.spec.ts"], "3"),
    ["backend-tests/fresh/e.spec.ts", "backend-tests/intent/d.spec.ts"],
  );
});

test("a caller job and a matrix declaring the same shares read alike", () => {
  const matrix = `jobs:
  distribution-tests:
    strategy:
      matrix:
        share: [1, 2, 3]
        include:
          - share: 1
            tests: backend-tests/launches/** backend-tests/runtime/**
          - share: 2
            tests: backend-tests/sessions/**
    steps:
      - run: bash scripts/test.sh
`;
  assert.deepEqual(read(threeShards), read(matrix, "distribution-tests"));
  assert.deepEqual(read(threeShards).shares, ["1", "2", "3"]);
});

test("a one-shard caller job needs no specs and runs every spec", () => {
  const declared = read(callerWith(['shards: "[1]"']));
  assert.deepEqual(declared.shares, ["1"]);
  assert.deepEqual(declared.patterns, new Map());
  assert.equal(selectShare(declared, labels, "1").length, labels.length);
});

test("a caller job's overlapping patterns are refused by the one selection rule", () => {
  const declared = read(
    callerWith([
      'shards: "[1, 2, 3]"',
      "specs: |",
      "  1: backend-tests/**",
      "  2: backend-tests/sessions/**",
    ]),
  );
  assert.throws(() => selectShare(declared, labels, "3"), {
    message: `FAIL: ${file}: backend-tests/sessions/c.spec.ts matches the patterns of shares 1 and 2.`,
  });
});

for (const { form, inputs, message } of [
  {
    form: "a specs shard outside the shards list",
    inputs: ['shards: "[1, 2]"', "specs: |", "  4: backend-tests/**"],
    message: "specs shard 4 is not in shards: [1, 2].",
  },
  {
    form: "patterns on the last shard",
    inputs: ['shards: "[1]"', "specs: |", "  1: backend-tests/**"],
    message: "the last shard 1 runs the rest and takes no patterns.",
  },
  {
    form: "a shard but the last with no patterns",
    inputs: ['shards: "[1, 2, 3]"', "specs: |", "  1: backend-tests/**"],
    message: "shard 2 has no specs patterns.",
  },
  {
    form: "a shard given twice",
    inputs: [
      'shards: "[1, 2, 3]"',
      "specs: |",
      "  1: backend-tests/launches/**",
      "  1: backend-tests/sessions/**",
    ],
    message: "specs shard 1 is given twice.",
  },
  {
    form: "specs on one line",
    inputs: ['shards: "[1, 2]"', "specs: 1: backend-tests/**"],
    message:
      'the dashboard-backend job\'s specs input needs the block form "specs: |".',
  },
  {
    form: "a specs line that names no shard",
    inputs: ['shards: "[1, 2]"', "specs: |", "  - backend-tests/**"],
    message: 'unsupported dashboard-backend specs line "- backend-tests/**".',
  },
  {
    form: "no shards input",
    inputs: ["specs: |", "  1: backend-tests/**"],
    message: 'the dashboard-backend job needs a shards: "[1, 2, ...]" input.',
  },
]) {
  test(`a caller job with ${form} is refused rather than read partly`, () => {
    assert.throws(() => read(callerWith(inputs)), {
      message: `FAIL: ${file}: ${message}`,
    });
  });
}

test("a job the workflow does not declare is refused naming it", () => {
  assert.throws(() => read(threeShards, "dashboard-gone"), {
    message: `FAIL: ${file}: no dashboard-gone job.`,
  });
});
