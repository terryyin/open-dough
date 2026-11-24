// The Intent CI homepage shows an adapter's absence without replacing the
// verdict, styles a size-limit problem, and skips unreadable ambiguous attempts
// even after checking again.
import { expect, test, vi } from "vitest";
import { makeMe } from "../../../Distribution/tests/support/pageMakeMe.mjs";
import type { IntentCiReadSource } from "../../src/intentCiReadSource.ts";
import { intentCiProof } from "./intent-attempt-proof-page.ts";
import { mountIntentCiPage } from "./intent-ci-page-mount.ts";
import {
  fullSha,
  inertCiReads,
  judgedStatus,
  openDoughSource,
  unconfiguredIntentReads,
} from "./intent-ci-status-fixtures.ts";
import { intentCiStatus } from "./intent-ci-status-page.ts";

const shortRevision = "4774f60";
const revision = fullSha(shortRevision);
const work = makeMe.aPublishedWork.of(openDoughSource).at(revision).please();
const verdict = "Passed at 4774f60 (Add login)";
const judgment = judgedStatus("main", "pass", revision, "Add login", {
  ciAdapter: true,
  runBranch: "main",
  adapterAttempt: { runId: 7, attemptId: 1 },
});
const noSummaryLine =
  "This attempt's CI adapter gave no CI proof summary: no summary retained.";

test("ordinary adapter absence is quiet and Check again reads proof for the newly checked judgment", async () => {
  const recovered = makeMe.aCiProof
    .summaryForAdapter(
      { attemptId: "1", revision },
      [makeMe.aCiProofEntry.at("tests").counting(5, "file").please()],
      openDoughSource.repository,
    )
    .please();
  const readStatus = vi
    .fn<IntentCiReadSource["readStatus"]>()
    .mockResolvedValueOnce(judgment)
    .mockResolvedValue({ ...judgment, checkedAt: "2026-11-05T12:01:00.000Z" });
  const readProof = vi
    .fn<IntentCiReadSource["readProof"]>()
    .mockResolvedValueOnce(
      makeMe.aCiProof.unavailable("none", "no summary retained").please(),
    )
    .mockResolvedValue(recovered);
  await mountIntentCiPage({
    work,
    reads: {
      intent: unconfiguredIntentReads,
      ci: inertCiReads({ readStatus, readProof }),
    },
  });
  const ci = intentCiStatus();
  const proof = intentCiProof();
  const reason = proof.proof.getByText(noSummaryLine, { exact: true });

  await ci.answers(verdict);
  await proof.showsAttemptAndRevision("Attempt 1", shortRevision);
  await expect.element(reason).toBeVisible();
  await expect.element(proof.table).not.toBeInTheDocument();
  await expect.element(proof.proof.getByRole("row")).not.toBeInTheDocument();
  expect(getComputedStyle(reason.element()).borderLeftWidth).toBe("0px");

  await ci.checkAgain();
  await proof.showsRows([["tests", "5 passed test files", "No timings"]]);
  await proof.showsAttemptAndRevision("Attempt 1", shortRevision);
  await expect.element(reason).not.toBeInTheDocument();
  await ci.answers(verdict);
  expect(await ci.showsChecked()).toBe("2026-11-05T12:01:00.000Z");
  expect(
    readStatus.mock.calls.map(([source, branch]) => [source, branch]),
  ).toEqual([
    [openDoughSource, "main"],
    [openDoughSource, "main"],
  ]);
  const subject = { runId: "7", attemptId: "1", branch: "main", revision };
  expect(
    readProof.mock.calls.map(([source, requested]) => [source, requested]),
  ).toEqual([
    [openDoughSource, subject],
    [openDoughSource, subject],
  ]);
});

