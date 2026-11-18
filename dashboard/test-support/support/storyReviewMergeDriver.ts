// A real merge driver that prints before merge-tree's result. Its external
// log proves the review invoked it, independently of the fixture's merge.
import { readFileSync } from "node:fs";
import path from "node:path";
import type { StartOrigin } from "./startOrigin.ts";
import { sixth } from "./storyReviewTrunk.ts";
import { commitAll, git, writeAt } from "./storyReviewWorktree.ts";

export function printingMergeDriver(origin: StartOrigin) {
  const log = path.join(origin.machine, "merge-driver.log");
  return {
    prepare: (workspace: string) => {
      git(
        origin.project,
        "config",
        "merge.printing.driver",
        `printf 'driver says hello\\n'; printf 'called\\n' >> '${log}'; git merge-file "%A" "%O" "%B"`,
      );
      for (const root of [origin.project, workspace]) {
        writeAt(root, ".gitattributes", "src/a.ts merge=printing\n");
      }
      // Story and trunk change separate lines, so the driver succeeds while
      // the independent c.ts conflict makes merge-tree exit 1.
      writeAt(workspace, "src/a.ts", sixth("a").replace("a 0\n", "a story\n"));
      commitAll(workspace, "story using a printing merge driver");
    },
    invocations() {
      return readFileSync(log, "utf8").split("\n").length - 1;
    },
  };
}
