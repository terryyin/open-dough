// Keeps the done catalog beside the backlog current through the Git-aware
// adapters. An operation that changed the done directory has its catalog
// rebuilt from the final record files by the producer's own rebuild, and a
// change to the catalog alone never stops it, through a self-registered
// driver whose provisional result that rebuild settles. An operation that
// changed no done path leaves the catalog's bytes as they are.
import { join, posix } from "node:path";
import { fileURLToPath } from "node:url";
import { rebuildDoneCatalog } from "./product-backlog-complete.mjs";
import { doneCatalogPath } from "./product-backlog-done-catalog.mjs";
import { doneRecordDirectory } from "./product-backlog-done-record.mjs";
import {
  git,
  gitLine,
  registerMergeDriver,
} from "./product-backlog-git-repository.mjs";

const catalogDriver = {
  name: "dough-done-catalog",
  description: "Combine done catalog rows until the adapter rebuilds it",
  script: fileURLToPath(
    new URL("./product-backlog-git-done-catalog-driver.mjs", import.meta.url),
  ),
};

// The repository-relative done directory beside the backlog at `file`.
export function doneDirectoryBeside(file) {
  return posix.join(posix.dirname(file), doneRecordDirectory);
}

function doneCatalogBeside(file) {
  return posix.join(posix.dirname(file), doneCatalogPath);
}

// Registers the catalog beside the backlog at `file` to be combined by the
// catalog driver, which never reports a conflict.
export function ensureDoneCatalogDriverRegistered(repoRoot, file) {
  registerMergeDriver(repoRoot, doneCatalogBeside(file), catalogDriver);
}

// Whether any path under the done directory beside `file` differs between
// `base` and any of `sides` (commits or refs).
export function doneDirectoryChanged(repoRoot, file, base, sides) {
  const directory = doneDirectoryBeside(file);
  return sides.some(
    (side) =>
      gitLine(
        ["diff", "--name-only", base, side, "--", directory],
        repoRoot,
      ) !== "",
  );
}

// Rebuilds the catalog beside `file` from the record files in the worktree
// and stages the result (or its removal), once no record file there is left
// unresolved. While one is, nothing is rebuilt: a later call after the
// human's resolution rebuilds from the resolved records. Returns the
// rebuild's outcome, or undefined when it waited.
export function stageRebuiltDoneCatalog(repoRoot, file) {
  const catalog = doneCatalogBeside(file);
  const unresolvedRecords = git(
    ["ls-files", "-u", "-z", "--", doneDirectoryBeside(file)],
    repoRoot,
  )
    .split("\0")
    .filter((line) => line !== "" && line.split("\t")[1] !== catalog);
  if (unresolvedRecords.length > 0) return undefined;
  const outcome = rebuildDoneCatalog(join(repoRoot, posix.dirname(file)));
  if (outcome.status === "absent" || outcome.status === "removed") {
    git(["rm", "--cached", "-q", "--ignore-unmatch", "--", catalog], repoRoot);
  } else {
    git(["add", "--", catalog], repoRoot);
  }
  return outcome;
}
