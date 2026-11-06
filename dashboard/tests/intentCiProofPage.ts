// Intent's CI status tab with the shown run's CI proof
// (./intent/intent-ci-proof.spec.ts, ./intent/intent-ci-proof-reasons.spec.ts): Open
// Dough's trunk, whose judged run 41 failed unless `runs` lists otherwise,
// with the run's proof calls answered by `artifacts` and `zip`; the proof
// calls observed; and the judgment's own text, without Proof.

import type { Locator, Page } from "@playwright/test";
import { expect } from "./dashboardTest.ts";
import { parts } from "./dashboardPage.ts";
import {
  browseSpec,
  openDough,
  openDoughSettings,
} from "./intentCodeBrowseFixtures.ts";
import {
  chooseCiStatus,
  judged,
  publishProject,
  runUrl,
  trunkCi,
} from "./intentCiStatusPage.ts";
import type { OriginAnswer } from "./originAnswers.ts";
import { openUntilRead } from "./pageRequestNotes.ts";
import type { CiAnswerer, CiRunAnswer } from "./support/baseCiActions.ts";
import type { ProofRun } from "./support/ciProofArtifacts.ts";
import type { GhCall } from "./support/fakeGitHub.ts";

export const run: ProofRun = {
  repository: openDough.repository,
  runId: 41,
  attempt: 1,
  revision: judged,
};
export const artifactId = 9041;
export const failedVerdict = "Failed at a1b2c3d (Add login)";

export async function openFailedRun(
  page: Page,
  artifacts: () => OriginAnswer,
  zip: () => OriginAnswer | Promise<OriginAnswer>,
  runs: () => readonly CiRunAnswer[] = () => [
    { headSha: judged, conclusion: "failure", id: run.runId, url: runUrl },
  ],
) {
  const judgment = trunkCi(openDough.revision, runs);
  const ci: CiAnswerer = (call) => {
    const { request } = call;
    if (request.kind === "actions-run-artifacts") return artifacts();
    if (request.kind === "actions-artifact-zip") return zip();
    return judgment(call);
  };
  const published = publishProject(page, openDough, {
    ".planning/open-dough.json": `${openDoughSettings}\n`,
    "dashboard/tests/browse.spec.ts": browseSpec,
  });
  published.serveCi(ci);
  await openUntilRead(page);
  const { intent, intentChoice } = parts(page);
  await intentChoice.click();
  const panel = await chooseCiStatus(intent);
  return { published, panel, proof: proofOf(panel) };
}

export function proofOf(panel: Locator): Locator {
  return panel.getByRole("region", { name: "Proof" });
}

// Proof's table of declared entries (../src/CiProofTable.tsx).
export function proofTable(proof: Locator): Locator {
  return proof.getByRole("table", { name: "CI proof by declared entry" });
}

export const proofColumns = ["Entry", "Counts", "Test execution time", "Parts"];

// One body row as read across its columns: the entry path (its row header),
// then counts with their unit, test execution time, and parts present with
// any gap.
export type ProofRow = readonly [
  entry: string,
  counts: string,
  executionTime: string,
  parts: string,
];

// Proof's table has the shared column headers and exactly `rows`, in order,
// each read cell by cell under its header.
export async function expectProofRows(
  proof: Locator,
  rows: readonly ProofRow[],
  options?: { readonly timeout?: number },
) {
  const table = proofTable(proof);
  await expect(table.getByRole("columnheader")).toHaveText(
    proofColumns,
    options,
  );
  const body = table.locator("tbody").getByRole("row");
  await expect(body).toHaveCount(rows.length);
  for (const [at, [entry, ...cells]] of rows.entries()) {
    await expect(body.nth(at).getByRole("rowheader")).toHaveText(entry);
    await expect(body.nth(at).getByRole("cell")).toHaveText(cells);
  }
}

// Proof shows no entry rows at all: no table and no row of one.
export async function expectNoProofRows(proof: Locator) {
  await expect(proof.getByRole("table")).toHaveCount(0);
  await expect(proof.getByRole("row")).toHaveCount(0);
}

// The proof calls among `calls`: each artifact listing by its run and name,
// and each artifact download by its id.
export function proofCalls(calls: readonly GhCall[]): string[] {
  return calls.flatMap(({ request }) =>
    request.kind === "actions-run-artifacts"
      ? [`artifacts of run ${String(request.runId)}: ${request.name ?? ""}`]
      : request.kind === "actions-artifact-zip"
        ? [`zip ${String(request.artifactId)}`]
        : [],
  );
}

// The judgment as the homepage shows it: its text without Proof, the checked
// time and Check again.
export function verdictOf(panel: Locator): Promise<string> {
  return panel.evaluate((section) => {
    const copy = section.cloneNode(true) as HTMLElement;
    for (const shown of copy.querySelectorAll(
      ".intent-ci-proof, [role=status], button",
    ))
      shown.remove();
    return copy.textContent;
  });
}
