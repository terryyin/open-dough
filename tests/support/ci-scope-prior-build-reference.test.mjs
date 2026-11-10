import assert from "node:assert/strict";
import { test } from "node:test";
import { makeMe } from "./makeMe.mjs";
import {
  scopeReferenceEntry as entry,
  scopeReferenceFilePath as file,
  scopeReferenceReading as reading,
  scopeReferenceOf as reference,
} from "./scopePriorReferenceTestData.mjs";

test("entry, folder and file averages use independent complete sums, hidden contributors and each build's membership", () => {
  const entries = [100, 100, 100, 100, 115, 116, 120].map((ms) => [entry(ms)]);
  for (const [path, average, selected, difference] of [
    ["tests", 618, 720, 102],
    ["tests/folder", 309, 360, 51],
    [file, 103, 120, 17],
  ]) {
    const actual = reference(reading(entries, path));
    assert.equal(actual.averageMs, average);
    assert.equal(actual.selected.ms, selected);
    assert.equal(actual.difference.changeMs, difference);
    assert.equal(actual.sampleCount, 5);
    assert.match(actual.evidence[5].reason, /Slow outlier/);
    assert.equal(actual.evidence[6].status, "selected");
  }
  const changed = entries.map((parts, index) =>
    index === 0
      ? [
          makeMe.aCiProofEntry
            .at("tests")
            .brokenDownBy([
              { path: file, passed: 1, failed: 0, other: 0, durationMs: 300 },
            ])
            .please(),
        ]
      : parts,
  );
  assert.equal(reference(reading(changed)).averageMs, 309);
});

test("scope gaps exclude only their own reading, preserving fast zero and entry-only totals", () => {
  const unrelated = makeMe.aCiProofEntry
    .at("elsewhere")
    .holding(
      makeMe.aCiProofEvidence
        .inUnit("case")
        .counting(1)
        .timed(999)
        .missingPart(2)
        .please(),
    )
    .please();
  const entries = [0, 100, 100, 100, 100, 120].map((ms) => [
    entry(ms),
    unrelated,
  ]);
  const actual = reference(reading(entries));
  assert.equal(actual.sampleCount, 5);
  assert.equal(actual.averageMs, 240);
  assert.equal(actual.evidence[0].status, "included");
  const totals = [0, 100, 100, 100, 100, 120].map((ms) => [
    entry(ms, { entryOnly: true }),
  ]);
  assert.equal(reference(reading(totals, "tests")).averageMs, 80);
  const folder = reference(reading(totals));
  assert.equal(folder.averageMs, undefined);
  assert.ok(
    folder.evidence.every(({ reason }) => /No file breakdown/.test(reason)),
  );
});

test("partial selected identity retains the matching prior reference without a lower-bound difference", () => {
  const entries = [100, 100, 100, 100, 100].map((ms) => [entry(ms)]);
  entries.push([entry(120, { partial: true })]);
  const actual = reference(reading(entries));
  assert.equal(actual.averageMs, 300);
  assert.equal(actual.selected.ms, undefined);
  assert.match(actual.selected.reason, /part 2 of 2 missing/);
  assert.equal(actual.difference, undefined);
});

test("unmeasured selected scope keeps evidenced identity and earlier reference without inventing zero", () => {
  const prior = [100, 100, 100, 100, 100].map((ms) => [entry(ms)]);
  const untimed = makeMe.aCiProofEntry
    .at("tests")
    .holding(
      makeMe.aCiProofEvidence
        .inUnit("case")
        .brokenDown({ path: file, passed: 1 })
        .please(),
    )
    .please();
  const actual = reference(reading([...prior, [untimed]], file));
  assert.equal(actual.averageMs, 100);
  assert.equal(actual.selected.ms, undefined);
  assert.equal(
    actual.selected.reason,
    "Not recorded: no counted result has a duration",
  );
  assert.equal(actual.difference, undefined);
});

test("missing selected identity retains separately labelled historical owners and units but cannot choose a proxy", () => {
  const answer = reading([
    [entry(100)],
    [entry(100)],
    [entry(100)],
    [entry(100)],
    [entry(100)],
    [entry(100, { owner: "tests/folder" })],
    [entry(100, { unit: "file" })],
    undefined,
  ]);
  assert.equal(answer.entries[0].readings[0].kind, "point");
  assert.equal(answer.entries[5].readings[0].entry, "tests/folder");
  assert.ok(
    answer.entries[6].readings.some(
      ({ kind, unit }) => kind === "point" && unit === "file",
    ),
  );
  for (const candidate of answer.references) {
    assert.match(candidate.reason, /Selected scope identity unavailable/);
    assert.equal(candidate.reference.averageMs, undefined);
    assert.equal(candidate.reference.sampleCount, 0);
  }
});

test("changed owner, counted unit, absent path, missing breakdown and partial prior evidence stay excluded with reasons", () => {
  const absent = makeMe.aCiProofEntry
    .at("tests")
    .brokenDownBy([
      {
        path: "tests/former.spec.ts",
        passed: 1,
        failed: 0,
        other: 0,
        durationMs: 100,
      },
    ])
    .please();
  const entries = [
    [entry(100, { owner: "tests/folder" })],
    [entry(100, { unit: "file" })],
    [absent],
    [entry(100, { entryOnly: true })],
    [entry(100, { partial: true })],
    ...[100, 100, 100, 100, 100, 120].map((ms) => [entry(ms)]),
  ];
  const actual = reference(reading(entries));
  assert.equal(actual.averageMs, 300);
  for (const [index, reason] of [
    /owning entry or counted unit changed/,
    /No declared test cases/,
    /No matching scope/,
    /No file breakdown/,
    /part 2 of 2 missing/,
  ].entries()) {
    assert.equal(actual.evidence[index].status, "excluded");
    assert.match(actual.evidence[index].reason, reason);
    assert.equal(actual.evidence[index].ms, undefined);
  }
});

test("five complete zeros give an elapsed difference without a percentage and scope projection rejects future and self attempts", () => {
  const entries = [0, 0, 0, 0, 0, 1200].map((ms) => [entry(ms)]);
  const actual = reference(reading(entries, file));
  assert.equal(actual.averageMs, 0);
  assert.equal(actual.difference.text, "+1.2 s");
  assert.equal(actual.difference.relative, undefined);
  const future = reference(reading(entries, file, { future: true }));
  assert.match(future.evidence[0].reason, /at or after/);
  assert.equal(future.sampleCount, 4);
  const self = reference(reading(entries, file, { sameAttempt: true }));
  assert.equal(self.sampleCount, 4);
  assert.equal(self.selected.key, "run/1/1");
  assert.equal(self.evidence[0].status, "selected");
  assert.equal(
    self.evidence.filter(({ status }) => status === "selected").length,
    1,
  );
});
