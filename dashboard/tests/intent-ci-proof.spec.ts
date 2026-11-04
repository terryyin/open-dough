// The CI proof of the run Intent's CI status tab shows a result of
// (../src/IntentCiProof.tsx): after
// the judgment, which reads as it always has, Proof names that run once --
// revision, link and attempt -- then one row per entry the run's CI
// declared, with counts, unit and any gap. The summary is the collector's
// own, served as a real zip from the run's artifact download through the
// controlled `gh` (./support/ciProofArtifacts.ts). Each other reason no
// proof can be shown, a running result's ancestor proof and the per-attempt
// memory: ./intent-ci-proof-reasons.spec.ts. Query-shape refusals of
// `parseIntentCiProofRead`: ../../tests/support/dashboard-ci-proof-parse.test.mjs.

import { expect, test } from "./dashboardTest.ts";
import { judged, runUrl } from "./intentCiStatusPage.ts";
import {
  artifactId,
  failedVerdict,
  openFailedRun,
  proofCalls,
  run,
} from "./intentCiProofPage.ts";
import { authenticatedReadEndpoint } from "../src/authenticatedReadRules.ts";
import {
  counts,
  proofSummary,
  runArtifactsAnswer,
  summaryZipAnswer,
} from "./support/ciProofArtifacts.ts";

test("a failed run with a summary shows Failed as before, then Proof of that run's revision, link and attempt with each entry's counts and parts", async ({
  page,
}) => {
  const summary = proofSummary(
    run,
    [
      ["dashboard/tests", 2],
      ["tests", 1],
    ],
    [
      ["dashboard/tests", 1, 2, "tests", counts(12)],
      ["dashboard/tests", 2, 2, "tests", counts(7, 1)],
      ["tests", 1, 1, "checks", counts(5)],
    ],
  );
  let release: () => void = () => undefined;
  const held = new Promise<void>((resolve) => {
    release = resolve;
  });
  const { published, panel, proof } = await openFailedRun(
    page,
    () => runArtifactsAnswer(run, artifactId),
    async () => {
      await held;
      return summaryZipAnswer(summary);
    },
  );

  await test.step("the verdict is shown while Proof is still being read", async () => {
    await expect(panel.locator(".intent-ci-state")).toHaveText(failedVerdict);
    await expect(proof).toContainText("Checking the CI proof of this run…");
    await expect(
      panel.locator(".intent-ci-state ~ .intent-ci-proof"),
    ).toBeVisible();
    release();
  });

  await test.step("Proof names the run once, then one row per declared entry", async () => {
    await expect(proof.locator(".intent-ci-proof-run")).toHaveText(
      "Attempt 1 of run 41 at a1b2c3d.",
    );
    await expect(proof.getByRole("link", { name: "run 41" })).toHaveAttribute(
      "href",
      runUrl,
    );
    await expect(proof.getByRole("listitem")).toHaveText([
      "dashboard/tests: 19 passed and 1 failed tests; 2 of 2 parts present.",
      "tests: 5 passed checks; 1 of 1 part present.",
    ]);
    await expect(proof.locator(".intent-ci-proof-gap")).toHaveCount(0);
    await expect(panel.locator(".intent-ci-state")).toHaveText(failedVerdict);
  });

  await test.step("Proof was read for that run's attempt by its artifact name, then one download", () => {
    expect(proofCalls(published.requests)).toEqual([
      "artifacts of run 41: ci-proof-summary-attempt-1",
      `zip ${String(artifactId)}`,
    ]);
  });
});

test("a missing part is shown as a gap and its counts are not counted", async ({
  page,
}) => {
  const present = [1, 2, 3, 5, 6, 7, 8, 9, 10, 11, 12].map(
    (part) => ["dashboard/tests", part, 12, "tests", counts(10)] as const,
  );
  const summary = proofSummary(run, [["dashboard/tests", 12]], present);
  const { proof } = await openFailedRun(
    page,
    () => runArtifactsAnswer(run, artifactId),
    () => summaryZipAnswer(summary),
  );
  await expect(proof.getByRole("listitem")).toHaveText([
    "dashboard/tests: 110 passed tests; 11 of 12 parts present; part 4 of 12 missing.",
  ]);
  await expect(proof.locator(".intent-ci-proof-gap")).toHaveText([
    "; part 4 of 12 missing",
  ]);
});

test("a CI proof query that omits the attempt is refused before asking GitHub", async ({
  page,
}) => {
  const { published, proof } = await openFailedRun(
    page,
    () => runArtifactsAnswer(run, undefined),
    () => ({ status: 404, contentType: "application/json", body: "{}" }),
  );
  // The page's own proof read has settled before any is counted.
  await expect(proof.locator(".intent-ci-proof-unavailable")).toBeVisible();
  const before = published.requests.length;
  const answer = await page.evaluate(async (url) => {
    const response = await fetch(url);
    return {
      status: response.status,
      body: (await response.json()) as unknown,
    };
  }, `${authenticatedReadEndpoint}?source=open-dough&intent=ci-proof&run=41&revision=${judged}`);
  expect(answer.status).toBe(400);
  expect(published.requests.length).toBe(before);
});
