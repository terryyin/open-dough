import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { installedSkillPath } from "../../server/launchHosts.ts";
import { expect, test } from "../../tests/support/pageTest.ts";
import { startOrigin } from "../../tests/support/startOrigin.ts";

const exec = promisify(execFile);

test("an origin started with no description holds one commit of the installed skills and an empty valid backlog", async () => {
  const origin = await startOrigin();
  try {
    expect((await origin.originGit("rev-list", "--count", "main")).trim()).toBe(
      "1",
    );
    const files = (
      await origin.originGit("ls-tree", "-r", "--name-only", "main")
    )
      .trim()
      .split("\n");
    expect(files).toContain(".claude/skills/dough-execute-plan/SKILL.md");
    expect(files.filter((file) => file.startsWith(".planning/"))).toEqual([
      ".planning/PRODUCT-BACKLOG.md",
    ]);
    const backlog = installedSkillPath(
      "claude",
      { path: origin.project, shown: origin.project },
      "dough-product-backlog",
      "scripts",
      "product-backlog.mjs",
    );
    const { stdout } = await exec(
      process.execPath,
      [backlog, "adopt", "--all"],
      {
        cwd: origin.project,
      },
    );
    expect(stdout).toMatch(
      /All 0 active entries already record their identity/,
    );
  } finally {
    origin.cleanup();
  }
});
