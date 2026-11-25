// A Review repository whose origin accepts a connection and never answers:
// an `ssh://` origin whose ssh command sleeps past any sync deadline the
// specs give, exec'd so an aborted fetch ends with its git. A project that never synced gets its repository created with
// that origin; renaming the fixture origin stays the refusing-origin fixture.
import { mkdir } from "node:fs/promises";
import { git } from "../../../Distribution/src/skills/dough-execute-plan/scripts/publication-git.mjs";
import { ReviewSyncDeadline } from "../../server/reviewRepository.ts";

export async function reviewOriginHangs(repository: string) {
  await mkdir(repository, { recursive: true });
  await git(repository, "init", "--quiet", "--bare");
  await git(
    repository,
    "config",
    "remote.origin.url",
    "ssh://example.invalid/x.git",
  );
  await git(
    repository,
    "config",
    "core.sshCommand",
    "exec sh -c 'exec sleep 5'",
  );
}

// An open's sync deadline short enough for a spec, whether or not the
// project synced before.
export const shortSyncDeadline = (ms: number) =>
  new ReviewSyncDeadline({ syncedMs: ms, neverSyncedMs: ms });

export const timedOutSync = (ms: number) =>
  `origin did not answer within ${ms / 1000} seconds`;
