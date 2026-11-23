import { spawnSync } from "node:child_process";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { makeMe } from "./makeMe.mjs";
import { materializeLocalCheckout } from "./repository-fixture.mjs";
import { makeMeSkillFiles } from "./makeme-skill-files.mjs";

const installed =
  ".agents/skills/dough-execute-plan/scripts/test-entry-rules.mjs";

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
export function runSourceSelection(root, ...paths) {
  return runSelection(
    root,
    paths.flatMap((path) => ["--source", path]),
  );
}
export function runChangedSelection(root, ...args) {
  return runSelection(root, ["--changed", ...args]);
}
function runSelection(root, args) {
  const result = spawnSync(
    process.execPath,
    [join(root, installed), "--project", root, ...args],
    { cwd: root, encoding: "utf8" },
  );
  return {
    code: result.status,
    stderr: result.stderr,
    answer: result.stdout ? JSON.parse(result.stdout) : undefined,
  };
}
export function selectedMakeMePaths(answer) {
  return answer.sources.filter(({ makeMe }) => makeMe).map(({ path }) => path);
}
export function intentSettingsForLocations(...locations) {
  return makeMe.intentSettings.withLocations(...locations).please();
}
