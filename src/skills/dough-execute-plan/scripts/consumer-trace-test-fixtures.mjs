// Fixture Git checkouts and CLI runs shared by the consumer-trace tests.
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { makeMe } from "../../../../tests/support/makeMe.mjs";
import { materializeRepository } from "../../../../tests/support/repository-fixture.mjs";

const script = join(
  dirname(fileURLToPath(import.meta.url)),
  "consumer-trace.mjs",
);

// A checkout whose one trunk commit holds `files`, with `untracked` written
// after it.
export async function repository(t, files, untracked = {}) {
  const described = await materializeRepository(
    makeMe.aRepository
      .withRevision("fixture", { backlog: undefined, files })
      .please(),
  );
  t.after(described.cleanup);
  const root = described.integration;
  for (const [path, content] of Object.entries(untracked)) {
    mkdirSync(dirname(join(root, path)), { recursive: true });
    writeFileSync(join(root, path), content);
  }
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
