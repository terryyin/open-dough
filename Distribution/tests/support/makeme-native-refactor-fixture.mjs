import { spawnSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { createMakeMeNativeFixture } from "./makeme-native-fixture.mjs";

export const refactorPrompt =
  "Use $dough-post-change-refactor to review and improve the current uncommitted change. Preserve the behavior and assertions of the staged backend/tests/access.test.mjs, untracked backend/tests/title.test.mjs and modified frontend/tests/preview.test.mjs tests. Keep production behavior unchanged, run focused tests after any edits, and do not commit.";

// These exact sources are the incoming change under observation, not a domain
// construction API. Repository and settings setup use the shared MakeMe fixture.
export const stagedAccess = `import assert from "node:assert/strict";
import test from "node:test";
import { canReadNote } from "../src/notes.mjs";

test("an owner can read their note", () => {
  const reader = { id: "owner-reader" };
  const note = { ownerId: reader.id, title: "Incidental", tags: [] };
  assert.equal(canReadNote(note, reader.id), true);
});

test("a different reader cannot read a note", () => {
  const owner = { id: "note-owner" };
  const reader = { id: "other-reader" };
  const note = { ownerId: owner.id, title: "Incidental", tags: [] };
  assert.equal(canReadNote(note, reader.id), false);
});
`;

export const untrackedTitle = `import assert from "node:assert/strict";
import test from "node:test";
import { previewTitle } from "../src/notes.mjs";

test("a long note title is truncated", () => {
  const note = { ownerId: "incidental-owner", title: "Readable title", tags: [] };
  assert.equal(previewTitle(note, 4), "Read");
});
`;

export const frontendAddition = `
test("a long title is shortened", () => {
  const note = { ownerId: "reader", title: "Preview title", tags: [] };
  assert.equal(previewTitle(note, 4), "Prev");
});
`;

function run(checkout, command, args) {
  const result = spawnSync(command, args, { cwd: checkout, encoding: "utf8" });
  if (result.status !== 0)
    throw new Error(`${command} failed: ${result.stderr || result.stdout}`);
  return result.stdout;
}

export async function createMakeMeRefactorFixture(source, host, directory) {
  const fixture = await createMakeMeNativeFixture(source, host, directory, {
    skills: false,
  });
  const checkout = fixture.integration;
  // Exercise the public installer; all native guidance/runtime then comes from
  // this installed payload, and the baseline commit keeps it out of test scope.
  run(checkout, "bash", [
    join(source, "install.sh"),
    "--source",
    source,
    "--target",
    checkout,
    "--platform",
    host,
  ]);
  writeFileSync(
    join(checkout, "AGENTS.md"),
    `This project uses Open Dough skills under ${host === "claude" ? ".claude" : ".agents"}/skills.\nShared test helpers live in tests/support. Run npm test for focused test proof and git diff --check for whitespace. There are no npm dependencies or generation commands.\n`,
  );
  run(checkout, "git", ["add", "."]);
  run(checkout, "git", [
    "-c",
    "core.hooksPath=/dev/null",
    "commit",
    "-m",
    "Install candidate guidance baseline",
  ]);
  writeFileSync(join(checkout, "backend/tests/access.test.mjs"), stagedAccess);
  run(checkout, "git", ["add", "backend/tests/access.test.mjs"]);
  writeFileSync(join(checkout, "backend/tests/title.test.mjs"), untrackedTitle);
  const frontend = join(checkout, "frontend/tests/preview.test.mjs");
  writeFileSync(frontend, readFileSync(frontend, "utf8") + frontendAddition);
  return fixture;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const [source, host, directory] = process.argv.slice(2);
  const fixture = await createMakeMeRefactorFixture(source, host, directory);
  process.stdout.write(
    `${JSON.stringify({ checkout: fixture.integration, prompt: refactorPrompt })}\n`,
  );
}
