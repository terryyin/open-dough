// The CI proof of the run Intent's CI status tab shows a result of
// (../../src/IntentCiProof.tsx): after the judgment, which reads as it always
// has, Proof names that run once as short labels -- its linked run and attempt,
// revision and CI wall time -- then a table with one row per entry the run's CI
// declared, in its order, read cell by cell under the Entry, Counts, Test
// execution time headers (unit and any timing gap). The proof answer is
// a typed page read. Reading the run's artifacts into it, the omitted-attempt
// refusal and per-attempt memory:
// ../../backend-tests/intent/ci-proof-*.spec.ts,
// ../../backend-tests/intent/intent-ci-proof-read.spec.ts and
// ../../../e2e/intent/intent-ci-proof-{reasons,units}.spec.ts.

import { expect, test } from "vitest";
import { userEvent } from "vitest/browser";
import { makeMe } from "../../../Distribution/tests/support/pageMakeMe.mjs";
import {
  attemptUrl,
  failedVerdict,
  mountFailedAttemptProof,
  proofOfJudgedRun,
} from "./intent-attempt-proof-fixtures.ts";
import {
  intentCiProof,
  showsAttemptSummary,
} from "./intent-attempt-proof-page.ts";
import { locationNameControl } from "./intent-ci-homepage-page.ts";
import {
  heldRead,
  judgedRun,
  openDoughSource,
} from "./intent-ci-status-fixtures.ts";
import { intentCiStatus } from "./intent-ci-status-page.ts";

const notRecorded = "No timings";

test("a failed run shows Failed while its Proof is held, then Proof of that run's revision, link and attempt with each entry's counts and timing", async () => {
  const answer = proofOfJudgedRun([
    makeMe.aCiProofEntry
      .at("dashboard/tests")
      .holding(
        makeMe.aCiProofEvidence
          .inUnit("case")
          .counting(12, 0, 0)
          .inParts(2)
          .withPresentPart(2, { passed: 7, failed: 1, other: 0, untimed: 0 })
          .please(),
      )
      .please(),
    makeMe.aCiProofEntry.at("tests").counting(5, "file").please(),
    makeMe.aCiProofEntry.at("retired-tests").counting(1, "file").please(),
  ]);
  const held = heldRead<typeof answer>();
  const { readProof } = await mountFailedAttemptProof(held.ask());
  const ci = intentCiStatus();
  const proof = intentCiProof();
  const attempt = "Run 41 · attempt 1";

  await ci.answers(failedVerdict);
  await expect.element(proof.checking).toBeVisible();
  await expect
    .poll(() =>
      ci.panel
        .query()
        ?.querySelector(".intent-ci-state ~ .intent-ci-proof")
        ?.checkVisibility(),
    )
    .toBe(true);
  held.resolve(answer);

  await proof.showsAttemptAndRevision(attempt, "a1b2c3d");
  await expect
    .element(proof.attemptLink(attempt))
    .toHaveAttribute("href", attemptUrl);
  expect(proof.attemptLink(attempt).elements()).toHaveLength(1);
  await proof.showsRows([
    ["dashboard/tests", "19 passed and 1 failed test cases", notRecorded],
    ["tests", "5 passed test files", notRecorded],
    ["retired-tests", "1 passed test file", notRecorded],
  ]);
  await ci.answers(failedVerdict);
  expect(
    readProof.mock.calls.map(([source, subject]) => [source, subject]),
  ).toEqual([[openDoughSource, judgedRun]]);

  await expect
    .element(proof.entryButton("retired-tests"))
    .not.toBeInTheDocument();
  await userEvent.click(proof.entryButton("dashboard/tests"));
  await showsAttemptSummary("dashboard/tests");
  await expect
    .element(locationNameControl("dashboard/tests"))
    .toHaveAttribute("aria-pressed", "true");
});

test("an entry a location labels shows that label, opens the location, and keeps its path shown", async () => {
  await mountFailedAttemptProof(
    proofOfJudgedRun([
      makeMe.aCiProofEntry.at("e2e").counting(3, "case").please(),
      makeMe.aCiProofEntry.at("tests").counting(5, "file").please(),
    ]),
  );
  const proof = intentCiProof();
  const labelled = proof.table.getByRole("button", {
    name: "E2E Test",
    exact: true,
  });

  await expect.element(labelled).toBeVisible();
  await expect
    .element(proof.table.getByRole("rowheader", { name: "E2E Test e2e" }))
    .toBeVisible();
  await expect.element(proof.entryButton("tests")).toBeVisible();
  await userEvent.click(labelled);
  await showsAttemptSummary("e2e");
});

test("a missing part is shown as a gap and its counts are not counted", async () => {
  const evidence = makeMe.aCiProofEvidence
    .inUnit("case")
    .counting(10)
    .inParts(12, { missing: [4] });
  for (const part of [2, 3, 5, 6, 7, 8, 9, 10, 11, 12])
    evidence.withPresentPart(part, { passed: 10, untimed: 0 });
  await mountFailedAttemptProof(
    proofOfJudgedRun([
      makeMe.aCiProofEntry
        .at("dashboard/tests")
        .holding(evidence.please())
        .please(),
    ]),
  );
  const proof = intentCiProof();
  await proof.showsRows([
    ["dashboard/tests", "110 passed test cases", "Part 4 missing"],
  ]);
  await expect
    .element(
      proof.table.getByRole("cell", { name: "Part 4 missing", exact: true }),
    )
    .toHaveAccessibleDescription("Partial: part 4 of 12 missing");
});

test("an unavailable proof leaves the judgment readable and says no proof can be shown", async () => {
  await mountFailedAttemptProof(makeMe.aCiProof.unavailable("none").please());
  const { proof } = intentCiProof();
  await expect
    .element(
      proof.getByText("This run published no CI proof summary.", {
        exact: true,
      }),
    )
    .toBeVisible();
  await intentCiStatus().answers(failedVerdict);
});
