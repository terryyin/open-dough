// The Intent location kinds whose committed proof Intent reads, and what
// each contributes to the one case model (`./proofCases.ts`): how its proof
// files parse, how a published file's case rows derive, and the runner's own
// words for its cases. Every other proof rule (identity, reduction, counts,
// sums, slowest cases) is the case model's, and the Intent answer carries
// every kind's cases in one shape (`./cucumberProof.ts`). Read by the pinned
// Intent read (`../server/intentLocationsRead.ts`,
// `../server/intentProofRead.ts`), file Proof (`./IntentProof.tsx`),
// summaries (`./IntentSummary.tsx`) and their explanations
// (`./IntentProofProblem.tsx`).

import { parseCucumberProofFile } from "./cucumberProof.ts";
import { scenarioRowsOf } from "./gherkinScenarios.ts";
import type { CaseObservation, CaseRowsOf } from "./proofCases.ts";

// How a kind names its cases wherever Proof and summaries count or show
// them.
export type ProofKindWords = {
  // A count of case rows, as the Proof count line and summed duration count
  // them.
  readonly cases: (count: number) => string;
  // A summary's inventory of definitions in its read files, and the line
  // naming that total as unavailable.
  readonly inventory: (count: number) => string;
  readonly inventoryUnavailable: string;
  // The case column's header in file Proof and the slowest cases.
  readonly caseHeader: string;
  readonly slowestCases: string;
  // How a varied case's variant reads after its name.
  readonly variant: (variant: readonly string[]) => string;
  readonly costNote: string;
  // Where an agent in this project finds how to record proof: the reference
  // as its installed Open Dough skills hold it.
  readonly reference: string;
};

export type ProofKind = {
  readonly parseFile: (text: string) => readonly CaseObservation[] | undefined;
  readonly rowsOf: CaseRowsOf;
  readonly words: ProofKindWords;
};

const scenarios = (count: number) =>
  `${String(count)} ${count === 1 ? "scenario" : "scenarios"}`;

const gherkin: ProofKind = {
  parseFile: parseCucumberProofFile,
  rowsOf: (text) => scenarioRowsOf(text),
  words: {
    cases: scenarios,
    inventory: scenarios,
    inventoryUnavailable: "Scenario total unavailable",
    caseHeader: "Scenario",
    slowestCases: "Slowest scenarios",
    variant: (cells) => `Example: ${cells.join(" | ")}`,
    costNote:
      "A sum of separate scenario observations, retries included, not a run's elapsed time.",
    reference: "dough-test-optimization/references/cucumber-proof.md",
  },
};

const proofKinds: Readonly<Record<string, ProofKind>> = { gherkin };

// The proof kind of an Intent location kind, undefined when Intent reads no
// proof for it.
export function proofKindOf(kind: string | undefined): ProofKind | undefined {
  return kind !== undefined && Object.hasOwn(proofKinds, kind)
    ? proofKinds[kind]
    : undefined;
}
