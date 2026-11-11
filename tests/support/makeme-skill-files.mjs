// Candidate bytes for isolated public-command and native fixtures. The changed
// scope command shares the already-installed execution skill's Git collector.
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

export function makeMeSkillFiles(source, root) {
  const skill = join(source, "src/skills/dough-makeme");
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
    [`${root}/dough-execute-plan/scripts/consumer-trace-terms.mjs`]:
      readFileSync(
        join(
          source,
          "src/skills/dough-execute-plan/scripts/consumer-trace-terms.mjs",
        ),
        "utf8",
      ),
  };
}
