// applyReleaseToWorktree invokes ordinary apply for the exact target with no
// --force, and a successful helper writes both native skill roots.
import { mkdtempSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { expect, test } from "../support/pageTest.ts";
import { applyReleaseToWorktree } from "../../server/worktreeReleaseApply.ts";
import { repoRoot } from "../support/repositoryRoot.ts";

const bothRootsHelper = path.join(
  repoRoot,
  "dashboard/tests/support/fakeReleaseApplyBothRoots.sh",
);

test("ordinary apply targets the worktree, never forces, and installs both skill roots", async () => {
  const target = mkdtempSync(path.join(tmpdir(), "dough-apply-"));
  const log = path.join(target, "apply.log");
  for (const root of [
    path.join(target, ".claude/skills/dough-execute-plan/scripts"),
    path.join(target, ".agents/skills/dough-execute-plan/scripts"),
  ]) {
    mkdirSync(root, { recursive: true });
    writeFileSync(path.join(root, "dashboard-landing.mjs"), "export {}\n");
  }
  const previous = process.env["OPEN_DOUGH_RELEASE_HELPER"];
  const previousLog = process.env["OPEN_DOUGH_FAKE_APPLY_LOG"];
  process.env["OPEN_DOUGH_RELEASE_HELPER"] = bothRootsHelper;
  process.env["OPEN_DOUGH_FAKE_APPLY_LOG"] = log;
  try {
    const result = await applyReleaseToWorktree(target, "claude");
    expect(result).toMatchObject({ kind: "updated" });
    expect(readFileSync(log, "utf8")).toBe(
      `apply --target ${target} --platform claude\n`,
    );
    expect(readFileSync(log, "utf8")).not.toContain("--force");
    for (const root of [".agents", ".claude"]) {
      expect(
        readFileSync(
          path.join(
            target,
            root,
            "skills/dough-execute-plan/scripts/first-landing-expectation.mjs",
          ),
          "utf8",
        ),
      ).toContain("both-roots");
    }
  } finally {
    if (previous === undefined) delete process.env["OPEN_DOUGH_RELEASE_HELPER"];
    else process.env["OPEN_DOUGH_RELEASE_HELPER"] = previous;
    if (previousLog === undefined)
      delete process.env["OPEN_DOUGH_FAKE_APPLY_LOG"];
    else process.env["OPEN_DOUGH_FAKE_APPLY_LOG"] = previousLog;
  }
});
