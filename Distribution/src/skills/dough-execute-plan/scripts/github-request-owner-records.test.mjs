import assert from "node:assert/strict";
import fs, { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { syncBuiltinESMExports } from "node:module";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";
import { claimedRecord } from "./github-request-owner-endpoint.mjs";
import { ownerRecords } from "./github-request-owner-test-fixtures.mjs";

function endpoint(t) {
  const root = mkdtempSync(join(tmpdir(), "ghr-records-"));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  const directory = join(root, "endpoint");
  mkdirSync(directory);
  return { root, directory, file: join(directory, "owner.1.json") };
}

test("owner observation tolerates an earlier record withdrawn after listing and still observes its replacement", (t) => {
  const { root, directory } = endpoint(t);
  const original = { pid: 1, token: "original" };
  const replacement = { pid: 2, token: "replacement" };
  assert.equal(claimedRecord(directory, 1, original), true);

  const readdir = fs.readdirSync;
  let replaced = false;
  fs.readdirSync = (path, ...options) => {
    const names = readdir(path, ...options);
    if (path === directory && !replaced) {
      replaced = true;
      // Complete the real replacement after observation took its directory
      // snapshot, before it reads the earlier record from that snapshot.
      assert.equal(claimedRecord(directory, 2, replacement), true);
    }
    return names;
  };
  syncBuiltinESMExports();
  t.after(() => {
    fs.readdirSync = readdir;
    syncBuiltinESMExports();
  });

  assert.deepEqual(ownerRecords(root), []);
  assert.equal(replaced, true);
  assert.deepEqual(ownerRecords(root), [
    {
      ...replacement,
      directory,
      file: join(directory, "owner.2.json"),
    },
  ]);
});

test("owner observation still rejects malformed records", (t) => {
  const { root, file } = endpoint(t);
  writeFileSync(file, "{unfinished");
  assert.throws(() => ownerRecords(root), SyntaxError);
});

test("owner observation still surfaces filesystem errors other than a missing record", (t) => {
  const { root, file } = endpoint(t);
  mkdirSync(file);
  assert.throws(() => ownerRecords(root), { code: "EISDIR" });
});
