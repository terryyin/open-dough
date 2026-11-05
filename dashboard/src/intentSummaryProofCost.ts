// Summed proof cost of a location or folder summary
// (`./IntentProofSummary.tsx`): the last successful proof durations of the
// read files' case rows (`./intentSummaryCoverage.ts`), with how many rows
// that covers, labelled Partial like the count line, and when and from which
// commits those observations finished, and its slowest counted rows. Rows
// without successful proof add no duration, and a selection with none says
// its duration is unknown, never zero. The selection's and each child's
// figures come from one rule over one walk of the read files
// (`summaryFiguresFor`).

import {
  coverageLabelledLine,
  coverageOf,
  observedRowsForFiles,
  type CoverageTally,
  type SummaryChild,
  type SummaryFileStatus,
} from "./intentSummaryCoverage.ts";
import type {
  CaseRowsOf,
  LatestProof,
  ObservedRow,
  SuccessfulCaseObservation,
} from "./proofCases.ts";
import type { ProofKindWords } from "./proofKinds.ts";
import { durationWords } from "./proofDurationWords.ts";
import { reviewFileOrder, reviewFileTree } from "./reviewFileTree.ts";

// The summed cost of the case rows of read files: counted rows are those
// with a latest successful observation, and the spread is their oldest and
// newest finish and distinct commits.
export type ProofCost = {
  readonly summedMs: number;
  readonly covered: number;
  readonly cases: number;
  readonly oldest: string | undefined;
  readonly newest: string | undefined;
  readonly commits: readonly string[];
};

export function proofCostOf(
  observed: readonly (SuccessfulCaseObservation | undefined)[],
): ProofCost {
  let summedMs = 0;
  let covered = 0;
  let oldest: string | undefined;
  let newest: string | undefined;
  const commits = new Set<string>();
  for (const observation of observed) {
    if (observation === undefined) continue;
    summedMs += observation.durationMs;
    covered += 1;
    commits.add(observation.commit);
    const finished = Date.parse(observation.finishedAt);
    if (oldest === undefined || finished < Date.parse(oldest)) {
      oldest = observation.finishedAt;
    }
    if (newest === undefined || finished > Date.parse(newest)) {
      newest = observation.finishedAt;
    }
  }
  return {
    summedMs,
    covered,
    cases: observed.length,
    oldest,
    newest,
    commits: [...commits],
  };
}

export function proofCostLineFor(
  coverage: CoverageTally,
  cost: ProofCost,
  words: ProofKindWords,
): string {
  return coverageLabelledLine(
    coverage,
    cost.covered === 0
      ? "Summed duration of last successful proof unknown"
      : `Summed duration of last successful proof: ${durationWords(cost.summedMs)} over ${String(cost.covered)} of ${words.cases(cost.cases)}`,
    "Summed duration unavailable",
  );
}

const utcDay = (at: string) =>
  new Date(Date.parse(at)).toISOString().slice(0, 10);
const utcMinute = (at: string) =>
  new Date(Date.parse(at)).toISOString().slice(11, 16);

// When the counted observations finished, oldest to newest in UTC, and from
// which commit or how many commits; undefined without counted rows.
export function proofSpreadLine(cost: ProofCost): string | undefined {
  const { oldest, newest, commits, covered } = cost;
  if (oldest === undefined || newest === undefined) return undefined;
  const noun = covered === 1 ? "Observation" : "Observations";
  const sameDay = utcDay(oldest) === utcDay(newest);
  let when: string;
  if (sameDay && utcMinute(oldest) === utcMinute(newest)) {
    when = `at ${utcMinute(oldest)} UTC on ${utcDay(oldest)}`;
  } else if (sameDay) {
    when = `between ${utcMinute(oldest)} and ${utcMinute(newest)} UTC on ${utcDay(oldest)}`;
  } else {
    when = `between ${utcDay(oldest)} ${utcMinute(oldest)} and ${utcDay(newest)} ${utcMinute(newest)} UTC`;
  }
  const from =
    commits.length === 1
      ? `commit ${(commits[0] ?? "").slice(0, 7)}`
      : `${String(commits.length)} commits`;
  return `${noun} finished ${when}, from ${from}.`;
}

// One counted case row of a summary's slowest list.
export type SlowestRow = ObservedRow & {
  readonly observation: SuccessfulCaseObservation;
};

const slowestLimit = 10;

const counted = (row: ObservedRow): row is SlowestRow =>
  row.observation !== undefined;

// The one walk of a summary's read files (`observedRowsForFiles`): each read
// file's case rows matched to the latest observations, by file path. The
// selection's and every child's figures are sliced from it.
type SummaryWalk = ReadonlyMap<string, readonly ObservedRow[]>;

function summaryWalkOf(
  files: readonly string[],
  textOf: (path: string) => string | undefined,
  rowsOf: CaseRowsOf,
  latest: LatestProof,
): SummaryWalk {
  const byPath = new Map<string, ObservedRow[]>();
  for (const row of observedRowsForFiles(files, textOf, rowsOf, latest)) {
    const rows = byPath.get(row.path);
    if (rows === undefined) byPath.set(row.path, [row]);
    else rows.push(row);
  }
  return byPath;
}

// The figures a summary shows for a set of files: coverage, inventory total
// (the definitions its rows stand at: one per file and definition line), the
// observations its count and cost lines read, summed cost, spread, and its
// slowest counted rows, slowest first; equal durations keep tree order, then
// source order. At most ten.
export type SummaryFigures = {
  readonly coverage: CoverageTally;
  readonly inventoryCount: number;
  readonly observed: readonly (SuccessfulCaseObservation | undefined)[];
  readonly cost: ProofCost;
  readonly spread: string | undefined;
  readonly slowest: readonly SlowestRow[];
};

// The one summary figures rule, over the rows of `files` in a walk.
function figuresOfWalk(
  files: readonly string[],
  statusOf: (path: string) => SummaryFileStatus,
  walk: SummaryWalk,
): SummaryFigures {
  const rows = reviewFileOrder(
    reviewFileTree(files.map((path) => ({ path }))),
  ).flatMap(({ path }) => walk.get(path) ?? []);
  const observed = rows.map(({ observation }) => observation);
  const cost = proofCostOf(observed);
  return {
    coverage: coverageOf(files, statusOf),
    inventoryCount: new Set(
      rows.map(({ path, row }) => JSON.stringify([path, row.line])),
    ).size,
    observed,
    cost,
    spread: proofSpreadLine(cost),
    slowest: rows
      .filter(counted)
      .sort((a, b) => b.observation.durationMs - a.observation.durationMs)
      .slice(0, slowestLimit),
  };
}

export type ChildFigures = SummaryChild & { readonly figures: SummaryFigures };

// A summary's figures for its selection and each immediate child, from one
// walk of the selection's read files.
export function summaryFiguresFor(
  files: readonly string[],
  childList: readonly SummaryChild[],
  statusOf: (path: string) => SummaryFileStatus,
  textOf: (path: string) => string | undefined,
  rowsOf: CaseRowsOf,
  latest: LatestProof,
): {
  readonly selection: SummaryFigures;
  readonly children: readonly ChildFigures[];
} {
  const walk = summaryWalkOf(files, textOf, rowsOf, latest);
  return {
    selection: figuresOfWalk(files, statusOf, walk),
    children: childList.map((child) => ({
      ...child,
      figures: figuresOfWalk(child.files, statusOf, walk),
    })),
  };
}
