import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { makeMe } from "./makeMe.mjs";
import { materializeLocalCheckout } from "./repository-fixture.mjs";
import { makeMeSkillFiles } from "./makeme-skill-files.mjs";

const installed = ".agents/skills/dough-makeme";

export async function materializeSelectionProject(t, settings, sources = {}) {
  const files = {
    ...sources,
    ...makeMeSkillFiles(
      fileURLToPath(new URL("../../..", import.meta.url)),
      ".agents/skills",
    ),
  };
  if (settings !== undefined)
    files[".planning/open-dough.json"] =
      typeof settings === "string" ? settings : JSON.stringify(settings);
  const fixture = await materializeLocalCheckout(
    undefined,
    makeMe.aRepository.withRevision("base", { backlog: null, files }).please(),
  );
  t.after(fixture.cleanup);
  return fixture.integration;
}
export function runMakeMeSelection(root, ...paths) {
  return runSelection(root, "select-makeme.mjs", ["--", ...paths]);
}
export function runChangedMakeMeSelection(root, ...args) {
  return runSelection(root, "changed-makeme.mjs", args);
}
function runSelection(root, command, args) {
  const result = spawnSync(
    process.execPath,
    [join(root, installed, `scripts/${command}`), "--project", root, ...args],
    { cwd: root, encoding: "utf8" },
  );
  assert.equal(result.stderr, "");
  return { code: result.status, answer: JSON.parse(result.stdout) };
}
export function intentSettingsForLocations(...locations) {
  return makeMe.intentSettings.withLocations(...locations).please();
}
