// Proof of tests/support/proofStore.mjs session: outside-Git no-op, covered
// locations, commit and fileBlob, record and clear of covered files only.
import assert from "node:assert/strict";
import { existsSync, mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { test } from "node:test";
import { git, pass, readLatest, scratchRepo } from "./proof-store-fixture.mjs";
import { openProofStore, repositoryRoot } from "./proofStore.mjs";

test("outside Git every store method is a no-op", () => {
  const directory = mkdtempSync(path.join(tmpdir(), "proof-store-nongit-"));
  try {
    assert.equal(repositoryRoot(directory), undefined);
    const store = openProofStore({ cwd: directory, runner: "playwright" });
    assert.equal(store.active, false);
    store.record(pass("specs/a.spec.ts", ["one"]));
    store.clear({ file: "specs/a.spec.ts", test: ["one"] });
    assert.equal(existsSync(path.join(directory, "specs")), false);
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
});

test("covered locations come from open-dough.json at the Git toplevel", () => {
  const directory = scratchRepo();
  try {
    const store = openProofStore({ cwd: directory, runner: "playwright" });
    assert.equal(store.active, true);
    assert.equal(store.root, git(directory, ["rev-parse", "--show-toplevel"]));
    assert.equal(store.commit, git(directory, ["rev-parse", "HEAD"]));
    assert.deepEqual(
      store.locations.map((location) => location.path),
      ["specs"],
    );
    assert.equal(
      store.fileBlob("specs/a.spec.ts"),
      git(directory, ["hash-object", "specs/a.spec.ts"]),
    );
    assert.equal(
      store.fileBlob("specs/a.spec.ts"),
      git(directory, ["hash-object", "specs/a.spec.ts"]),
      "fileBlob is cached per file",
    );
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
});

test("openProofStore records only covered files and clears through the store", () => {
  const directory = scratchRepo();
  try {
    const store = openProofStore({ cwd: directory, runner: "playwright" });
    const blob = store.fileBlob("specs/a.spec.ts");
    store.record({
      ...pass("specs/a.spec.ts", ["covered"]),
      commit: store.commit,
      fileBlob: blob,
    });
    store.record({
      ...pass("other/out.spec.ts", ["ignored"]),
      commit: store.commit,
      fileBlob: "c".repeat(40),
    });
    const latest = readLatest(directory);
    assert.deepEqual(
      latest.observations.map((row) => row.test),
      [["covered"]],
    );
    assert.equal(latest.observations[0].commit, store.commit);
    assert.equal(latest.observations[0].fileBlob, blob);

    store.clear({ file: "specs/a.spec.ts", test: ["covered"] });
    assert.equal(readLatest(directory), undefined);
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
});
