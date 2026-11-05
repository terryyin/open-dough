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
import { vitestRowsOf } from "./vitestCases.ts";
import { parseVitestProofFile } from "./vitestProof.ts";

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
  // The files this kind's proof is read for, as the sentence naming every
  // kind's lists them.
  readonly family: string;
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
    family: "Gherkin feature files",
  },
};

const testCases = (count: number) => counted(count, "test case", "test cases");

const testCaseCostNote =
  "A sum of separate test case observations, retries included, not a run's elapsed time.";

const python: ProofKind = {
  parseFile: parsePytestProofFile,
  rowsOf: pytestRowsOf,
  words: {
    cases: testCases,
    inventory: (count) => counted(count, "test function", "test functions"),
    inventoryUnavailable: "Test function total unavailable",
    caseHeader: "Test case",
    slowestCases: "Slowest test cases",
    variant: (ids) => `Parameters: ${ids.join(" | ")}`,
    costNote: testCaseCostNote,
    reference: "dough-test-optimization/references/pytest-proof.md",
    family: "pytest files",
  },
};

// Shared inventory and case words for runners that reuse the Vitest-shaped
// snapshot and row rule (Vitest, Playwright and node:test).
const runnerTestWords = {
  cases: testCases,
  inventory: (count: number) => counted(count, "test", "tests"),
  inventoryUnavailable: "Test total unavailable",
  caseHeader: "Test case",
  slowestCases: "Slowest test cases",
  variant: (project: readonly string[]) => `Project: ${project.join(" | ")}`,
  costNote: testCaseCostNote,
} as const;

const vitest: ProofKind = {
  parseFile: parseVitestProofFile,
  rowsOf: vitestRowsOf,
  words: {
    ...runnerTestWords,
    reference: "dough-test-optimization/references/vitest-proof.md",
    family: "Vitest tests",
  },
};

const playwright: ProofKind = {
  parseFile: parseVitestProofFile,
  rowsOf: vitestRowsOf,
  words: {
    ...runnerTestWords,
    reference: "dough-test-optimization/references/playwright-proof.md",
    family: "Playwright tests",
  },
};

const nodeTest: ProofKind = {
  parseFile: parseVitestProofFile,
  rowsOf: vitestRowsOf,
  words: {
    ...runnerTestWords,
    reference: "dough-test-optimization/references/node-test-proof.md",
    family: "Node test files",
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
const runnerProofKinds: Readonly<Record<string, ProofKind>> = {
  vitest,
  playwright,
  "node:test": nodeTest,
};

// The runners a `typescript` or `javascript` location may declare.
export const proofRunners: readonly string[] = Object.keys(runnerProofKinds);

// The files Intent reads proof for, one family per proof kind.
export const proofFamilies: readonly string[] = [
  ...Object.values(proofKinds),
  ...Object.values(runnerProofKinds),
].map((proofKind) => proofKind.words.family);

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

// Why a location of `kind` declaring proof has no proof kind: its kind
// leaves the format to a `runner` it does not declare, or declares one Intent
// reads no proof for. Undefined when the kind implies its runner or the
// declared one is read.
export const runnerProblems = ["undeclared", "unsupported"] as const;

export type RunnerProblem = (typeof runnerProblems)[number];

export function runnerProblemOf(
  kind: string,
  runner: string | undefined,
): RunnerProblem | undefined {
  if (!runnerSelectedKinds.has(kind)) return undefined;
  if (runner === undefined) return "undeclared";
  return registered(runnerProofKinds, runner) === undefined
    ? "unsupported"
    : undefined;
}

// The reference(s) a location of `kind` without recorded proof names: its
// kind's own, or for a kind whose runner selects the format, the declared
// runner's reference when Intent reads that runner, otherwise every such
// runner's. Undefined for a kind Intent reads no proof for.
export function unrecordedReferenceOf(
  kind: string | undefined,
  runner: string | undefined,
): readonly string[] | undefined {
  const own = proofKindOf(kind, runner);
  if (own !== undefined) return [own.words.reference];
  return kind !== undefined && runnerSelectedKinds.has(kind)
    ? Object.values(runnerProofKinds).map(
        (proofKind) => proofKind.words.reference,
      )
    : undefined;
}
