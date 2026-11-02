// Which published story branch a Taken entry's work is on, decided only from
// the owner already read from trunk's agent profiles (`./agentAssignments.ts`):
// the single recorded Story Branch Mode profile's branch, or why there is
// none. Slice progress routes on it (`./progressRoute.ts`), and Intent's CI
// status judges the same branch. No branch is ever inferred from a name, and
// a recorded name the local read boundary would refuse is never read.

import type { TakenOwner } from "./agentAssignments.ts";
import { isSafeBranchName } from "./authenticatedReadRules.ts";

export type StoryBranch =
  // The owner is not read yet, or the entry has none (queued or done).
  | { readonly kind: "unknown" }
  // No agent profile records the entry.
  | { readonly kind: "not-recorded" }
  // The agent profiles could not be read.
  | { readonly kind: "profiles-unreadable" }
  // More than one profile names the entry, or a recorded owner lists none,
  // so there is no single branch.
  | { readonly kind: "conflicting" }
  // Trunk Mode: the work is published on trunk.
  | { readonly kind: "trunk"; readonly profilePath: string }
  // A recorded name this dashboard cannot use.
  | {
      readonly kind: "unsafe";
      readonly branch: string;
      readonly profilePath: string;
    }
  | {
      readonly kind: "branch";
      readonly branch: string;
      readonly profilePath: string;
    };

export function storyBranchOf(owner: TakenOwner | undefined): StoryBranch {
  switch (owner?.status) {
    case "not-recorded":
      return { kind: "not-recorded" };
    case "unavailable":
      return { kind: "profiles-unreadable" };
    case "recorded": {
      const [only, ...others] = owner.assignments;
      if (only === undefined || others.length > 0) {
        return { kind: "conflicting" };
      }
      const { branch, profilePath } = only;
      if (only.mode === "trunk") return { kind: "trunk", profilePath };
      return isSafeBranchName(branch)
        ? { kind: "branch", branch, profilePath }
        : { kind: "unsafe", branch, profilePath };
    }
    case "loading":
    case undefined:
      return { kind: "unknown" };
  }
}
