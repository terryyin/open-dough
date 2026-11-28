// Which held files of one published revision have reached their raw handlers
// in the fake GitHub, from the `gh` calls it has received so far. A held group
// has reached its handlers only once every one of its files is among them:
// one file arriving does not establish that a sibling's already-started `gh`
// process has reached the fake GitHub too.

import type { GhCall } from "./support/fakeGitHub.ts";

export type HeldReads = {
  readonly repository: string;
  readonly revision: string;
  readonly paths: readonly string[];
};

export function heldPathsReached(
  calls: readonly GhCall[],
  held: HeldReads,
): string[] {
  return [
    ...new Set(
      calls.flatMap(({ request }) =>
        request.kind === "content" &&
        request.repository === held.repository &&
        request.revision === held.revision &&
        held.paths.includes(request.path)
          ? [request.path]
          : [],
      ),
    ),
  ].sort();
}
