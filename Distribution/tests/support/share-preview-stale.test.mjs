// The contributor's stale-list and new-job readings at the preview command.
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import {
  mkdtempSync,
  readFileSync,
  readdirSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { after, test } from "node:test";
import { durationListText } from "./job-duration-list.mjs";
import { makeMe } from "./makeMe.mjs";

const command = fileURLToPath(
  new URL("../../../scripts/test-shares.mjs", import.meta.url),
);
const fixture = new URL("fixtures/stale-share-preview/", import.meta.url);
const retainedList = fileURLToPath(new URL("longest-first", fixture));
const retainedLabels = readdirSync(new URL("labels/", fixture)).flatMap(
  (name) =>
    readFileSync(new URL(`labels/${name}`, fixture), "utf8")
      .trim()
      .split("\n"),
);
const scratch = mkdtempSync(join(tmpdir(), "share-preview-stale-"));
after(() => rmSync(scratch, { recursive: true, force: true }));

function preview({ labels, trunk = labels, recorded, count = 3, ceiling }) {
  const directory = mkdtempSync(join(scratch, "case-"));
  const list =
    recorded === undefined ? retainedList : join(directory, "longest-first");
  const labelsFile = join(directory, "labels");
  const trunkFile = join(directory, "trunk-labels");
  const budget =
    ceiling === undefined
      ? fileURLToPath(new URL("time-budget", fixture))
      : join(directory, "time-budget");
  writeFileSync(labelsFile, `${labels.join("\n")}\n`);
  writeFileSync(trunkFile, `${trunk.join("\n")}\n`);
  if (ceiling !== undefined)
    writeFileSync(budget, `per-job-seconds=10\ntotal-job-seconds=${ceiling}\n`);
  if (recorded !== undefined) {
    writeFileSync(list, durationListText(recorded, "# current list"));
  }
  const result = spawnSync(
    process.execPath,
    [
      command,
      "preview",
      "--split-count",
      String(count),
      "--list",
      list,
      "--labels",
      labelsFile,
      "--trunk-labels",
      trunkFile,
      "--budget",
      budget,
    ],
    { encoding: "utf8" },
  );
  assert.equal(result.status, 0, result.stderr);
  assert.equal(result.stderr, "");
  return { text: result.stdout, list, budget };
}

const current = () =>
  makeMe.jobDurations
    .with([
      ["long.sh", 9],
      ["short.sh", 1],
    ])
    .please();

test("the pre-DD-537 list opens with 26 stale trunk jobs, assumed headroom and the refresh step", () => {
  const { text } = preview({ labels: retainedLabels });
  assert.match(
    text,
    /^Stale duration list .*: 26 jobs already on trunk lack recorded seconds\.\n/,
  );
  assert.match(text, /639 jobs, 613 recorded, 26 unrecorded at 1\.5 s each/);
  for (const [share, headroom] of [
    [1, "176.7"],
    [2, "176.7"],
    [3, "178.2"],
  ]) {
    const line = text
      .split("\n")
      .find((value) => value.startsWith(`share ${share}/3:`));
    assert.ok(
      line.includes(`headroom ${headroom} to the total ceiling 926`),
      line,
    );
    assert.ok(line.endsWith(" (rests on assumed seconds)"), line);
  }
  assert.match(text, /gh run download RUN_ID -p 'test-times-\*' -D DIR/);
  assert.ok(
    text.includes(
      `node scripts/test-shares.mjs refresh --list ${retainedList} --source 'run RUN_ID at REVISION, DATE' DIR/test-times-*/test-times.txt`,
    ),
  );
  assert.equal(
    text.match(/^ {2}share .*\(stale; assumed 1\.5 s\)$/gm).length,
    26,
  );
  assert.doesNotMatch(text, /\(estimate at/);
});

test("one added job stays a median estimate in its share with current headroom", () => {
  const { text, budget } = preview({
    labels: ["long.sh", "short.sh", "new.sh"],
    trunk: ["long.sh", "short.sh"],
    recorded: current(),
    count: 2,
    ceiling: 30,
  });
  assert.doesNotMatch(
    text,
    /Stale duration list|rests on assumed seconds|Refresh from/,
  );
  assert.ok(
    text.includes(
      `share 1/2: 9.0 predicted (1 jobs, 0 unrecorded); headroom 21.0 to the total ceiling 30 (${budget})\n`,
    ),
  );
  assert.ok(
    text.includes(
      `share 2/2: 6.0 predicted (2 jobs, 1 unrecorded); headroom 24.0 to the total ceiling 30 (${budget})\n`,
    ),
  );
  assert.match(text, /^ {2}share 2\/2 {2}new\.sh \(estimate at 5\.0 s\)$/m);
});

test("an added job does not enter the stale count of the retained trunk jobs", () => {
  const { text } = preview({
    labels: [...retainedLabels, "Distribution/tests/support/added.test.mjs"],
    trunk: retainedLabels,
  });
  assert.match(
    text,
    /^Stale duration list .*: 26 jobs already on trunk lack recorded seconds\.\n/,
  );
  assert.match(text, /640 jobs, 613 recorded, 27 unrecorded at 1\.5 s each/);
  assert.match(
    text,
    /^ {2}share 2\/3 {2}Distribution\/tests\/support\/added\.test\.mjs \(estimate at 1\.5 s\)$/m,
  );
});

test("a single missing trunk job marks only its own share's headroom", () => {
  const { text } = preview({
    labels: ["long.sh", "short.sh", "missing.sh"],
    recorded: current(),
    count: 2,
    ceiling: 30,
  });
  assert.match(
    text,
    /^Stale duration list .*: 1 job already on trunk lacks recorded seconds\.\n/,
  );
  const shares = text.split("\n").filter((line) => line.startsWith("share "));
  assert.ok(!shares[0].includes("rests on assumed seconds"), shares[0]);
  assert.ok(shares[1].endsWith(" (rests on assumed seconds)"), shares[1]);
});

test("every job recorded keeps the exact existing preview without stale or estimate lines", () => {
  const { text, list, budget } = preview({
    labels: ["long.sh", "short.sh"],
    recorded: current(),
    count: 2,
    ceiling: 30,
  });
  assert.equal(
    text,
    `Predicted job-seconds per share from ${list}: 2 jobs, 2 recorded, 0 unrecorded at 5.0 s each (the recorded median).\n` +
      `share 1/2: 9.0 predicted (1 jobs, 0 unrecorded); headroom 21.0 to the total ceiling 30 (${budget})\n` +
      `share 2/2: 1.0 predicted (1 jobs, 0 unrecorded); headroom 29.0 to the total ceiling 30 (${budget})\n`,
  );
});
