import type { PublishedSource } from "../src/publishedSource.ts";
import { pathSelectedByIntentLocations } from "./intentLocationSelection.ts";
import type { PinnedTexts } from "./pinnedTexts.ts";
import { pathReachableFromRevision } from "./reachablePaths.ts";
import { answered, unreachable, type Outcome } from "./readOutcome.ts";
import type { RequestedRead } from "./requestedRead.ts";

// The selected revision's backlog and Intent locations decide which files
// and commit times can be read there.
export async function performPinnedFileRead(
  pinned: Pick<PinnedTexts, "reader" | "committer">,
  source: PublishedSource,
  {
    kind,
    revision,
    path,
  }: Extract<RequestedRead, { kind: "file-at" | "commit-time-at" }>,
  signal: AbortSignal,
): Promise<Outcome> {
  const readPinned = pinned.reader(source, revision, signal);
  if (
    !(await pathReachableFromRevision(source, revision, path, readPinned)) &&
    !(await pathSelectedByIntentLocations(path, readPinned))
  ) {
    return unreachable;
  }
  return kind === "file-at"
    ? answered({ revision, path, text: await readPinned(path) })
    : answered({
        revision,
        path,
        committedAt: await pinned.committer(source, revision, signal)(path),
      });
}
