// Shared scratch checkout builders for proofStore unit tests.
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";

export function git(cwd, args) {
  const result = spawnSync("git", args, {
    cwd,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
  });
  assert.equal(
    result.status,
    0,
    `git ${args.join(" ")} failed: ${result.stderr}`,
  );
  return result.stdout.trim();
}

export function scratchRepo(prefix = "proof-store-") {
  const directory = mkdtempSync(path.join(tmpdir(), prefix));
  git(directory, ["init"]);
  git(directory, ["config", "user.email", "proof-store@example.com"]);
  git(directory, ["config", "user.name", "Proof Store"]);
  mkdirSync(path.join(directory, ".planning"), { recursive: true });
  mkdirSync(path.join(directory, "specs"), { recursive: true });
  writeFileSync(path.join(directory, "specs", "a.spec.ts"), "export {};\n");
  writeFileSync(path.join(directory, "specs", "b.spec.ts"), "export {};\n");
  writeFileSync(
    path.join(directory, ".planning", "open-dough.json"),
    `${JSON.stringify(
      {
        intent: {
          locations: [
            {
              path: "specs",
              kind: "typescript",
              runner: "playwright",
              proof: "specs/proof",
            },
          ],
        },
      },
      null,
      2,
    )}\n`,
  );
  git(directory, ["add", "."]);
  git(directory, ["commit", "-m", "seed"]);
  return directory;
}

export function readLatest(directory) {
  const file = path.join(directory, "specs", "proof", "latest.json");
  if (!existsSync(file)) return undefined;
  return JSON.parse(readFileSync(file, "utf8"));
}

export function pass(file, testNames, extras = {}) {
  return {
    file,
    test: testNames,
    outcome: "passed",
    attempts: 1,
    durationMs: 10,
    finishedAt: "2026-11-04T12:00:00.000Z",
    commit: "a".repeat(40),
    fileBlob: "b".repeat(40),
    ...extras,
  };
}
