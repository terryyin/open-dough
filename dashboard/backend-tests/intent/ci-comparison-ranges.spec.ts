import { expect, test } from "vitest";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import type { ListedRun } from "../../server/baseCiNearest.ts";
import { ciComparisonAnswers } from "../../server/intentCiComparisonAnswers.ts";
import { ciComparisonReader } from "../../server/intentCiComparisonRead.ts";
import { parseRequestedRead } from "../../server/requestedRead.ts";
import {
  selectedCiComparisonAnswerSchema,
  type CiComparisonRange,
} from "../../src/selectedCiComparison.ts";
import {
  baseline,
  branch,
  comparisonProject,
  completion,
  later,
  start,
} from "../support/comparisonRead.ts";
import { storyCiComparisonEvidence } from "../support/storyCiComparisonEvidence.ts";

const identity = "SEED-1#story";
const range = { start, end: completion };

function publishedEvidence(
  runs: readonly ListedRun[],
  proofs?: Parameters<typeof storyCiComparisonEvidence>[0]["proofs"],
) {
  return storyCiComparisonEvidence({
    history: makeMe.aRepository
      .withRevision(baseline)
      .withRevision(start)
      .withRevision(branch)
      .withRevision(completion)
      .withRevision(later, { parents: [start] })
      .please(),
    done: makeMe.aPublishedStoryEndpoint
      .with({ mode: "trunk", storyStart: baseline, completion })
      .please(),
    runs,
    ...(proofs === undefined ? {} : { proofs }),
  });
}

const runAt = (
  headSha: string,
  databaseId: number,
  facts: Pick<ListedRun, "attempt" | "status" | "conclusion"> = {},
) => makeMe.aRevisionCiRun.with({ headSha, databaseId, ...facts }).please();

async function readSelection(
  evidence: ReturnType<typeof publishedEvidence>,
  pair: CiComparisonRange = range,
  reader = ciComparisonReader(ciComparisonAnswers()),
  project = comparisonProject,
) {
  const read = parseRequestedRead(
    new URLSearchParams({
      intent: "ci-comparison",
      identity,
      start: pair.start,
      end: pair.end,
    }),
  );
  if (read.kind !== "intent-ci-comparison") throw new Error("No CI comparison");
  const outcome = await reader(
    project,
    read,
    new AbortController().signal,
    evidence.source,
  );
  if (outcome.kind !== "answered") throw new Error("No selected CI answer");
  return selectedCiComparisonAnswerSchema.parse(outcome.answer);
}

test("names the measured start ancestor and exact end even when an older build has the proof", async () => {
  const evidence = publishedEvidence(
    [
      runAt(baseline, 1),
      runAt(branch, 2),
      runAt(completion, 3, { attempt: 2 }),
    ],
    {
      2: makeMe.aCiProof
        .summaryFor({ revision: branch, runId: 2, runAttempt: 1 })
        .please(),
    },
  );
  expect(await readSelection(evidence)).toMatchObject({
    source: comparisonProject.id,
    identity,
    range,
    baseline: {
      kind: "build",
      revision: baseline,
      runId: 1,
      selection: "ancestor",
      laterWithoutResult: 1,
      requestedStatus: { kind: "no-build" },
    },
    selection: {
      kind: "build",
      revision: completion,
      runId: 3,
      runAttempt: 2,
      selection: "exact",
    },
  });
  expect(evidence.reads.jobs).toEqual(expect.arrayContaining(["1/1", "3/2"]));
  expect(evidence.reads.proofs).toEqual([]);
});

test("a start-only build stays one-sided and the same range can find a later CI result", async () => {
  const reader = ciComparisonReader(ciComparisonAnswers());
  const startRun = runAt(start, 1);
  const evidence = publishedEvidence([startRun]);
  expect(await readSelection(evidence, range, reader)).toMatchObject({
    baseline: { kind: "build", revision: start, runId: 1 },
    selection: {
      kind: "none",
      explanation: "No completed CI build includes the selected changes.",
    },
  });
  const updated = publishedEvidence([startRun, runAt(completion, 2)]);
  expect(await readSelection(updated, range, reader)).toMatchObject({
    selection: { kind: "build", revision: completion, runId: 2 },
  });
});

