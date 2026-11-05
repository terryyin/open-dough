// Why Intent's CI status tab shows no CI proof of a ciAdapter attempt
// (../src/IntentCiProof.tsx, ../server/ciAdapterProof.ts): when the adapter
// answers no proof read, gives its own reason, or answers what is not this
// attempt's valid summary, or when another discovered attempt shares the
// shown attemptId at its revision (asked of no adapter), one line says why,
// with no counts and the verdict unchanged, and Check again reads both again.
// An adapter attempt's shown proof: ./intent-ci-proof-adapter.spec.ts; a
// time limit or non-JSON answer:
// ../../tests/support/dashboard-ci-adapter-proof.test.mjs.

import { expect, test } from "./dashboardTest.ts";
import {
  adapterProject,
  type Answers,
  openAdapterProof,
  passed,
  testsRow,
  testsSummary,
  verdict,
} from "./intentCiAdapterProofProject.ts";
import { login, repository, signup } from "./intentCiStoryRecords.ts";

test.setTimeout(90_000);

test("an adapter attempt whose adapter answers no proof of it gives one reason under Proof, no counts and an unchanged verdict, and Check again reads both again", async ({
  page,
  dashboard,
}) => {
  const adapter = adapterProject(dashboard.home);
  const discover = { main: [passed("r1", "2", login, "main")] };
  const summary = testsSummary("2", login).summary as Record<string, unknown>;
  const cases: readonly [
    readonly [string, Omit<Answers, "discover">],
    ...(readonly [string, Omit<Answers, "discover">])[],
  ] = [
    [
      // An adapter that predates proof exits nonzero for it.
      "This attempt's CI adapter answered no proof read: it exited with status 2 (unknown operation: proof).",
      { proof: {}, proofStderr: "unknown operation: proof" },
    ],
    [
      "This attempt's CI adapter gave no CI proof summary: no summary retained.",
      { proof: { unavailable: "no summary retained" } },
    ],
    [
      "This attempt's CI proof summary is not a valid summary: schemaVersion is not 1.",
      { proof: { summary: { ...summary, schemaVersion: 2 } } },
    ],
    [
      "This attempt's CI proof summary is for another repository, attempt or revision: it names repository someone/else.",
      { proof: { summary: { ...summary, repository: "someone/else" } } },
    ],
    [
      `This attempt's CI proof summary is for another repository, attempt or revision: it names revision ${signup}.`,
      { proof: { summary: { ...summary, revision: signup } } },
    ],
    [
      // Past the runner's answer limit.
      "This attempt's CI adapter answered no proof read: its answer is longer than 64 KiB.",
      { proof: { summary: { ...summary, padding: "x".repeat(64 * 1024) } } },
    ],
    [
      "This attempt's CI adapter answered no proof read: CI adapter proof must return summary or unavailable.",
      { proof: { attempts: [] } },
    ],
  ];
  adapter.answer({ discover, ...cases[0][1] });
  const { panel, proof } = await openAdapterProof(page);
  const reason = proof.locator(".intent-ci-proof-unavailable");

  for (const [index, [line, answer]] of cases.entries()) {
    await test.step(line, async () => {
      if (index > 0) {
        const discovers = adapter.discoverRequests().length;
        adapter.answer({ discover, ...answer });
        await panel.getByRole("button", { name: "Check again" }).click();
        await expect(reason).toHaveText([line]);
        expect(adapter.discoverRequests().length).toBeGreaterThan(discovers);
      } else await expect(reason).toHaveText([line]);
      expect(adapter.proofRequests()).toHaveLength(index + 1);
      await expect(panel.locator(".intent-ci-state")).toHaveText(verdict);
      await expect(proof.locator(".intent-ci-proof-run")).toHaveText(
        "Attempt 2 at 4774f60.",
      );
      await expect(proof.getByRole("listitem")).toHaveCount(0);
      await expect(proof).not.toContainText(/failed|passed/i);
    });
  }
});

