// The dashboard configuration's share selection: support/testFiles.mjs
// deals the spec files through scripts/share-deal.mjs by the seconds in
// dashboard/tests/longest-first (dashboard/tests/shards.md).
import assert from "node:assert/strict";
import { test } from "node:test";
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import {
  dashboardSpecFiles,
  dashboardTestMatch,
} from "../../dashboard/tests/support/testFiles.mjs";
import { remainingSuiteTime } from "../../dashboard/tests/support/suiteDeadline.mjs";
import {
  dealShares,
  formatPreview,
  readDurationList,
} from "../../scripts/share-deal.mjs";

// A scratch spec directory with the given spec files and list text.
function withSpecDirectory(files, list, body) {
  const path = mkdtempSync(join(tmpdir(), "dashboard-shares-"));
  try {
    for (const file of files) {
      mkdirSync(join(path, file, ".."), { recursive: true });
      writeFileSync(join(path, file), "");
    }
    writeFileSync(join(path, "longest-first"), list);
    body(pathToFileURL(`${path}/`), path);
  } finally {
    rmSync(path, { recursive: true, force: true });
  }
}

const matched = (patterns, path) =>
  patterns.filter((pattern) => pattern.test(path)).length;

test("the config deals recorded specs by their seconds and new specs after them at the median", () => {
  const files = ["known.spec.ts", "nested/short.spec.ts", "new.spec.ts"];
  // A removed entry is ignored and a repeated one keeps its largest seconds.
  const list =
    "# header\n9.0\tknown.spec.ts\n1.0\tremoved.spec.ts\n0.5\tnested/short.spec.ts\n1.0\tnested/short.spec.ts\n";
  withSpecDirectory(files, list, (directory, path) => {
    const first = dashboardTestMatch(directory, "1/2");
    const second = dashboardTestMatch(directory, "2/2");
    // known 9.0 to share 1; short 1.0 to share 2; new at the median 5.0 to
    // the lighter share 2.
    assert.equal(first.length, 1);
    assert.equal(second.length, 2);
    assert.equal(matched(first, join(path, "known.spec.ts")), 1);
    assert.equal(matched(second, join(path, "nested/short.spec.ts")), 1);
    assert.equal(matched(second, join(path, "new.spec.ts")), 1);
    assert.equal(matched(first, join(path, "longest-first")), 0);
  });
});

test("invalid shares fail before selecting tests", () => {
  withSpecDirectory(["a.spec.ts"], "1.0\ta.spec.ts\n", (directory) => {
    for (const invalid of [
      "",
      "0/2",
      "3/2",
      "1/0",
      "x",
      "1/2/3",
      "1/9007199254740992",
    ]) {
      assert.throws(
        () => dashboardTestMatch(directory, invalid),
        /OPEN_DOUGH_DASHBOARD_SPLIT=/,
      );
    }
  });
});

test("a list line without seconds fails the configuration naming the file, line and content", () => {
  withSpecDirectory(
    ["a.spec.ts", "b.spec.ts"],
    "# header\n2.0\ta.spec.ts\nb.spec.ts\n",
    (directory, path) => {
      assert.throws(
        () => dashboardTestMatch(directory, "1/2"),
        new Error(
          `FAIL: ${join(path, "longest-first")}:3: "b.spec.ts" is not <seconds><TAB><label>; no check was run.`,
        ),
      );
    },
  );
});

const suite = new URL("../../dashboard/tests/", import.meta.url);
const shardCount = 12;
const shardIndices = [...Array(shardCount).keys()].map((index) => index + 1);

test("the twelve CI shards match every actual browser spec exactly once", () => {
  const files = dashboardSpecFiles(fileURLToPath(suite));
  assert.ok(files.length > 0);
  const matches = shardIndices.flatMap((index) =>
    dashboardTestMatch(suite, `${index}/${shardCount}`),
  );
  assert.equal(matches.length, files.length);
  for (const file of files) {
    assert.equal(matched(matches, new URL(file, suite).pathname), 1, file);
  }
});

test("the twelve CI shards' predicted seconds lie within one recorded spec file of each other", () => {
  const files = dashboardSpecFiles(fileURLToPath(suite));
  const { seconds } = readDurationList(
    fileURLToPath(new URL("longest-first", suite)),
  );
  const deal = dealShares(files, seconds, shardCount);
  assert.ok(deal.recordedCount > 0);
  const predicted = deal.shares.map((share) => share.predicted);
  const largestRecorded = Math.max(
    ...files
      .filter((file) => seconds.has(file))
      .map((file) => seconds.get(file)),
  );
  assert.ok(
    Math.max(...predicted) - Math.min(...predicted) <= largestRecorded + 1e-9,
    `predicted ${predicted.map((value) => value.toFixed(1)).join(" / ")} spread more than ${largestRecorded}`,
  );
});

test("a new spec appears in the preview as unrecorded in the lightest shard at the median", () => {
  const files = dashboardSpecFiles(fileURLToPath(suite));
  const { seconds } = readDurationList(
    fileURLToPath(new URL("longest-first", suite)),
  );
  const added = "zz-new.spec.ts";
  assert.equal(files.includes(added), false);
  const before = dealShares(files, seconds, shardCount);
  const after = dealShares([...files, added], seconds, shardCount);
  // Bytewise last among unrecorded specs, the new spec is dealt last, to the
  // shard that was lightest, and the other shards are unchanged.
  const lightest = before.shares.reduce((best, share) =>
    share.predicted < best.predicted - 1e-9 ? share : best,
  );
  const receiving = after.shares.find((share) =>
    share.jobs.some((job) => job.label === added),
  );
  assert.equal(receiving.index, lightest.index);
  assert.ok(
    Math.abs(receiving.predicted - lightest.predicted - after.assumedSeconds) <
      1e-9,
  );
  for (const share of after.shares) {
    if (share.index !== receiving.index) {
      assert.deepEqual(share, before.shares[share.index - 1]);
    }
  }
  const preview = formatPreview(after, { listName: "longest-first" });
  assert.equal(after.unrecordedCount, before.unrecordedCount + 1);
  assert.match(
    preview,
    new RegExp(`^ {2}share ${receiving.index}/${shardCount} {2}${added}$`, "m"),
  );
  assert.doesNotMatch(preview, /headroom/);
});

test("the recorded deadline leaves the suite its remaining time", () => {
  const now = 1_700_000_000_000;
  assert.equal(remainingSuiteTime(undefined, now), undefined);
  assert.equal(remainingSuiteTime(String(now + 320_000), now), 320_000);
  assert.equal(remainingSuiteTime(String(now + 1), now), 1);
});

test("a passed or unreadable deadline fails the run naming it", () => {
  const now = 1_700_000_000_000;
  for (const passed of [String(now), String(now - 5_000)]) {
    assert.throws(
      () => remainingSuiteTime(passed, now),
      new RegExp(`OPEN_DOUGH_DASHBOARD_DEADLINE_MS=${passed} passed`),
    );
  }
  for (const invalid of ["", "soon", "-1", "1.5", "1e12", "9007199254740993"]) {
    assert.throws(
      () => remainingSuiteTime(invalid, now),
      (error) =>
        error.message.startsWith(
          `OPEN_DOUGH_DASHBOARD_DEADLINE_MS=${invalid} is not`,
        ),
    );
  }
});
