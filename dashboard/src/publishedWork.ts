// The snapshot the dashboard shows: what one published backlog revision says,
// and the evidence of where and when it was read (`./publishedWorkRead.ts`
// reads it).

import type { PublishedSource } from "./publishedSource.ts";
import type { ProgressSource } from "./progressSource.ts";
import type { SliceClock } from "./sliceClockStart.ts";
import type { SourceLink } from "./sourceLink.ts";
import type { WorkPreparation } from "./storyPreparation.ts";
import type { WorkPlanSlices } from "./storyPlan.ts";
import type { WorkPurpose } from "./storyPurpose.ts";
import type {
  Preparing,
  TakenOwner,
  UnreadableProfile,
} from "./agentAssignments.ts";
import type { AgentRoster } from "./commissionRoster.ts";

export type WorkEntry = {
  readonly identity: string;
  readonly title: string;
  // Where the entry's recorded links lead at this snapshot's revision. An
  // entry records one canonical link and may record the plan it is taken with.
  readonly canonical: SourceLink;
  readonly plan?: SourceLink;
  // Navigation derived from canonical story-state; raw backlog evidence stays above.
  readonly associatedPlan?: SourceLink;
  // The repository path of the plan story-state records, resolved once beside
  // the canonical record when preparation facts are read; absent when no plan
  // is recorded or its path does not resolve inside the observed repository.
  // Trunk's and the story branch's copies of the plan are read at this path.
  readonly planPath?: string;
  // Preparation facts from the same revision. Starts as loading while
  // dependent canonical and plan files are read through the local
  // authenticated boundary.
  readonly preparation?: WorkPreparation;
  // Recorded Goal from the canonical home at this revision.
  readonly purpose?: WorkPurpose;
  // Ordered slices from the associated plan at this revision when planning
  // facts are known, or, for a Taken entry in Story Branch Mode, from that
  // plan at its recorded branch head. Absent when no plan applies; never
  // invents zero slices for an unsupported layout.
  readonly planSlices?: WorkPlanSlices;
  // Taken entries with plan slices only: where those slices were read, once
  // known.
  readonly progressSource?: ProgressSource;
  // Taken entries only: who holds the work, from the agent profile published
  // at this revision.
  readonly owner?: TakenOwner;
  // Queued entries only: who is preparing the work, from the preparation
  // assignments published at this revision; absent until profiles are read.
  readonly preparing?: Preparing;
  // Taken entries with counted plan slices only: when the current slice
  // started, from commit times where those slices were read.
  readonly sliceClock?: SliceClock;
};

export type PublishedWork = {
  readonly source: PublishedSource;
  readonly revision: string;
  readonly retrievedAt: Date;
  // "" when the backlog records no near-future direction.
  readonly direction: string;
  readonly taken: readonly WorkEntry[];
  readonly backlog: readonly WorkEntry[];
  // Published agent profiles that could not be read; none are matched to an
  // entry.
  readonly unreadableProfiles?: readonly UnreadableProfile[];
  // Every agent of the rotation and its published commissions at this
  // revision; loading until the profiles are read.
  readonly roster?: AgentRoster;
};

// Receives each more complete snapshot of one read as it becomes known.
export type PublishedWorkProgress = (work: PublishedWork) => void;

// A revision as it is said inside a sentence. The source evidence and every
// pinned link keep the whole revision.
export function shortRevision(revision: string): string {
  return revision.slice(0, 7);
}
