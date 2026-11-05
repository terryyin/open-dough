import assert from "node:assert/strict";
import { test } from "node:test";
import { parseCucumberProofFile } from "../../dashboard/src/cucumberProof.ts";
import { parsePytestProofFile } from "../../dashboard/src/pytestProof.ts";
import { parseVitestProofFile } from "../../dashboard/src/vitestProof.ts";

const commit = "a1b2c3d4".repeat(5);
const fileBlob = "3b18e512dba79e4c8300dd08aeb37f8e728b8dad";
const measured = {
  outcome: "passed",
  attempts: 1,
  durationMs: 42,
  finishedAt: "2026-11-04T09:00:00.000Z",
  commit,
  fileBlob,
};
const file = "frontend/tests/utils/cart.spec.ts";
const proofFile = (...observations) =>
  JSON.stringify({ version: 1, observations });

test("a Vitest observation is named by its suite path and varied by its project", () => {
  assert.deepEqual(
    parseVitestProofFile(
      proofFile(
        {
          file,
          test: ["Cart", "totals", "adds 2 items"],
          project: "chromium-touch",
          ...measured,
        },
        { file, test: ["standalone"], ...measured },
      ),
    ),
    [
      {
        file,
        name: "Cart > totals > adds 2 items",
        variant: ["chromium-touch"],
        ...measured,
      },
      { file, name: "standalone", ...measured },
    ],
  );
});

test("a fractional duration and a retried pass are read as recorded", () => {
  const [observation] =
    parseVitestProofFile(
      proofFile({
        file,
        test: ["fmtCagr", "formats fraction as percent"],
        ...measured,
        attempts: 2,
        durationMs: 0.05616700000007313,
      }),
    ) ?? [];
  assert.equal(observation?.durationMs, 0.05616700000007313);
  assert.equal(observation?.attempts, 2);
  assert.equal(observation?.variant, undefined);
});

test("a file with an empty, misspelled or unnamed observation is not Vitest proof", () => {
  for (const invalid of [
    { file, test: ["a"], project: "", ...measured },
    { file, test: ["a"], project: 3, ...measured },
    { file, test: [], ...measured },
    { file, test: ["a", 2], ...measured },
    { file, test: "a", ...measured },
    { file: "", test: ["a"], ...measured },
    { file, test: ["a"], ...measured, outcome: "failed" },
    { file, test: ["a"], ...measured, durationMs: -1 },
    { file, test: ["a"], ...measured, fileBlob: "short" },
  ]) {
    assert.equal(
      parseVitestProofFile(
        proofFile({ file, test: ["ok"], ...measured }, invalid),
      ),
      undefined,
      JSON.stringify(invalid),
    );
  }
  assert.equal(parseVitestProofFile("{"), undefined);
  assert.equal(
    parseVitestProofFile(JSON.stringify({ version: 2, observations: [] })),
    undefined,
  );
  assert.deepEqual(parseVitestProofFile(proofFile()), []);
});

test("Cucumber- and pytest-shaped files are not Vitest proof, and a Vitest file is neither", () => {
  const { fileBlob: blob, ...rest } = measured;
  const cucumber = proofFile({
    feature: "e2e_test/features/cart.feature",
    scenario: "Adds items",
    ...rest,
    featureBlob: blob,
  });
  const pytest = proofFile({
    file: "tests/test_cart.py",
    test: "test_adds",
    parameterId: "chromium",
    ...measured,
  });
  const vitest = proofFile({ file, test: ["Cart", "adds"], ...measured });
  assert.equal(parseVitestProofFile(cucumber), undefined);
  assert.equal(parseVitestProofFile(pytest), undefined);
  assert.equal(parsePytestProofFile(vitest), undefined);
  assert.equal(parseCucumberProofFile(vitest), undefined);
});

test("both frontends' first snapshots are Vitest proof as recorded", () => {
  // Doughnut's and Pygardon's committed observations' shapes, abridged.
  const doughnut = proofFile({
    file: "frontend/tests/toolbars/DonutMenu.search.touch.spec.ts",
    test: [
      "Donut menu touch search",
      "prepares input synchronously from Open search",
    ],
    project: "chromium-touch",
    outcome: "passed",
    attempts: 1,
    durationMs: 53.89999997615814,
    finishedAt: "2026-11-04T09:03:53.498Z",
    commit: "f08c51e4ce6a7309efdc7edf89bc58fa633c58cd",
    fileBlob: "7b4c0341d38e6f0a64596afe736f3ed262707020",
  });
  const pygardon = proofFile({
    file: "frontend/src/api/__tests__/verifyStatsFormat.test.ts",
    test: ["fmtCagr", "formats fraction as percent"],
    outcome: "passed",
    attempts: 1,
    durationMs: 0.05616700000007313,
    finishedAt: "2026-11-04T08:29:13.425Z",
    commit: "8dc7cad1a15a5e8f912c82199dc316ee14033eec",
    fileBlob: "36960c03d0802956e3d03f24be202a8137276b84",
  });
  assert.equal(
    parseVitestProofFile(doughnut)?.[0]?.name,
    "Donut menu touch search > prepares input synchronously from Open search",
  );
  assert.deepEqual(parseVitestProofFile(doughnut)?.[0]?.variant, [
    "chromium-touch",
  ]);
  assert.equal(
    parseVitestProofFile(pygardon)?.[0]?.name,
    "fmtCagr > formats fraction as percent",
  );
});
