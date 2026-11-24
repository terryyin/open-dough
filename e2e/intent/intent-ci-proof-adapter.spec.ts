import {
  ciProofReading,
  expectNoProofRows,
  expectProofRows,
  proofOf,
} from "../../dashboard/test-support/intentCiProofPage.ts";
import {
  checkCiAgain,
  expectCiAnswer,
} from "../../dashboard/test-support/intentCiStatusPage.ts";
// The CI proof of a ciAdapter attempt in Intent's CI status tab
// (../../dashboard/src/IntentCiProof.tsx, ../../dashboard/server/ciAdapterProof.ts): the project's own
// adapter, run from the project folder as its discover is, is asked for the
// proof of the attempt the judgment shows, and its summary is shown below the
// unchanged verdict, naming the attempt by its attemptId and short revision.
// A running result's proof is its completed ancestor attempt's, and a slow
// proof read never delays the verdict. GitHub is asked for no proof. Why an
// adapter attempt shows no proof: ./intent-ci-proof-adapter-reasons.spec.ts;
// a GitHub Actions run's proof: ../../dashboard/frontend-tests/intent/intent-ci-proof.spec.ts; the runner's own
// limits:
// ../../Distribution/tests/skills/dough-execute-plan/ci-command-adapter-proof.test.mjs.

import { adapterResponseBytes } from "../../Distribution/src/skills/dough-execute-plan/scripts/ci-command-run.mjs";
import { SUMMARY_READ_LIMIT_BYTES } from "../../Distribution/src/skills/dough-test-optimization/scripts/ci-proof-contract.mjs";
import { makeMe } from "../../Distribution/tests/support/makeMe.mjs";
import { expect, test } from "../../dashboard/test-support/dashboardTest.ts";
import {
  expectAttemptAt,
  expectAttemptLinked,
  expectLabelInFull,
} from "../../dashboard/test-support/ciEvidenceLabelsPage.ts";
import {
  adapterProject,
  byFileTestsRow,
  byFileTestsSummary,
  openAdapterProof,
  passed,
  testsRow,
  testsSummary,
  uuid,
  verdict,
} from "../../dashboard/test-support/intentCiAdapterProofProject.ts";

import { running } from "../../dashboard/test-support/intentCiStoryBoard.ts";
import {
  login,
  mainRun,
  repository,
  signup,
  started,
  toggleOnDevelopment,
} from "../../dashboard/test-support/intentCiStoryRecords.ts";

test("missing proof is read through the project's adapter and recovered for the same passing attempt", async ({
  page,
  dashboard,
}) => {
  const adapter =
    await test.step("Given the project has a configured CI adapter", () =>
      adapterProject(dashboard.home));
  const discover =
    await test.step("And a passing adapter attempt has no summary yet", () => {
      const discover = { main: [passed(7, 1, login, "main")] };
      adapter.answer({
        discover,
        proof: { unavailable: "no summary retained" },
      });
      return discover;
    });
  const { ci, panel, proof } =
    await test.step("When I open Intent's CI proof", () =>
      openAdapterProof(page));

  await test.step("Then the passing verdict and tested attempt are shown", async () => {
    await expectCiAnswer(panel, verdict);
    await expectAttemptAt(proof, "Attempt 1", "4774f60");
    await expectAttemptLinked(proof, "Attempt 1", mainRun);
  });
  await test.step("And the adapter's reason is shown without counts", async () => {
    await expect(ciProofReading(proof).unavailable).toHaveText([
      "This attempt's CI adapter gave no CI proof summary: no summary retained.",
    ]);
    await expectNoProofRows(proof);
  });

  await test.step("Given proof is now available for that attempt", () => {
    adapter.answer({ discover, proof: testsSummary("1", login) });
  });
  await test.step("When I check again", () => checkCiAgain(panel));
  await test.step("Then counts appear for the same attempt under the same verdict", async () => {
    await expectProofRows(proof, [testsRow]);
    await expectAttemptAt(proof, "Attempt 1", "4774f60");
    await expectCiAnswer(panel, verdict);
  });
  await test.step("And the unavailable reason is gone", async () => {
    await expect(ciProofReading(proof).unavailable).toHaveCount(0);
  });
  await test.step("And both reads ask the adapter for the same attempt using text IDs", () => {
    const request = {
      operation: "proof",
      check: { repo: repository, branch: "main" },
      attempt: { runId: "7", attemptId: "1", sha: login },
    };
    expect(adapter.proofRequests()).toEqual([request, request]);
  });
  await test.step("And no GitHub Actions request is made", () => {
    expect(
      ci.published.requests.filter(({ request }) =>
        request.kind.startsWith("actions-"),
      ),
    ).toEqual([]);
  });
});

