// Fixture Git checkouts and CLI runs shared by the consumer-trace tests.
import assert from "node:assert/strict";
import { execFileSync, spawnSync } from "node:child_process";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const script = join(
  dirname(fileURLToPath(import.meta.url)),
  "consumer-trace.mjs",
);

export function repository(t, files, untracked = {}) {
  const root = mkdtempSync(join(tmpdir(), "dough-consumer-trace-"));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  const write = (entries) => {
    for (const [path, content] of Object.entries(entries)) {
      mkdirSync(dirname(join(root, path)), { recursive: true });
      writeFileSync(join(root, path), content);
    }
  };
  const git = (...args) =>
    execFileSync("git", ["-C", root, ...args], { encoding: "utf8" });
  git("init", "-q");
  write(files);
  git("add", "-A");
  git(
    "-c",
    "user.name=Fixture",
    "-c",
    "user.email=fixture@example.com",
    "commit",
    "-q",
    "-m",
    "fixture",
  );
  write(untracked);
  return root;
}

export function trace(...args) {
  return spawnSync(process.execPath, [script, ...args], { encoding: "utf8" });
}

export function section(output, heading) {
  const start = output.indexOf(`### ${heading}\n`);
  assert.notEqual(start, -1, `missing section ${heading}`);
  const end = output.indexOf("\n### ", start + 1);
  return output.slice(start, end === -1 ? undefined : end);
}
