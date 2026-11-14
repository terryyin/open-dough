// A project layout whose `.claude/skills/<name>` is a symlink to
// `.agents/skills/<name>`, as a project that shares one installed copy between
// hosts sets it up. Each installed skill is copied from this source tree, so a
// script's cross-skill imports resolve inside the installed layout.
import { cpSync, mkdirSync, symlinkSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const sourceSkills = dirname(dirname(dirname(fileURLToPath(import.meta.url))));

export const linkedSkills = [
  "dough-execute-plan",
  "dough-product-backlog",
  "dough-story-refinement",
];

// Installs the linked skills under `project` and returns, for a script
// relative to the skills root, its real and its symlinked invocation path.
export function installLinkedSkills(project) {
  const real = join(project, ".agents", "skills");
  const linked = join(project, ".claude", "skills");
  mkdirSync(real, { recursive: true });
  mkdirSync(linked, { recursive: true });
  for (const name of linkedSkills) {
    cpSync(join(sourceSkills, name), join(real, name), {
      recursive: true,
      filter: (path) => !path.endsWith(".test.mjs"),
    });
    symlinkSync(
      join("..", "..", ".agents", "skills", name),
      join(linked, name),
    );
  }
  return (script) => ({
    real: join(real, script),
    linked: join(linked, script),
  });
}
