import assert from "node:assert/strict";
import { test } from "node:test";
import { immediateChildrenOf } from "../../dashboard/src/intentSummaryCoverage.ts";
import { latestProofOf } from "../../dashboard/src/proofCases.ts";
import { proofKindOf } from "../../dashboard/src/proofKinds.ts";
import {
  proofCostLineFor,
  proofCostOf,
  proofSpreadLine,
  summaryFiguresFor,
} from "../../dashboard/src/intentSummaryProofCost.ts";

const gherkin = proofKindOf("gherkin");

const observed = (finishedAt, commit, durationMs = 1000) => ({
  file: "Feature",
  name: "Scenario",
  outcome: "passed",
  attempts: 1,
  durationMs,
  finishedAt,
  commit,
  fileBlob: "blob",
});

const spreadOf = (...observations) =>
  proofSpreadLine(proofCostOf(observations));

const complete = {
  inventory: 1,
  readyCount: 1,
  pendingCount: 0,
  failedCount: 0,
  incomplete: false,
};

test("observations finishing in one minute read at that minute", () => {
  assert.equal(
    spreadOf(observed("2026-11-02T01:05:10Z", "aaaaaaa1111")),
    "Observation finished at 01:05 UTC on 2026-11-02, from commit aaaaaaa.",
  );
  assert.equal(
    spreadOf(
      observed("2026-11-02T01:05:10Z", "aaaaaaa1111"),
      observed("2026-11-02T01:05:40Z", "bbbbbbb2222"),
    ),
    "Observations finished at 01:05 UTC on 2026-11-02, from 2 commits.",
  );
});

test("observations finishing on one UTC day read between minutes on that day", () => {
  assert.equal(
    spreadOf(
      observed("2026-11-02T00:10:00Z", "aaaaaaa1111"),
      observed("2026-11-02T01:05:00Z", "aaaaaaa1111"),
    ),
    "Observations finished between 00:10 and 01:05 UTC on 2026-11-02, from commit aaaaaaa.",
  );
  assert.equal(
    spreadOf(
      observed("2026-11-02T01:05:00Z", "aaaaaaa1111"),
      observed("2026-11-02T00:10:00Z", "bbbbbbb2222"),
      observed("2026-11-02T00:30:00Z", "ccccccc3333"),
    ),
    "Observations finished between 00:10 and 01:05 UTC on 2026-11-02, from 3 commits.",
  );
});

test("observations finishing on different UTC days name both days", () => {
  assert.equal(
    spreadOf(
      observed("2026-11-02T01:05:00Z", "aaaaaaa1111"),
      observed("2026-11-01T23:50:00Z", "aaaaaaa1111"),
    ),
    "Observations finished between 2026-11-01 23:50 and 2026-11-02 01:05 UTC, from commit aaaaaaa.",
  );
  assert.equal(
    spreadOf(
      observed("2026-11-01T23:50:00Z", "aaaaaaa1111"),
      observed("2026-11-02T01:05:00Z", "bbbbbbb2222"),
    ),
    "Observations finished between 2026-11-01 23:50 and 2026-11-02 01:05 UTC, from 2 commits.",
  );
});

test("a sum of a minute or more reads in minutes and seconds", () => {
  const cost = proofCostOf([
    observed("2026-11-02T01:05:00Z", "aaaaaaa1111", 40_000),
    observed("2026-11-02T01:05:00Z", "aaaaaaa1111", 25_000),
    undefined,
  ]);
  assert.equal(
    proofCostLineFor(complete, cost, gherkin.words),
    "Summed duration of last successful proof: 1m 5s over 2 of 3 scenarios",
  );
});

test("the selection and each child derive their figures from one rule over one walk", () => {
  const root = "features";
  const unread = "features/cli/unread.feature";
  const texts = new Map([
    [
      "features/cli/login.feature",
      "Feature: Login\n  Scenario: Log in\n  Scenario: Log out\n",
    ],
    ["features/cli/help.feature", "Feature: Help\n  Scenario: Help\n"],
    ["features/recall.feature", "Feature: Recall\n  Scenario: Recall\n"],
  ]);
  const files = [
    "features/recall.feature",
    "features/cli/login.feature",
    "features/cli/help.feature",
    unread,
  ];
  const statusOf = (path) =>
    texts.has(path) ? "ready" : path === unread ? "failed" : "pending";
  const proofOf = (file, name, [finishedAt, commit, durationMs]) => ({
    ...observed(finishedAt, commit, durationMs),
    file,
    name,
  });
  const login = "features/cli/login.feature";
  const latest = latestProofOf([
    proofOf(login, "Log in", ["2026-11-01T23:50:00Z", "aaaaaaa1111", 2000]),
    proofOf(login, "Log out", ["2026-11-02T01:05:00Z", "bbbbbbb2222", 5000]),
    proofOf("features/recall.feature", "Recall", [
      "2026-11-02T00:30:00Z",
      "aaaaaaa1111",
      3000,
    ]),
  ]);
  const reads = [];
  const textOf = (path) => {
    reads.push(path);
    return texts.get(path);
  };
  const childList = immediateChildrenOf(root, files);

  const { selection, children } = summaryFiguresFor(
    files,
    childList,
    statusOf,
    textOf,
    gherkin.rowsOf,
    latest,
  );

  // One walk: each file's text is taken once for the selection and every child.
  assert.deepEqual([...reads].sort(), [...files].sort());
  // One rule: each child's figures are those it has when selected on its own.
  const readText = (path) => texts.get(path);
  for (const child of children) {
    assert.deepEqual(
      child.figures,
      summaryFiguresFor(
        child.files,
        [],
        statusOf,
        readText,
        gherkin.rowsOf,
        latest,
      ).selection,
    );
  }

  assert.equal(selection.inventoryCount, 4);
  assert.equal(selection.coverage.failedCount, 1);
  assert.equal(selection.cost.summedMs, 10_000);
  assert.deepEqual(
    selection.slowest.map(({ row }) => row.name),
    ["Log out", "Recall", "Log in"],
  );
  assert.equal(
    selection.spread,
    "Observations finished between 2026-11-01 23:50 and 2026-11-02 01:05 UTC, from 2 commits.",
  );
  assert.deepEqual(
    children.map(({ name, figures }) => [
      name,
      figures.inventoryCount,
      figures.cost.summedMs,
    ]),
    [
      ["cli", 3, 7000],
      ["recall.feature", 1, 3000],
    ],
  );
});
