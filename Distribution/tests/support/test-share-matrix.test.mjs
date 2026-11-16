// scripts/test-share-matrix.mjs: a share's checks from the workflow matrix.
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { after, test } from "node:test";

const selector = fileURLToPath(
  new URL("../../../scripts/test-share-matrix.mjs", import.meta.url),
);
const scratch = mkdtempSync(join(tmpdir(), "test-share-matrix-"));
after(() => rmSync(scratch, { recursive: true, force: true }));

// The workflow text is the format under proof, so each case states it.
const workflowWith = (matrixLines) => `jobs:
  distribution-tests:
    runs-on: ubuntu-24.04
    strategy:
      fail-fast: false
      matrix:
${matrixLines.map((line) => `        ${line}`).join("\n")}
    steps:
      - run: bash scripts/test.sh
`;
const threeShares = workflowWith([
  "share: [1, 2, 3]",
  "include:",
  "  - share: 1",
  "    tests: skills/plan/**",
  "  - share: 2",
  "    tests: evaluation/** scripts/ci-*.sh",
]);
const labels = [
  "skills/plan/run.sh",
  "skills/plan/deep/a.test.mjs",
  "evaluation/judge.sh",
  "scripts/ci-proof.sh",
  "skills/other/check.sh",
  "scripts/check-self-installation.sh",
];

let workflows = 0;
function select(workflowText, split, discovered = labels) {
  workflows += 1;
  const workflow = join(scratch, `ci-${workflows}.yml`);
  writeFileSync(workflow, workflowText);
  const result = spawnSync(
    process.execPath,
    [selector, workflow, ...(split === undefined ? [] : [split])],
    { encoding: "utf8", input: discovered.map((l) => `${l}\0`).join("") },
  );
  return {
    ...result,
    workflow,
    selected: result.stdout.split("\0").slice(0, -1),
  };
}

test("a pattern share runs the checks its patterns match, nested folders included", () => {
  const one = select(threeShares, "1/3");
  assert.equal(one.status, 0, one.stderr);
  assert.deepEqual(one.selected, [
    "skills/plan/deep/a.test.mjs",
    "skills/plan/run.sh",
  ]);
  assert.deepEqual(select(threeShares, "2/3").selected, [
    "evaluation/judge.sh",
    "scripts/ci-proof.sh",
  ]);
});

test("the last share runs every check no earlier share claims, a new folder included", () => {
  const last = select(threeShares, "3/3", [...labels, "newfolder/fresh.sh"]);
  assert.equal(last.status, 0, last.stderr);
  assert.deepEqual(last.selected, [
    "newfolder/fresh.sh",
    "scripts/check-self-installation.sh",
    "skills/other/check.sh",
  ]);
});

test("labels come back in bytewise order, whatever order they were discovered in", () => {
  const discovered = [
    "skills/plan/b.sh",
    "skills/plan/B.sh",
    "skills/plan/_.sh",
    "skills/plan/a.sh",
  ];
  const workflow = workflowWith([
    "share: [1, 2]",
    "include:",
    "  - share: 1",
    "    tests: skills/plan/**",
  ]);
  assert.deepEqual(select(workflow, "1/2", discovered).selected, [
    "skills/plan/B.sh",
    "skills/plan/_.sh",
    "skills/plan/a.sh",
    "skills/plan/b.sh",
  ]);
});

test("no share selected runs every label once, in bytewise order", () => {
  const all = select(threeShares, undefined);
  assert.equal(all.status, 0, all.stderr);
  assert.deepEqual(all.selected, [
    "evaluation/judge.sh",
    "scripts/check-self-installation.sh",
    "scripts/ci-proof.sh",
    "skills/other/check.sh",
    "skills/plan/deep/a.test.mjs",
    "skills/plan/run.sh",
  ]);
});

const overlapping = workflowWith([
  "share: [1, 2, 3]",
  "include:",
  "  - share: 1",
  "    tests: skills/**",
  "  - share: 2",
  "    tests: skills/plan/run.sh",
]);
for (const split of ["1/3", "3/3", undefined]) {
  test(`a check two shares match is refused naming it and both shares (split ${split ?? "unset"})`, () => {
    const refused = select(overlapping, split);
    assert.equal(refused.status, 1);
    assert.equal(refused.stdout, "");
    assert.equal(
      refused.stderr,
      `FAIL: ${refused.workflow}: skills/plan/run.sh matches the patterns of shares 1 and 2.\n`,
    );
  });
}

test("a pattern that matches no check is refused naming it, also with no share selected", () => {
  const workflow = workflowWith([
    "share: [1, 2]",
    "include:",
    "  - share: 1",
    "    tests: skills/plan/** skills/gone/**",
  ]);
  for (const split of ["2/2", undefined]) {
    const refused = select(workflow, split);
    assert.equal(refused.status, 1);
    assert.match(
      refused.stderr,
      /pattern skills\/gone\/\*\* of share 1 matches no check\.\n$/,
    );
  }
});

test("an include share outside the share list is refused", () => {
  const refused = select(
    workflowWith([
      "share: [1, 2]",
      "include:",
      "  - share: 4",
      "    tests: skills/**",
    ]),
    "2/2",
  );
  assert.equal(refused.status, 1);
  assert.equal(
    refused.stderr,
    `FAIL: ${refused.workflow}: include share 4 is not in share: [1, 2].\n`,
  );
});

test("patterns on the last share are refused, since it runs the rest", () => {
  const refused = select(
    workflowWith([
      "share: [1, 2]",
      "include:",
      "  - share: 1",
      "    tests: skills/**",
      "  - share: 2",
      "    tests: evaluation/**",
    ]),
    "1/2",
  );
  assert.equal(refused.status, 1);
  assert.equal(
    refused.stderr,
    `FAIL: ${refused.workflow}: the last share 2 runs the rest and takes no patterns.\n`,
  );
});

for (const { form, matrix, message } of [
  {
    form: "a share included twice",
    matrix: [
      "  - share: 1",
      "    tests: skills/plan/**",
      "  - share: 1",
      "    tests: evaluation/**",
    ],
    message: "share 1 is included twice.",
  },
  {
    form: "tests written as a YAML list",
    matrix: ["  - share: 1", "    tests:", "      - skills/plan/**"],
    message: 'unsupported distribution-tests matrix line "tests:".',
  },
]) {
  test(`a matrix with ${form} is refused rather than read partly`, () => {
    const refused = select(
      workflowWith(["share: [1, 2]", "include:", ...matrix]),
      "2/2",
    );
    assert.equal(refused.status, 1);
    assert.equal(refused.stderr, `FAIL: ${refused.workflow}: ${message}\n`);
  });
}

test("a split that is not <i>/<n> of the declared shares is refused naming it", () => {
  for (const split of ["x", "0/3", "4/3", "1/2", "2/4"]) {
    const refused = select(threeShares, split);
    assert.equal(refused.status, 1, split);
    assert.equal(refused.stdout, "");
    assert.match(
      refused.stderr,
      new RegExp(
        `OPEN_DOUGH_TEST_SPLIT=${split} is not .* of share: \\[1, 2, 3\\]\\.\\n$`,
      ),
    );
  }
});
