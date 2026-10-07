// Where a Taken entry's Take time comes from, and how that addition becomes
// a clock start (`./sliceClockStart.ts`). Which profile records the Take is
// the progress source's (`./progressSource.ts`).

import type { ProfileAddition } from "./authenticatedProfileRead.ts";
import type { WorkEntry } from "./publishedWork.ts";
import { ReadProblem } from "./readProblem.ts";

// The one profile recording where the entry's progress is published, whose
// adding commit is the Take; none, when no profile records it; or a gap when
// the profiles cannot say which commit was the Take.
export type TakeSource =
  | { readonly kind: "profile"; readonly path: string }
  | { readonly kind: "not-recorded" }
  | { readonly kind: "unknown"; readonly problem: string };

export function takeSourceOf({ progressSource }: WorkEntry): TakeSource {
  switch (progressSource?.kind) {
    case "trunk":
    case "branch":
      return { kind: "profile", path: progressSource.profilePath };
    case "trunk-copy":
      return progressSource.branchUnknown === "not-recorded"
        ? { kind: "not-recorded" }
        : {
            kind: "unknown",
            problem:
              "The Take time cannot be determined because agent profiles could not be read.",
          };
    // Sources are always known once clocks are read; a clock never guesses
    // that no profile records the Take.
    case undefined:
      return {
        kind: "unknown",
        problem: "The Take time cannot be determined yet.",
      };
  }
}

// Only Taken entries whose plan slices are counted run a clock, from the
// commit time of the plan those slices were read from.
export function countedPlanPathOf(entry: WorkEntry): string | undefined {
  return entry.planSlices?.status === "interpreted"
    ? entry.planPath
    : undefined;
}

// When the Take was: the committer date of the commit that added the
// profile's current allocation. An addition the walk did not find, or one
// without a usable date, leaves the Take time unknown.
export function takeTimeOf(addition: ProfileAddition): Date {
  if (addition === null) {
    throw new ReadProblem(
      "The Take time cannot be determined: no commit adding the agent profile was found in its recent published history.",
    );
  }
  if (addition.committedAt === null) {
    throw new ReadProblem(
      "The Take time cannot be determined: the commit that added the agent profile names no usable commit time.",
    );
  }
  return new Date(addition.committedAt);
}
