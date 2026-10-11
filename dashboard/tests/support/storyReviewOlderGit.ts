import { execFileSync } from "node:child_process";
import { chmodSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { test } from "./preparationPage.ts";

// The dashboard's Git as one before 2.45: `merge-tree` refuses the marked
// tree as not a commit; every other call reaches the real Git. `gitRestates`
// makes it the real Git throughout, or the older one again.
const restates = "restates";

// Whether the dashboard's Git of `olderGit`, on the path it prefixed, can
// restate trees after all.
export function gitRestates(pathPrefix: readonly string[], able: boolean) {
  const marker = path.join(pathPrefix[0] ?? "", restates);
  if (able) writeFileSync(marker, "");
  else rmSync(marker, { force: true });
}

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
        `if [ "$1" = merge-tree ] && [ ! -e '${path.join(bin, restates)}' ]; then`,
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
