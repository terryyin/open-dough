// Check the real installed closure guidance before its workspace can retire.
import { readFileSync } from "node:fs";
import path from "node:path";
import { expect } from "@playwright/test";

export function expectInstalledCompletionGuidance(workspace: string) {
  const installed = path.join(workspace, ".agents/skills");
  const attention = readFileSync(
    path.join(installed, "dough-land/references/completion-attention.md"),
    "utf8",
  );
  expect(attention).toContain("dashboard-completion.md");
  const instruction = readFileSync(
    path.join(installed, "dough-land/references/dashboard-completion.md"),
    "utf8",
  );
  expect(instruction).toContain("final operation");
  expect(instruction).toContain("--outcome unfinished");
  expect(instruction).toContain("no message file");
  const land = readFileSync(
    path.join(installed, "dough-land/SKILL.md"),
    "utf8",
  );
  const wrapUp = readFileSync(
    path.join(installed, "dough-story-wrap-up/SKILL.md"),
    "utf8",
  );
  expect(land).toContain("references/dashboard-completion.md");
  expect(wrapUp).toContain("../dough-land/references/dashboard-completion.md");
  // The installed instructions must be loaded while the checkout/reference still exists.
  expect(land).toContain("(references/worktree-retirement.md)");
  const retirement = readFileSync(
    path.join(installed, "dough-land/references/worktree-retirement.md"),
    "utf8",
  );
  expect(retirement.indexOf("(dashboard-completion.md)")).toBeLessThan(
    retirement.indexOf(
      "node <installed>/dough-land/scripts/worktree-retirement.mjs retire",
    ),
  );
  expect(
    wrapUp.indexOf("../dough-land/references/dashboard-completion.md"),
  ).toBeLessThan(wrapUp.indexOf("## Commit final closure"));
  expect(retirement).toContain("surviving working directory before removal");
  expect(wrapUp).toContain("before either Trunk Mode `finish`");
  expect(
    readFileSync(
      path.join(
        installed,
        "dough-execute-plan/references/wrap-up-closure-publication.md",
      ),
      "utf8",
    ),
  ).toContain("../../dough-land/references/dashboard-completion.md");
}
