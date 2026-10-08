import { execFileSync } from "node:child_process";
import { chmodSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { test } from "./preparationPage.ts";

// The dashboard's Git as one before 2.45: `merge-tree` refuses the marked
// tree as not a commit; every other call reaches the real Git.
export const olderGit = test.extend({
  // Playwright's fixture API requires the empty destructuring pattern.
  // eslint-disable-next-line no-empty-pattern
  pathPrefix: async ({}, use) => {
    const bin = mkdtempSync(path.join(tmpdir(), "dough-older-git-"));
    const realGit = execFileSync("which", ["git"], { encoding: "utf8" }).trim();
    const wrapper = path.join(bin, "git");
    writeFileSync(
      wrapper,
      [
        "#!/bin/sh",
        'if [ "$1" = merge-tree ]; then',
        '  echo "fatal: $6 is not a commit" >&2',
        "  exit 128",
        "fi",
        `exec '${realGit}' "$@"`,
        "",
      ].join("\n"),
    );
    chmodSync(wrapper, 0o755);
    await use([bin]);
    rmSync(bin, { recursive: true, force: true });
  },
});