test("oversized adapter proof shows a problem border and no counts under the passing verdict", async () => {
  await mountIntentCiPage({
    work,
    reads: {
      intent: unconfiguredIntentReads,
      ci: inertCiReads({
        readStatus: () => Promise.resolve(judgment),
        readProof: () =>
          Promise.resolve(makeMe.aCiProof.tooLarge(1_048_576).please()),
      }),
    },
  });
  const proof = intentCiProof();
  const reason = proof.proof.getByText(
    "This attempt's CI proof is larger than the 1 MiB proof limit.",
    { exact: true },
  );
  await intentCiStatus().answers(verdict);
  await proof.showsAttemptAndRevision("Attempt 1", shortRevision);
  await expect.element(reason).toBeVisible();
  await expect.element(proof.table).not.toBeInTheDocument();
  await expect.element(proof.proof.getByRole("row")).not.toBeInTheDocument();

  const probe = document.createElement("span");
  probe.style.color = "var(--problem)";
  document.body.append(probe);
  const problemColour = getComputedStyle(probe).color;
  probe.remove();
  const border = getComputedStyle(reason.element());
  expect(border.borderLeftWidth).toBe("4px");
  expect(border.borderLeftColor).toBe(problemColour);
});

test("the passing retry's judgment asks for that attempt's proof and shows its counts", async () => {
  const retry = { runId: "pipeline", attemptId: "2" };
  const retryJudgment = judgedStatus("main", "pass", revision, "Add login", {
    ciAdapter: true,
    runBranch: "main",
    adapterAttempt: retry,
  });
  const summary = makeMe.aCiProof
    .summaryForAdapter(
      { attemptId: retry.attemptId, revision },
      [makeMe.aCiProofEntry.at("tests").counting(8, "file").please()],
      openDoughSource.repository,
    )
    .please();
  const readProof = vi
    .fn<IntentCiReadSource["readProof"]>()
    .mockResolvedValue(summary);
  await mountIntentCiPage({
    work,
    reads: {
      intent: unconfiguredIntentReads,
      ci: inertCiReads({
        readStatus: () => Promise.resolve(retryJudgment),
        readProof,
      }),
    },
  });

  await intentCiStatus().answers(verdict);
  const proof = intentCiProof();
  await proof.showsAttemptAndRevision("Attempt 2", shortRevision);
  await proof.showsRows([["tests", "8 passed test files", "No timings"]]);
  expect(
    readProof.mock.calls.map(([source, subject]) => [source, subject]),
  ).toEqual([
    [
      openDoughSource,
      { runId: "pipeline", attemptId: "2", branch: "main", revision },
    ],
  ]);
});

test("an ambiguous adapter attempt keeps its explanation without a proof read after Check again", async () => {
  const ambiguousJudgment = {
    ...judgment,
    adapterAttempt: { runId: 7, attemptId: 1, ambiguous: true as const },
  };
  const refreshedAt = "2026-11-05T12:01:00.000Z";
  const readStatus = vi
    .fn<IntentCiReadSource["readStatus"]>()
    .mockResolvedValueOnce(ambiguousJudgment)
    .mockResolvedValue({ ...ambiguousJudgment, checkedAt: refreshedAt });
  const readProof = vi
    .fn<IntentCiReadSource["readProof"]>()
    .mockResolvedValue(makeMe.aCiProof.unavailable("none").please());
  await mountIntentCiPage({
    work,
    reads: {
      intent: unconfiguredIntentReads,
      ci: inertCiReads({ readStatus, readProof }),
    },
  });
  const ci = intentCiStatus();
  const proof = intentCiProof();
  const reason = proof.proof.getByText(
    "This attempt is ambiguous at its revision: another discovered attempt is also attempt 1 at 4774f60.",
    { exact: true },
  );

  await ci.answers(verdict);
  await proof.showsAttemptAndRevision("Attempt 1", shortRevision);
  await expect.element(reason).toBeVisible();
  await expect.element(proof.proof.getByRole("row")).not.toBeInTheDocument();
  expect(readProof).not.toHaveBeenCalled();

  await ci.checkAgain();
  await expect.poll(() => ci.showsChecked()).toBe(refreshedAt);
  await ci.answers(verdict);
  await proof.showsAttemptAndRevision("Attempt 1", shortRevision);
  await expect.element(reason).toBeVisible();
  await expect.element(proof.proof.getByRole("row")).not.toBeInTheDocument();
  expect(readStatus).toHaveBeenCalledTimes(2);
  expect(readProof).not.toHaveBeenCalled();
});
