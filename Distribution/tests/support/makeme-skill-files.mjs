// Candidate bytes for isolated public-command and native fixtures. The changed
// scope command shares the already-installed execution skill's Git collector.
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

export function makeMeSkillFiles(source, root) {
  const skill = join(source, "Distribution/src/skills/dough-makeme");
  const paths = [
    "SKILL.md",
    "references/convention.md",
    ...readdirSync(join(skill, "scripts")).map((name) => `scripts/${name}`),
  ];
  return {
    ...Object.fromEntries(
      paths.map((path) => [
        `${root}/dough-makeme/${path}`,
        readFileSync(join(skill, path), "utf8"),
      ]),
    ),
    ...Object.fromEntries(
      [
        "references/test-entry-rules.md",
        "scripts/test-entry-rules.mjs",
        "scripts/test-entry-settings.mjs",
        "scripts/test-entry-rules-runtime.mjs",
        "scripts/test-entry-rules-LICENSE.txt",
        "scripts/git-changes.mjs",
        "scripts/ci-direct-entry.mjs",
      ].map((path) => [
        `${root}/dough-execute-plan/${path}`,
        readFileSync(
          join(source, "Distribution/src/skills/dough-execute-plan", path),
          "utf8",
        ),
      ]),
    ),
    ...Object.fromEntries(
      ["SKILL.md", "references/convention.md"].map((path) => [
        `${root}/dough-page-objects/${path}`,
        readFileSync(
          join(source, "Distribution/src/skills/dough-page-objects", path),
          "utf8",
        ),
      ]),
    ),
  };
}