test("a running ciAdapter story branch shows its completed ancestor attempt's proof", async ({
  page,
  dashboard,
}) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  const adapter = adapterProject(dashboard.home);
  const ancestor = "a7c3e9d1-0000-4000-8000-000000000002";
  adapter.answer({
    discover: {
      main: [passed(ancestor, ancestor, signup, "main")],
      [running.branch]: [
        makeMe.aCiAdapterAttempt
          .pending({
            runId: uuid,
            attemptId: uuid,
            sha: started,
            time: "2026-10-02T00:00:00Z",
            branch: running.branch,
          })
          .please(),
      ],
    },
    proof: testsSummary(ancestor, signup),
  });
  await openAdapterProof(page);
  const panel = await toggleOnDevelopment(page, running.title);
  const proof = proofOf(panel);

  await expectCiAnswer(panel, "Running at 70a0001 (Start the story)");
  await expectAttemptAt(proof, `Attempt ${ancestor}`, "d4e5f6a");
  await expectLabelInFull(
    proof,
    "Completed ancestor",
    "The completed ancestor of the running result",
  );
  await expectProofRows(proof, [testsRow]);
  await expect(proof).not.toContainText("70a0001");
  expect(adapter.proofRequests().at(-1)).toEqual({
    operation: "proof",
    check: { repo: repository, branch: "main" },
    attempt: { runId: ancestor, attemptId: ancestor, sha: signup },
  });
  expect(adapter.proofRequests()).not.toContainEqual(
    expect.objectContaining({
      attempt: expect.objectContaining({ sha: started }),
    }),
  );
});

test("a ciAdapter proof answer over 64 KiB with a by-file summary reaches Intent whole and is remembered", async ({
  page,
  dashboard,
}) => {
  const adapter = adapterProject(dashboard.home);
  const answer = byFileTestsSummary(uuid, login);
  const answerBytes = Buffer.byteLength(JSON.stringify(answer));
  expect(answerBytes).toBeGreaterThan(adapterResponseBytes);
  expect(answerBytes).toBeLessThanOrEqual(SUMMARY_READ_LIMIT_BYTES);
  adapter.answer({
    discover: { main: [passed(uuid, uuid, login, "main")] },
    proof: answer,
  });
  const { panel, proof } = await openAdapterProof(page);

  await expectCiAnswer(panel, verdict);
  await expectProofRows(proof, [byFileTestsRow()]);
  await expect(ciProofReading(proof).unavailable).toHaveCount(0);
  expect(adapter.proofRequests()).toHaveLength(1);

  await panel.getByRole("button", { name: "Check again" }).click();
  await expectProofRows(proof, [byFileTestsRow()]);
  await expect(ciProofReading(proof).unavailable).toHaveCount(0);
  expect(adapter.proofRequests()).toHaveLength(1);
});

test("a slow adapter proof read never delays the verdict", async ({
  page,
  dashboard,
}) => {
  const adapter = adapterProject(dashboard.home);
  adapter.answer({
    discover: { main: [passed(uuid, uuid, login, "main")] },
    proof: testsSummary(uuid, login),
    proofHeld: true,
  });
  const { panel, proof } = await openAdapterProof(page);

  await expectCiAnswer(panel, verdict);
  await expect(ciProofReading(proof).checking).toHaveText(
    "Checking the CI proof of this attempt…",
  );
  await expect.poll(() => adapter.proofRequests().length).toBeGreaterThan(0);
  await expectCiAnswer(panel, verdict);
  adapter.releaseProof();
  await expectProofRows(proof, [testsRow]);
  await expectCiAnswer(panel, verdict);
});
