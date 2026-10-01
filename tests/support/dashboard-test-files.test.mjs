import assert from "node:assert/strict";
import { test } from "node:test";
import {
  readdirSync,
  readFileSync,
  mkdtempSync,
  writeFileSync,
  rmSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import {
  partitionTestFiles,
  dashboardTestMatch,
} from "../../dashboard/tests/support/testFiles.mjs";

test("longest-first files stay apart and new files run exactly once", () => {
  const files = ["z.spec.ts", "b.spec.ts", "a.spec.ts", "long.spec.ts"];
  const known = [
    "removed.spec.ts",
    "long.spec.ts",
    "b.spec.ts",
    "long.spec.ts",
  ];
  assert.deepEqual(partitionTestFiles(files, known, "1/2"), [
    "long.spec.ts",
    "a.spec.ts",
  ]);
  assert.deepEqual(partitionTestFiles(files, known, "2/2"), [
    "b.spec.ts",
    "z.spec.ts",
  ]);
  assert.deepEqual(partitionTestFiles([...files].reverse(), known, "1/2"), [
    "long.spec.ts",
    "a.spec.ts",
  ]);
});

test("invalid shares fail before selecting tests", () => {
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
      () => partitionTestFiles(["a.spec.ts"], [], invalid),
      /OPEN_DOUGH_DASHBOARD_SPLIT=/,
    );
  }
});

test("config discovers unlisted new specs and ignores removed list entries", () => {
  const path = mkdtempSync(join(tmpdir(), "dashboard-shares-"));
  try {
    const directory = pathToFileURL(`${path}/`);
    writeFileSync(new URL("known.spec.ts", directory), "");
    writeFileSync(new URL("new.spec.ts", directory), "");
    writeFileSync(
      new URL("longest-first", directory),
      "removed.spec.ts\nknown.spec.ts\nknown.spec.ts\n",
    );
    const first = dashboardTestMatch(directory, "1/2");
    const second = dashboardTestMatch(directory, "2/2");
    assert.equal(first.length, 1);
    assert.equal(second.length, 1);
    assert.equal(first[0].test(join(path, "known.spec.ts")), true);
    assert.equal(second[0].test(join(path, "new.spec.ts")), true);
  } finally {
    rmSync(path, { recursive: true, force: true });
  }
});

test("the seven CI shares match every actual browser spec exactly once", () => {
  const directory = new URL("../../dashboard/tests/", import.meta.url);
  const files = readdirSync(directory, { recursive: true }).filter((file) =>
    /\.(spec|test)\.[cm]?[jt]sx?$/.test(file),
  );
  const known = readFileSync(new URL("longest-first", directory), "utf8")
    .split(/\r?\n/)
    .filter((line) => line && !line.startsWith("#"));
  const indices = [...Array(7).keys()];
  const shares = indices.map((index) =>
    partitionTestFiles(files, known, `${index + 1}/7`),
  );
  assert.deepEqual(shares.flat().sort(), [...files].sort());
  const matches = indices
    .map((index) => dashboardTestMatch(directory, `${index + 1}/7`))
    .flat();
  for (const file of files) {
    assert.equal(
      matches.filter((pattern) =>
        pattern.test(new URL(file, directory).pathname),
      ).length,
      1,
      file,
    );
  }
});