test("a retried adapter attempt shows the retry's verdict and proof, and a summary of the earlier attempt names another attempt", async ({
  page,
  dashboard,
}) => {
  const adapter = adapterProject(dashboard.home);
  const discover = {
    main: [
      {
        ...passed("r1", "2", login, "main"),
        time: "2026-10-01T01:00:00Z",
      },
      {
        ...passed("r1", "1", login, "main"),
        outcome: "failure",
        time: "2026-10-01T00:00:00Z",
      },
    ],
  };
  adapter.answer({ discover, proof: testsSummary("2", login) });
  const { panel, proof } = await openAdapterProof(page);

  await expect(panel.locator(".intent-ci-state")).toHaveText(verdict);
  await expect(proof.locator(".intent-ci-proof-run")).toHaveText(
    "Attempt 2 at 4774f60.",
  );
  await expect(proof.getByRole("listitem")).toHaveText([testsRow]);

  adapter.answer({ discover, proof: testsSummary("1", login) });
  await panel.getByRole("button", { name: "Check again" }).click();
  await expect(proof.locator(".intent-ci-proof-unavailable")).toHaveText([
    "This attempt's CI proof summary is for another repository, attempt or revision: it names attempt 1.",
  ]);
  await expect(proof.getByRole("listitem")).toHaveCount(0);
  await expect(panel.locator(".intent-ci-state")).toHaveText(verdict);
  const asked = {
    operation: "proof",
    check: { repo: repository, branch: "main" },
    attempt: { runId: "r1", attemptId: "2", sha: login },
  };
  expect(adapter.proofRequests()).toEqual([asked, asked]);
});

test("an adapter attempt whose attemptId another discovered attempt shares at its revision is ambiguous, and no adapter is asked its proof", async ({
  page,
  dashboard,
}) => {
  const adapter = adapterProject(dashboard.home);
  const ambiguous =
    "This attempt is ambiguous at its revision: another discovered attempt is also attempt 1 at 4774f60.";
  const cases: readonly {
    readonly name: string;
    readonly main: readonly unknown[];
  }[] = [
    {
      // Different checks both keep their newest attempt.
      name: "different checks",
      main: [
        { ...passed("r1", "1", login, "main"), check: "unit" },
        { ...passed("r2", "1", login, "main"), check: "lint" },
      ],
    },
    {
      // Same check: only the newer run is retained for the verdict, but the
      // earlier run's same attemptId still makes the shown attempt ambiguous.
      name: "same check across runs",
      main: [
        {
          ...passed("r2", "1", login, "main"),
          check: "unit",
          time: "2026-10-01T01:00:00Z",
        },
        {
          ...passed("r1", "1", login, "main"),
          check: "unit",
          time: "2026-10-01T00:00:00Z",
        },
      ],
    },
  ];

  for (const { name, main } of cases) {
    await test.step(name, async () => {
      adapter.answer({
        discover: { main },
        proof: testsSummary("1", login),
      });
      const { panel, proof } = await openAdapterProof(page);

      await expect(panel.locator(".intent-ci-state")).toHaveText(verdict);
      await expect(proof.locator(".intent-ci-proof-run")).toHaveText(
        "Attempt 1 at 4774f60.",
      );
      await expect(proof.locator(".intent-ci-proof-unavailable")).toHaveText([
        ambiguous,
      ]);
      await expect(proof.getByRole("listitem")).toHaveCount(0);
      const discovers = adapter.discoverRequests().length;
      await panel.getByRole("button", { name: "Check again" }).click();
      await expect
        .poll(() => adapter.discoverRequests().length)
        .toBeGreaterThan(discovers);
      await expect(proof.locator(".intent-ci-proof-unavailable")).toHaveText([
        ambiguous,
      ]);
      await expect(panel.locator(".intent-ci-state")).toHaveText(verdict);
      expect(adapter.proofRequests()).toEqual([]);
    });
  }
});
