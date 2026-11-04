// Proof of proof directory refresh: atomic latest.json, lock without a .json
// extension, fold, clear, order, and concurrent writers.
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { existsSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import path from "node:path";
import { test } from "node:test";
import { fileURLToPath, pathToFileURL } from "node:url";
import { pass, readLatest, scratchRepo } from "./proof-store-fixture.mjs";
import { compareObservations, refreshProof } from "./proofStore.mjs";

const storeUrl = pathToFileURL(
  path.join(path.dirname(fileURLToPath(import.meta.url)), "proofStore.mjs"),
).href;

test("atomic refresh writes latest.json, folds identities, clears unsuccessful, and orders", () => {
  const directory = scratchRepo("proof-store-refresh-");
  try {
    const proof = path.join(directory, "specs", "proof");
    refreshProof(
      proof,
      pass("specs/a.spec.ts", ["suite", "later"], {
        finishedAt: "2026-11-04T12:00:02.000Z",
      }),
    );
    refreshProof(
      proof,
      pass("specs/a.spec.ts", ["suite", "earlier"], {
        finishedAt: "2026-11-04T12:00:01.000Z",
      }),
    );
    refreshProof(
      proof,
      pass("specs/b.spec.ts", ["alone"], {
        project: "beta",
        finishedAt: "2026-11-04T12:00:03.000Z",
      }),
    );
    refreshProof(
      proof,
      pass("specs/b.spec.ts", ["alone"], {
        finishedAt: "2026-11-04T12:00:04.000Z",
      }),
    );
    // Same identity again: fold to one observation (latest wins).
    refreshProof(
      proof,
      pass("specs/a.spec.ts", ["suite", "later"], {
        attempts: 2,
        durationMs: 30,
        finishedAt: "2026-11-04T12:00:05.000Z",
      }),
    );
    let latest = readLatest(directory);
    assert.equal(latest.version, 1);
    assert.deepEqual(
      latest.observations.map((row) => [
        row.file,
        row.test,
        row.project ?? null,
        row.attempts,
      ]),
      [
        ["specs/a.spec.ts", ["suite", "earlier"], null, 1],
        ["specs/a.spec.ts", ["suite", "later"], null, 2],
        ["specs/b.spec.ts", ["alone"], null, 1],
        ["specs/b.spec.ts", ["alone"], "beta", 1],
      ],
    );
    assert.deepEqual(
      [...latest.observations].sort(compareObservations),
      latest.observations,
    );

    refreshProof(proof, {
      file: "specs/a.spec.ts",
      test: ["suite", "later"],
      outcome: "failed",
      attempts: 1,
      durationMs: 1,
      finishedAt: "2026-11-04T12:00:06.000Z",
      commit: "a".repeat(40),
    });
    latest = readLatest(directory);
    assert.equal(
      latest.observations.some(
        (row) =>
          row.file === "specs/a.spec.ts" &&
          row.test[1] === "later" &&
          row.project === undefined,
      ),
      false,
    );

    writeFileSync(
      path.join(proof, "stale.json"),
      `${JSON.stringify({
        version: 1,
        observations: [pass("specs/extra.spec.ts", ["gone"])],
      })}\n`,
    );
    refreshProof(
      proof,
      pass("specs/a.spec.ts", ["suite", "earlier"], {
        finishedAt: "2026-11-04T12:00:07.000Z",
      }),
    );
    assert.equal(existsSync(path.join(proof, "stale.json")), false);
    assert.deepEqual(
      readdirSync(proof).filter((name) => name.endsWith(".json")),
      ["latest.json"],
    );
    assert.equal(existsSync(`${proof}.lock`), false);
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
});

test("concurrent writers land every pass in one latest.json without a leftover lock", () => {
  const directory = scratchRepo("proof-store-refresh-");
  try {
    const proof = path.join(directory, "specs", "proof");
    const workers = 8;
    const script = `
      import { refreshProof } from ${JSON.stringify(storeUrl)};
      const file = process.argv[1];
      const index = process.argv[2];
      refreshProof(${JSON.stringify(proof)}, {
        file,
        test: ["concurrent", index],
        outcome: "passed",
        attempts: 1,
        durationMs: 1,
        finishedAt: new Date().toISOString(),
        commit: ${JSON.stringify("d".repeat(40))},
        fileBlob: ${JSON.stringify("e".repeat(40))},
      });
    `;
    const children = [];
    for (let index = 0; index < workers; index += 1) {
      const file = index % 2 === 0 ? "specs/a.spec.ts" : "specs/b.spec.ts";
      children.push(
        spawnSync(
          process.execPath,
          ["--input-type=module", "-e", script, file, String(index)],
          {
            encoding: "utf8",
          },
        ),
      );
    }
    for (const child of children) {
      assert.equal(child.status, 0, child.stderr);
    }
    const latest = readLatest(directory);
    assert.equal(latest.observations.length, workers);
    assert.equal(existsSync(`${proof}.lock`), false);
    assert.deepEqual(
      readdirSync(proof).filter((name) => name.endsWith(".json")),
      ["latest.json"],
    );
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
});
