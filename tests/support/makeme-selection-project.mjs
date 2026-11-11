import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { makeMe } from "./makeMe.mjs";
import { materializeLocalCheckout } from "./repository-fixture.mjs";

const skill = fileURLToPath(
  new URL("../../src/skills/dough-makeme/", import.meta.url),
);
const installed = ".agents/skills/dough-makeme";

export async function materializeSelectionProject(t, settings) {
  const files = {
    [`${installed}/references/convention.md`]: readFileSync(
      join(skill, "references/convention.md"),
      "utf8",
    ),
  };
  for (const name of readdirSync(join(skill, "scripts"))) {
    files[`${installed}/scripts/${name}`] = readFileSync(
      join(skill, "scripts", name),
      "utf8",
    );
  }
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
  const result = spawnSync(
    process.execPath,
    [
      join(root, installed, "scripts/select-makeme.mjs"),
      "--project",
      root,
      "--",
      ...paths,
    ],
    { cwd: root, encoding: "utf8" },
  );
  assert.equal(result.stderr, "");
  return { code: result.status, answer: JSON.parse(result.stdout) };
}
export function intentSettingsForLocations(...locations) {
  return makeMe.intentSettings.withLocations(...locations).please();
}
