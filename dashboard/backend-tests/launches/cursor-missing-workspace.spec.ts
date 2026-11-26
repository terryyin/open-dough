// A Cursor launch whose workspace is gone, as when an isolated session's
// worktree is removed before its continuation, names that workspace instead
// of asking to install Cursor (../../server/hosts/cursor/launchOutcomes.ts).
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { expect, test } from "vitest";
import { missingLaunchPath } from "../../server/hosts/cursor/launchOutcomes.ts";

test("a missing Cursor workspace is reported with its path instead of Cursor missing", () => {
  const present = mkdtempSync(path.join(tmpdir(), "cursor-workspace-"));
  const workspace = path.join(present, ".worktrees/session");
  try {
    const missing = missingLaunchPath(workspace);
    expect(missing).toMatchObject({
      kind: "failed",
      reason: "folder-not-found",
    });
    if (missing.kind !== "failed") throw new Error("Expected a failure.");
    expect(missing.explanation).toContain(workspace);
    expect(missing.explanation).not.toContain("Install and authenticate");
    expect(missingLaunchPath(present)).toMatchObject({
      kind: "failed",
      reason: "not-installed",
    });
  } finally {
    rmSync(present, { recursive: true });
  }
});
