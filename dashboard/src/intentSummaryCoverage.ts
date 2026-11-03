// How a Gherkin location or folder summary (`./IntentSummary.tsx`) covers its
// inventory: scenario totals and Proof count lines over successfully read
// files only, labelled Partial while any contained file is pending or unread,
// with contributing-file coverage for the selection and each immediate child
// in the browser's tree order (`./reviewFileTree.ts`). An unread file is never
// counted as passed or without successful proof. A nonempty selection with no
// readable files says its scenario total is unavailable, not zero. Summed
// proof duration over the same rows lives in `./intentSummaryProofCost.ts`.

import {
  proofIdentity,
  type SuccessfulProofObservation,
} from "./cucumberProof.ts";
import { scenarioRowsOf, type ScenarioRow } from "./gherkinScenarios.ts";
import { proofScenarioCountLine } from "./proofScenarioCountLine.ts";
import {
  reviewFileOrder,
  reviewFileTree,
  type PathBearing,
} from "./reviewFileTree.ts";

export type SummaryFileStatus = "pending" | "ready" | "failed";

export type SummaryChild = {
  readonly kind: "folder" | "file";
  readonly name: string;
  readonly path: string;
  readonly files: readonly string[];
};

type RelativeFile = PathBearing & { readonly full: string };

export function immediateChildrenOf(
  selectionPath: string,
  files: readonly string[],
): readonly SummaryChild[] {
  const prefix = `${selectionPath}/`;
  const relative: RelativeFile[] = files.flatMap((full) => {
    if (!full.startsWith(prefix)) return [];
    return [{ path: full.slice(prefix.length), full }];
  });
  return reviewFileTree(relative).map((node) => {
    if (node.kind === "file") {
      return {
        kind: "file" as const,
        name: node.name,
        path: `${selectionPath}/${node.file.path}`,
        files: [node.file.full],
      };
    }
    return {
      kind: "folder" as const,
      name: node.name,
      path: `${selectionPath}/${node.path}`,
      files: reviewFileOrder(node.children).map((file) => file.full),
    };
  });
}

export function scenarioWords(count: number): string {
  return `${String(count)} ${count === 1 ? "scenario" : "scenarios"}`;
}

export function coverageClause(options: {
  readonly readyCount: number;
  readonly inventory: number;
  readonly pendingCount: number;
  readonly failedCount: number;
}): string {
  const { readyCount, inventory, pendingCount, failedCount } = options;
  const parts = [`across ${String(readyCount)} of ${String(inventory)} files`];
  if (pendingCount > 0) {
    parts.push(
      `${String(pendingCount)} ${pendingCount === 1 ? "file" : "files"} reading`,
    );
  }
  if (failedCount > 0) {
    parts.push(
      `${String(failedCount)} ${failedCount === 1 ? "file" : "files"} unread`,
    );
  }
  return parts.join("; ");
}

export type CoverageTally = {
  readonly inventory: number;
  readonly readyCount: number;
  readonly pendingCount: number;
  readonly failedCount: number;
  readonly incomplete: boolean;
};

export function coverageOf(
  files: readonly string[],
  statusOf: (path: string) => SummaryFileStatus,
): CoverageTally {
  let readyCount = 0;
  let pendingCount = 0;
  let failedCount = 0;
  for (const path of files) {
    const status = statusOf(path);
    if (status === "ready") readyCount += 1;
    else if (status === "pending") pendingCount += 1;
    else failedCount += 1;
  }
  return {
    inventory: files.length,
    readyCount,
    pendingCount,
    failedCount,
    incomplete: pendingCount > 0 || failedCount > 0,
  };
}

// One scenario row of a read file with its latest successful observation,
// if any: the single matching of rows to proof that summary totals, counts,
// sums, and slowest scenarios (`./intentSummaryProofCost.ts`) all read.
export type ObservedRow = {
  readonly path: string;
  readonly row: ScenarioRow;
  readonly observation: SuccessfulProofObservation | undefined;
};

export function observedRowsForFiles(
  files: readonly string[],
  textOf: (path: string) => string | undefined,
  latest: ReadonlyMap<string, SuccessfulProofObservation>,
): readonly ObservedRow[] {
  return files.flatMap((path) => {
    const text = textOf(path);
    if (text === undefined) return [];
    return scenarioRowsOf(text).map((row) => ({
      path,
      row,
      observation: latest.get(proofIdentity({ feature: path, ...row })),
    }));
  });
}

// Labels a complete line Partial with contributing-file coverage while any
// contained file is pending or unread, and names the unavailable form when
// nothing readable has contributed yet.
export function coverageLabelledLine(
  coverage: CoverageTally,
  complete: string,
  unavailable: string,
): string {
  if (coverage.inventory > 0 && coverage.readyCount === 0) {
    return coverage.incomplete
      ? `Partial: ${unavailable} ${coverageClause(coverage)}`
      : unavailable;
  }
  if (coverage.incomplete) {
    return `Partial: ${complete} ${coverageClause(coverage)}`;
  }
  return complete;
}

export function scenarioTotalLine(
  coverage: CoverageTally,
  scenarioCount: number,
): string {
  return coverageLabelledLine(
    coverage,
    scenarioWords(scenarioCount),
    "Scenario total unavailable",
  );
}

export function proofCountLineFor(
  coverage: CoverageTally,
  observed: readonly (SuccessfulProofObservation | undefined)[],
): string {
  return coverageLabelledLine(
    coverage,
    proofScenarioCountLine(observed),
    "Proof count unavailable",
  );
}

export function latestByIdentity(
  observations: readonly SuccessfulProofObservation[],
): ReadonlyMap<string, SuccessfulProofObservation> {
  return new Map(
    observations.map((observation) => [
      proofIdentity(observation),
      observation,
    ]),
  );
}