test("an end-only build describes the missing baseline independently", async () => {
  const evidence = publishedEvidence([runAt(completion, 2)]);
  expect(await readSelection(evidence)).toMatchObject({
    baseline: {
      kind: "none",
      explanation:
        "No completed CI build was found at or before the selected start.",
    },
    selection: { kind: "build", revision: completion, runId: 2 },
  });
});

test("a running end leaves the completed build on the nearest in-range ancestor visible", async () => {
  const evidence = publishedEvidence([
    runAt(start, 1),
    runAt(branch, 2),
    runAt(completion, 3, { status: "in_progress", conclusion: null }),
  ]);
  const answer = await readSelection(evidence);
  expect(answer).toMatchObject({
    selection: {
      kind: "build",
      revision: branch,
      runId: 2,
      selection: "ancestor",
      laterWithoutResult: 1,
      laterRunning: true,
    },
  });
  if (answer.kind !== "selection") throw new Error("No selection slots");
  expect(answer.selection.requestedStatus).toBeUndefined();
});

test("a running end without any measured in-range build stays pending", async () => {
  const evidence = publishedEvidence([
    runAt(start, 1),
    runAt(completion, 3, { status: "in_progress", conclusion: null }),
  ]);
  expect(await readSelection(evidence)).toMatchObject({
    selection: { kind: "running", revision: completion, runId: 3 },
  });
});

test("a completed attempt at the requested start remains visible during its rerun", async () => {
  const evidence = publishedEvidence([
    runAt(start, 1),
    runAt(start, 1, { attempt: 2, status: "in_progress", conclusion: null }),
    runAt(completion, 3),
  ]);
  expect(await readSelection(evidence)).toMatchObject({
    baseline: {
      kind: "build",
      revision: start,
      runAttempt: 1,
      laterRunning: true,
    },
  });
});

test.each([
  {
    name: "An empty range",
    pair: { start: branch, end: branch },
    kind: "none",
  },
  {
    name: "A reversed range",
    pair: { start: completion, end: branch },
    kind: "unavailable",
  },
  {
    name: "A range on unrelated first parents",
    pair: { start: later, end: branch },
    kind: "unavailable",
  },
])("$name does not name an end build", async ({ pair, kind }) => {
  const evidence = publishedEvidence([
    runAt(start, 1),
    runAt(branch, 2),
    runAt(completion, 3),
  ]);
  expect(await readSelection(evidence, pair)).toMatchObject({
    selection: { kind },
  });
});

test("an unreadable selected end retains the readable baseline", async () => {
  const evidence = publishedEvidence([runAt(start, 1)]);
  expect(
    await readSelection(evidence, { start, end: "0".repeat(40) }),
  ).toMatchObject({
    baseline: { kind: "build", revision: start },
    selection: { kind: "unavailable" },
  });
});

test("a remembered answer serves only its source and revision pair", async () => {
  const reader = ciComparisonReader(ciComparisonAnswers());
  const evidence = publishedEvidence([
    runAt(start, 1),
    runAt(branch, 2),
    runAt(completion, 3),
  ]);
  const first = await readSelection(evidence, range, reader);
  const empty = publishedEvidence([]);
  expect(await readSelection(empty, range, reader)).toEqual(first);
  expect(empty.reads.revisions).toEqual([]);
  const shorter = { start, end: branch };
  expect(await readSelection(evidence, shorter, reader)).toMatchObject({
    range: shorter,
    selection: { kind: "build", revision: branch, runId: 2 },
  });
  const otherProject = makeMe.aPublishedSource
    .with({ ...comparisonProject, id: "other-source" })
    .please();
  expect(await readSelection(empty, range, reader, otherProject)).toMatchObject(
    {
      source: otherProject.id,
      selection: { kind: "none" },
    },
  );
});
