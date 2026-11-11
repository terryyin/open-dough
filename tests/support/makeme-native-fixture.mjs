import { fileURLToPath } from "node:url";
import { makeMe } from "./makeMe.mjs";
import { materializeLocalCheckout } from "./repository-fixture.mjs";
import { makeMeSkillFiles } from "./makeme-skill-files.mjs";

export const mixedPrompt =
  "Add regression tests in backend/tests/access.test.mjs and frontend/tests/preview.test.mjs. Cover a reader reading their own note and being denied another reader's note, and cover previewTitle truncating a note title to its first four characters. Keep production behavior unchanged and run the tests. Do not commit.";
export const optedOutPrompt =
  "Add a regression test only in frontend/tests/preview.test.mjs that covers previewTitle truncating a note title to its first four characters. Keep production behavior and other tests unchanged and run the test. Do not commit.";

export const application = `export function canReadNote(note, readerId) {
  return note.ownerId === readerId;
}
export function previewTitle(note, length) {
  return note.title.slice(0, length);
}
`;

const factory = `class ReaderBuilder {
  #id = "reader-default";
  identifiedAs(id) { this.#id = id; return this; }
  please() { return { id: this.#id }; }
}
class NoteBuilder {
  #owner = { id: "reader-default" };
  #title = "An incidental note";
  ownedBy(reader) { this.#owner = reader; return this; }
  titled(title) { this.#title = title; return this; }
  please() { return { ownerId: this.#owner.id, title: this.#title, tags: [] }; }
}
export const makeMe = {
  get aReader() { return new ReaderBuilder(); },
  get aNote() { return new NoteBuilder(); },
};
`;

export const baselineBackend = `import assert from "node:assert/strict";
import test from "node:test";
import { canReadNote } from "../src/notes.mjs";

test("a missing reader cannot read a note", () => {
  const note = { ownerId: "owner", title: "A note", tags: [] };
  assert.equal(canReadNote(note, undefined), false);
});
`;
export const baselineFrontend = `import assert from "node:assert/strict";
import test from "node:test";
import { previewTitle } from "../src/notes.mjs";

test("a short title stays whole", () => {
  const note = { ownerId: "reader", title: "Note", tags: [] };
  assert.equal(previewTitle(note, 8), "Note");
});
`;

export async function createMakeMeNativeFixture(
  source,
  host,
  directory,
  { skills = true } = {},
) {
  const locations = makeMe.intentSettings
    .withLocations(
      makeMe.anIntentLocation
        .at("backend/tests")
        .ofKind("javascript", ["*.test.mjs"])
        .usingMakeMe()
        .please(),
      makeMe.anIntentLocation
        .at("frontend/tests")
        .ofKind("javascript", ["*.test.mjs"])
        .usingMakeMe(false)
        .please(),
    )
    .please();
  const root = host === "claude" ? ".claude/skills" : ".agents/skills";
  const files = {
    "AGENTS.md": `This project uses Open Dough. Follow installed skills under ${root}/.\n`,
    "CLAUDE.md": "@AGENTS.md\nFollow installed skills under .claude/skills/.\n",
    ".planning/open-dough.json": `${JSON.stringify(locations, null, 2)}\n`,
    "package.json": `${JSON.stringify({ type: "module", scripts: { test: "node --test backend/tests/*.test.mjs frontend/tests/*.test.mjs" } })}\n`,
    "backend/src/notes.mjs": application,
    "frontend/src/notes.mjs": application,
    "backend/tests/access.test.mjs": baselineBackend,
    "frontend/tests/preview.test.mjs": baselineFrontend,
    "tests/support/makeMe.mjs": factory,
    ...(skills ? makeMeSkillFiles(source, root) : {}),
  };
  return materializeLocalCheckout(
    undefined,
    makeMe.aRepository.withRevision("base", { backlog: null, files }).please(),
    { at: directory, gitTemplates: false },
  );
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const [source, host, directory, journey] = process.argv.slice(2);
  const fixture = await createMakeMeNativeFixture(source, host, directory);
  process.stdout.write(
    `${JSON.stringify({ checkout: fixture.integration, prompt: journey === "mixed" ? mixedPrompt : optedOutPrompt })}\n`,
  );
}
