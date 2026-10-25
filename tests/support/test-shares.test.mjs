// The command surface of scripts/test-shares.mjs: `share` as
// scripts/test-jobs.sh runs it, and `preview` as a contributor runs it.
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import {
  chmodSync,
  mkdirSync,
  mkdtempSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { after, test } from "node:test";

const allocator = fileURLToPath(
  new URL("../../scripts/test-shares.mjs", import.meta.url),
);
const budgetPath = fileURLToPath(new URL("../time-budget", import.meta.url));
const scratch = mkdtempSync(join(tmpdir(), "test-shares-"));
after(() => rmSync(scratch, { recursive: true, force: true }));

const list = join(scratch, "longest-first");
writeFileSync(list, "# list\n9.0\tlong.sh\n1.0\tshort.sh\n");
const labels = ["new-b.sh", "short.sh", "long.sh", "new-a.sh"];

const run = (args, options = {}) =>
  spawnSync(process.execPath, [allocator, ...args], {
    encoding: "utf8",
    ...options,
  });
const share = (listPath, split) =>
  run(["share", "--list", listPath, ...(split ? ["--split", split] : [])], {
    input: labels.map((label) => `${label}\0`).join(""),
  });

test("share prints the whole deal, or one split's labels, NUL-terminated in start order", () => {
  const whole = share(list);
  assert.equal(whole.status, 0, whole.stderr);
  assert.equal(whole.stdout, "long.sh\0short.sh\0new-a.sh\0new-b.sh\0");
  // long 9 to share 1; short 1 to share 2; new-a and new-b (5 each, the
  // median) to share 2, the lighter at 1 and then 6.
  assert.equal(share(list, "1/2").stdout, "long.sh\0");
  assert.equal(share(list, "2/2").stdout, "short.sh\0new-a.sh\0new-b.sh\0");
});

test("share refuses a split that is not <i>/<n>", () => {
  const invalid = share(list, "3/2");
  assert.equal(invalid.status, 1);
  assert.match(invalid.stderr, /^FAIL: --split=3\/2 is not <i>\/<n>/);
});

test("share fails on a list line without seconds, naming the file, line and content", () => {
  const malformedList = join(scratch, "malformed");
  writeFileSync(malformedList, "# list\nlong.sh\n");
  const malformed = share(malformedList, "1/2");
  assert.equal(malformed.status, 1);
  assert.equal(
    malformed.stderr,
    `FAIL: ${malformedList}:2: "long.sh" is not <seconds><TAB><label>; no check was run.\n`,
  );
});

test("preview reads labels from a file and the ceiling from the budget", () => {
  const labelsFile = join(scratch, "labels");
  writeFileSync(labelsFile, `${labels.join("\n")}\n`);
  const previewRun = run([
    "preview",
    "--split-count",
    "2",
    "--list",
    list,
    "--labels",
    labelsFile,
    "--budget",
    budgetPath,
  ]);
  assert.equal(previewRun.status, 0, previewRun.stderr);
  assert.match(
    previewRun.stdout,
    /^share 2\/2: 11\.0 predicted \(3 jobs, 2 unrecorded\); headroom 699\.0 to the total ceiling 710 /m,
  );
  assert.match(previewRun.stdout, /^ {2}share 2\/2 {2}new-a\.sh$/m);
});

test("preview names the Bash 5 floor when the bash on PATH is older", () => {
  const bin = join(scratch, "bin");
  mkdirSync(bin);
  const stub = join(bin, "bash");
  writeFileSync(
    stub,
    '#!/bin/sh\nif [ "$1" = -c ]; then printf "%s" "3.2.57(1)-release"; exit 0; fi\necho "declare: -A: invalid option" >&2\nexit 2\n',
  );
  chmodSync(stub, 0o755);
  const previewRun = run(["preview", "--split-count", "3"], {
    env: { ...process.env, PATH: `${bin}:${process.env.PATH}` },
  });
  assert.equal(previewRun.status, 1);
  assert.equal(
    previewRun.stderr,
    "FAIL: shell tests require Bash 5 or newer; resolved bash on PATH (version 3.2.57(1)-release).\nInstall Bash 5 or newer and put its bin directory first on PATH, then rerun the preview.\n",
  );
});

test("preview lists a substitute test directory through scripts/test-jobs.sh", () => {
  const checks = join(scratch, "checks");
  mkdirSync(checks);
  for (const name of ["one", "two", "three"]) {
    writeFileSync(join(checks, `${name}.sh`), "#!/usr/bin/env bash\n");
  }
  writeFileSync(
    join(checks, "longest-first"),
    `# list\n4.0\t${checks}/one.sh\n2.0\t${checks}/two.sh\n`,
  );
  writeFileSync(
    join(checks, "time-budget"),
    "per-job-seconds=10\ntotal-job-seconds=20\n",
  );
  const previewRun = run([
    "preview",
    "--split-count",
    "2",
    "--test-dir",
    checks,
  ]);
  assert.equal(previewRun.status, 0, previewRun.stderr);
  // one (4.0) to share 1, two (2.0) to share 2, three unrecorded at the
  // median 3.0 to share 2.
  assert.equal(
    previewRun.stdout,
    `Predicted job-seconds per share from ${checks}/longest-first: 3 jobs, 2 recorded, 1 unrecorded at 3.0 s each (the recorded median).\n` +
      `share 1/2: 4.0 predicted (1 jobs, 0 unrecorded); headroom 16.0 to the total ceiling 20 (${checks}/time-budget)\n` +
      `share 2/2: 5.0 predicted (2 jobs, 1 unrecorded); headroom 15.0 to the total ceiling 20 (${checks}/time-budget)\n` +
      `unrecorded jobs (1), each assumed at 3.0 s; a refresh of ${checks}/longest-first records them:\n` +
      `  share 2/2  ${checks}/three.sh\n`,
  );
});
