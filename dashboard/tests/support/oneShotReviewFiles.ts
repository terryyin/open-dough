// Literal file fixtures and later trunk changes stay outside the review reader.
import {
  mkdirSync,
  readFileSync,
  renameSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import path from "node:path";
import type { LandingReceipt } from "../../src/launchLanding.ts";
import { git } from "./oneShotLanding.ts";
// Commit the text/rename/binary baseline before the one-shot start.
export function baseline(project: string) {
  writeFileSync(path.join(project, "text.txt"), "kept\nbefore\n");
  writeFileSync(path.join(project, "gone.txt"), "deleted\n");
  writeFileSync(
    path.join(project, "old.txt"),
    Array.from(
      Array.from({ length: 20 }).keys(),
      (i) => `rename ${String(i)}\n`,
    ).join(""),
  );
  writeFileSync(path.join(project, "binary.bin"), Buffer.from([0, 1, 2]));
  git(project, "add", ".");
  git(project, "commit", "-m", "Review baseline");
  git(project, "push", "origin", "main");
}

export function writeReviewResult(workspace: string) {
  writeFileSync(path.join(workspace, "text.txt"), "kept\nafter\nextra\n");
  writeFileSync(path.join(workspace, "binary.bin"), Buffer.from([0, 3, 4]));
  git(workspace, "add", ".");
  git(workspace, "commit", "-m", "First delivered commit");
  mkdirSync(path.join(workspace, "new"));
  renameSync(
    path.join(workspace, "old.txt"),
    path.join(workspace, "new/moved.txt"),
  );
  writeFileSync(
    path.join(workspace, "new/moved.txt"),
    `${readFileSync(path.join(workspace, "new/moved.txt"), "utf8")}renamed addition\n`,
  );
  rmSync(path.join(workspace, "gone.txt"));
  writeFileSync(path.join(workspace, "added.txt"), "one\ntwo\n");
  git(workspace, "add", ".");
  git(workspace, "commit", "-m", "Second delivered commit");
}
export function advanceAndRevert(project: string, receipt: LandingReceipt) {
  // Trunk moves to a later writer and reverts both delivered commits.
  git(project, "fetch", "origin");
  git(project, "merge", "--ff-only", "origin/main");
  writeFileSync(path.join(project, "later-writer.txt"), "later\n");
  git(project, "add", ".");
  git(project, "commit", "-m", "Another writer");
  git(project, "revert", "--no-edit", `${receipt.base}..${receipt.revision}`);
  git(project, "push", "origin", "main");
}
