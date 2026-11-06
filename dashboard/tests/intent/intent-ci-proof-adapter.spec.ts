// The CI proof of a ciAdapter attempt in Intent's CI status tab
// (../../src/IntentCiProof.tsx, ../../server/ciAdapterProof.ts): the project's own
// adapter, run from the project folder as its discover is, is asked for the
// proof of the attempt the judgment shows, and its summary is shown below the
// unchanged verdict, naming the attempt by its attemptId and short revision.
// A running result's proof is its completed ancestor attempt's, and a slow
// proof read never delays the verdict. GitHub is asked for no proof. Why an
// adapter attempt shows no proof: ./intent-ci-proof-adapter-reasons.spec.ts;
// a GitHub Actions run's proof: ./intent-ci-proof.spec.ts; the runner's own
// limits:
// ../../../src/skills/dough-execute-plan/scripts/ci-command-adapter-proof.test.mjs.

import { expect, test } from "../dashboardTest.ts";
import {
  adapterProject,
  openAdapterProof,
  passed,
  testsRow,
  testsSummary,
  uuid,
  verdict,
} from "../intentCiAdapterProofProject.ts";
import { expectProofRows, proofOf } from "../intentCiProofPage.ts";
import { running } from "../intentCiStoryBoard.ts";
import {
  login,
  mainRun,
  repository,
  signup,
  started,
  toggleOnDevelopment,
} from "../intentCiStoryRecords.ts";

test.setTimeout(90_000);

test("a ciAdapter attempt's proof is read through the project's adapter and shown below its verdict, named by its attemptId", async ({
  page,
  dashboard,
}) => {
  const adapter = adapterProject(dashboard.home);
  adapter.answer({
    discover: { main: [passed(uuid, uuid, login, "main")] },
    proof: testsSummary(uuid, login),
  });
  const { ci, panel, proof } = await openAdapterProof(page);

  await test.step("the verdict reads as before; Proof names the attempt and shows its row", async () => {
    await expect(panel.locator(".intent-ci-state")).toHaveText(verdict);
    await expect(proof.locator(".intent-ci-proof-run")).toHaveText(
      `Attempt ${uuid} at 4774f60.`,
    );
    await expect(proof.getByRole("link", { name: uuid })).toHaveAttribute(
      "href",
      mainRun,
    );
    await expectProofRows(proof, [testsRow]);
    await expect(proof.locator(".intent-ci-proof-unavailable")).toHaveCount(0);
  });

  await test.step("the adapter was asked the documented proof request, and GitHub for no proof", () => {
    expect(adapter.proofRequests()).toEqual([
      {
        operation: "proof",
        check: { repo: repository, branch: "main" },
        attempt: { runId: uuid, attemptId: uuid, sha: login },
      },
    ]);
    expect(
      ci.published.requests.filter(({ request }) =>
        request.kind.startsWith("actions-"),
      ),
    ).toEqual([]);
  });

  await test.step("a numeric adapter attemptId matches the summary's text form of it", async () => {
    adapter.answer({
      discover: { main: [passed(7, 1, login, "main")] },
      proof: testsSummary("1", login),
    });
    await panel.getByRole("button", { name: "Check again" }).click();
    await expect(proof.locator(".intent-ci-proof-run")).toHaveText(
      "Attempt 1 at 4774f60.",
    );
    await expectProofRows(proof, [testsRow]);
    expect(adapter.proofRequests().at(-1)).toEqual({
      operation: "proof",
      check: { repo: repository, branch: "main" },
      attempt: { runId: "7", attemptId: "1", sha: login },
    });
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
        {
          runId: uuid,
          attemptId: uuid,
          sha: started,
          outcome: "pending",
          time: "2026-10-02T00:00:00Z",
          branch: running.branch,
        },
      ],
    },
    proof: testsSummary(ancestor, signup),
  });
  await openAdapterProof(page);
  const panel = await toggleOnDevelopment(page, running.title);
  const proof = proofOf(panel);

  await expect(panel.locator(".intent-ci-state")).toHaveText(
    "Running at 70a0001 (Start the story)",
  );
  await expect(proof.locator(".intent-ci-proof-run")).toHaveText(
    `Attempt ${ancestor} at d4e5f6a.`,
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

test("a slow adapter proof read never delays the verdict", async ({
  page,
  dashboard,
}) => {
  const adapter = adapterProject(dashboard.home);
  adapter.answer({
    discover: { main: [passed(uuid, uuid, login, "main")] },
    proof: testsSummary(uuid, login),
    proofDelayMs: 4_000,
  });
  const { panel, proof } = await openAdapterProof(page);

  await expect(panel.locator(".intent-ci-state")).toHaveText(verdict);
  await expect(proof.locator(".intent-ci-proof-checking")).toHaveText(
    "Checking the CI proof of this attempt…",
  );
  await expectProofRows(proof, [testsRow], { timeout: 15_000 });
  await expect(panel.locator(".intent-ci-state")).toHaveText(verdict);
});
