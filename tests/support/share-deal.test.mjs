// The rules of scripts/share-deal.mjs on small inputs: tie-breaking and start
// order, the assumed seconds of unrecorded jobs, the duration list form, and
// the refresh merge.
import assert from "node:assert/strict";
import { test } from "node:test";
import {
  dealShares,
  formatPreview,
  formatRunnerFactorLine,
  formatSeconds,
  mergeTimes,
  parseDurationList,
  runnerFactor,
  shareLabels,
  TestSharesError,
} from "../../scripts/share-deal.mjs";

const predicted = (deal) =>
  deal.shares.map((share) => formatSeconds(share.predicted));

test("ties go to the lower share and each share starts longest first", () => {
  const seconds = new Map([
    ["c", 5],
    ["a", 5],
    ["b", 5],
    ["d", 1],
  ]);
  const deal = dealShares(["d", "b", "a", "c"], seconds, 2);
  // a, b, c (bytewise among equal seconds): a to share 1, b to share 2, c to
  // share 1 as the lower of two equal totals; d then to share 2.
  assert.deepEqual(shareLabels(deal, 1), ["a", "c"]);
  assert.deepEqual(shareLabels(deal, 2), ["b", "d"]);
  assert.deepEqual(predicted(deal), ["10.0", "6.0"]);
  // Shares by index, and each share's recorded jobs longest first, then the
  // unrecorded in bytewise order.
  const mixed = dealShares(
    ["z-new", "a-new", "short", "long"],
    new Map([
      ["short", 1],
      ["long", 9],
    ]),
    1,
  );
  assert.deepEqual(shareLabels(mixed, 1), ["long", "short", "a-new", "z-new"]);
});

test("unrecorded jobs take the recorded median, or 1 s without a usable one", () => {
  const odd = dealShares(
    ["a", "b", "c", "n"],
    new Map([
      ["a", 1],
      ["b", 10],
      ["c", 4],
    ]),
    2,
  );
  assert.equal(odd.recordedMedian, 4);
  assert.equal(odd.assumedSeconds, 4);
  const even = dealShares(
    ["a", "b", "c", "d", "n"],
    new Map([
      ["a", 1],
      ["b", 10],
      ["c", 4],
      ["d", 2],
    ]),
    2,
  );
  assert.equal(even.recordedMedian, 3);
  assert.deepEqual(predicted(even), ["10.0", "10.0"]);
  const none = dealShares(["c", "a", "b"], new Map(), 2);
  assert.equal(none.recordedMedian, undefined);
  assert.equal(none.assumedSeconds, 1);
  // Equal assumed seconds deal round-robin in bytewise order.
  assert.deepEqual(shareLabels(none, 1), ["a", "c"]);
  assert.deepEqual(shareLabels(none, 2), ["b"]);
  assert.match(
    formatPreview(none, { listName: "none" }),
    /3 unrecorded at 1\.0 s each \(no usable recorded median\)/,
  );
  const zero = dealShares(["a", "n"], new Map([["a", 0]]), 2);
  assert.equal(zero.assumedSeconds, 1);
});

test("a list line that is not <seconds><TAB><label> fails naming the file, line and content", () => {
  const malformed = "# header\n3.5\tok.sh\ntests/no-seconds.sh\n";
  assert.throws(
    () => parseDurationList(malformed, "x/longest-first"),
    (error) =>
      error instanceof TestSharesError &&
      error.message ===
        'FAIL: x/longest-first:3: "tests/no-seconds.sh" is not <seconds><TAB><label>; no check was run.',
  );
  for (const line of ["-1\ta.sh", "1.\ta.sh", "1\t", "1 a.sh", "abc\ta.sh"]) {
    assert.throws(
      () => parseDurationList(`${line}\n`, "list"),
      /FAIL: list:1: /,
      line,
    );
  }
  const parsed = parseDurationList("# h1\n# h2\n\n2.0\ta\n# late\n3\tb\n", "l");
  assert.deepEqual(parsed.header, ["# h1", "# h2"]);
  assert.deepEqual(
    [...parsed.seconds],
    [
      ["a", 2],
      ["b", 3],
    ],
  );
});

test("runner factor is the median over measurable recorded jobs, else unavailable", () => {
  const recorded = new Map([
    ["a", 10],
    ["b", 10],
    ["c", 10],
    ["tiny", 1.5],
  ]);
  assert.deepEqual(
    runnerFactor(
      recorded,
      new Map([
        ["a", 20],
        ["b", 30],
        ["c", 40],
        ["tiny", 15],
      ]),
    ),
    { factor: 3, available: true },
  );
  assert.equal(
    formatRunnerFactorLine(
      recorded,
      new Map([
        ["a", 20],
        ["b", 30],
        ["c", 40],
        ["tiny", 15],
      ]),
    ),
    "3\t3.0\n",
  );
  // Even count: mean of the two middle ratios; sub-threshold recorded ignored.
  assert.deepEqual(
    runnerFactor(
      recorded,
      new Map([
        ["a", 20],
        ["b", 40],
        ["tiny", 100],
      ]),
    ),
    { factor: 3, available: true },
  );
  assert.deepEqual(runnerFactor(recorded, new Map([["tiny", 10]])), {
    factor: 1,
    available: false,
  });
  assert.equal(
    formatRunnerFactorLine(recorded, new Map([["tiny", 10]])),
    "1\tunavailable\n",
  );
  assert.deepEqual(runnerFactor(new Map(), new Map([["only", 5]])), {
    factor: 1,
    available: false,
  });
  assert.deepEqual(runnerFactor(recorded, new Map([["unrecorded", 50]])), {
    factor: 1,
    available: false,
  });
});

test("refresh merges times files into a list, longest first, keeping every job and the header", () => {
  const text = mergeTimes(
    [
      { name: "one", text: "0.2\tsmall.sh\n30.0\tbig.test.mjs\n" },
      { name: "two", text: "2.5\tmiddle.sh\n0.2\tother-small.sh\n" },
    ],
    {
      header: ["# kept", "# Source: old run", "# also kept"],
      source: "run 1 at abc, 2026-10-25",
    },
  );
  assert.equal(
    text,
    [
      "# kept",
      "# also kept",
      "# Source: run 1 at abc, 2026-10-25",
      "30.0\tbig.test.mjs",
      "2.5\tmiddle.sh",
      "0.2\tother-small.sh",
      "0.2\tsmall.sh",
      "",
    ].join("\n"),
  );
  // The refreshed list parses back to the same seconds.
  const seconds = parseDurationList(text, "refreshed").seconds;
  assert.equal(seconds.get("small.sh"), 0.2);
  assert.equal(seconds.size, 4);
});
