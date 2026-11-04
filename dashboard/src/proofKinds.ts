// The Intent location kinds whose committed proof Intent reads, and what
// each contributes to the one case model (`./proofCases.ts`): how its proof
// files parse, how a published file's case rows derive, and the runner's own
// words for its cases. Every other proof rule (identity, reduction, counts,
// sums, slowest cases) is the case model's, and the Intent answer carries
// every kind's cases in the case model's own fields. A `gherkin` or `python`
// location implies its runner; a `typescript` or `javascript` location's
// proof format is the one its declared `runner` records. Read by the pinned
// Intent read (`../server/intentLocationsRead.ts`,
// `../server/intentProofRead.ts`), file Proof
// (`./IntentFileReading.tsx`), summaries (`./IntentSummary.tsx`) and proof
// generation (`./IntentProofGeneration.tsx`), which hand the resolved kind to
// file Proof and the explanations (`./IntentProofAbsence.tsx`).

import { parseCucumberProofFile } from "./cucumberProof.ts";
import { scenarioRowsOf } from "./gherkinScenarios.ts";
import type { CaseObservation, CaseRowsOf } from "./proofCases.ts";
import { pytestRowsOf } from "./pytestCases.ts";
import { parsePytestProofFile } from "./pytestProof.ts";

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

const counted = (count: number, one: string, many: string) =>
  `${String(count)} ${count === 1 ? one : many}`;

const scenarios = (count: number) => counted(count, "scenario", "scenarios");

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

const python: ProofKind = {
  parseFile: parsePytestProofFile,
  rowsOf: pytestRowsOf,
  words: {
    cases: (count) => counted(count, "test case", "test cases"),
    inventory: (count) => counted(count, "test function", "test functions"),
    inventoryUnavailable: "Test function total unavailable",
    caseHeader: "Test case",
    slowestCases: "Slowest test cases",
    variant: (ids) => `Parameters: ${ids.join(" | ")}`,
    costNote:
      "A sum of separate test case observations, retries included, not a run's elapsed time.",
    reference: "dough-test-optimization/references/pytest-proof.md",
  },
};

// Proof kinds a location kind implies.
const proofKinds: Readonly<Record<string, ProofKind>> = { gherkin, python };

// Location kinds whose files several runners test, so that the declared
// runner selects the proof kind, and the proof kinds those runners select.
const runnerSelectedKinds: ReadonlySet<string> = new Set([
  "typescript",
  "javascript",
]);
const runnerProofKinds: Readonly<Record<string, ProofKind>> = {};

const registered = (
  kinds: Readonly<Record<string, ProofKind>>,
  name: string | undefined,
) =>
  name !== undefined && Object.hasOwn(kinds, name) ? kinds[name] : undefined;

// The proof kind of an Intent location of `kind` declaring `runner`,
// undefined when Intent reads no proof for it.
export function proofKindOf(
  kind: string | undefined,
  runner: string | undefined,
): ProofKind | undefined {
  return kind !== undefined && runnerSelectedKinds.has(kind)
    ? registered(runnerProofKinds, runner)
    : registered(proofKinds, kind);
}
