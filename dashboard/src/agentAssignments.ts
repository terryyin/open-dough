// Who holds each Taken entry, and who is preparing each queued entry, from
// the agent profiles published beside the backlog at the snapshot's revision.
// What a profile says is decided by the shared profile reader under
// `src/skills/dough-product-backlog/scripts/`; its answer is checked here for
// the fields this dashboard shows. A profile refers to its work by identity.
// An unreadable profile names no identity, so it is reported as unreadable and
// never matched to an entry by guess; a profile whose text names another agent
// than its file is unreadable for the file's agent and assigns no one. A
// preparation assignment records no execution mode or branch: it is only ever
// a queued entry's preparer, never an execution owner, so it cannot route
// progress or start a slice clock.

import {
  agentHosts,
  agentModes,
} from "../../src/skills/dough-product-backlog/scripts/product-backlog-agent-profile.mjs";
import { readAgentProfilesAt } from "./authenticatedProfileRead.ts";
import type { HumanAttribution } from "./assignmentAttribution.ts";
import { interpretProfiles } from "./interpretAgentProfiles.ts";
import {
  gapCauseFromOutcome,
  settleAnswered,
  settleGapCause,
  shouldAsk,
  type ObservationOutcomes,
  type ReadQuestion,
} from "./observationOutcomes.ts";
import type { PublishedSource } from "./publishedSource.ts";
import {
  gapCauseOf,
  gapRetention,
  limitGapProblem,
  type UnavailableGap,
} from "./readWaitBound.ts";

export type AgentMode = (typeof agentModes)[number];
export type AgentHost = (typeof agentHosts)[number];

// One published assignment's developer facts, and the repository path its
// profile is published at; host and model stay undefined when the profile
// does not record them. `name` is the agent's place in the shared rotation;
// `agent` is how it is shown. `human` is who committed the profile's current
// allocation (`./assignmentAttribution.ts`), loading until that is read.
export type AgentAssignment = {
  readonly profilePath: string;
  readonly name: string;
  readonly agent: string;
  readonly host: AgentHost | undefined;
  readonly model: string | undefined;
  readonly human: HumanAttribution;
};

// An execution assignment also records where its work is published.
export type AgentOwner = AgentAssignment & {
  readonly mode: AgentMode;
  readonly branch: string;
};

// The published assignments naming one entry, or the gap when none is
// recorded or the profiles could not be read.
export type EntryAssignments<T extends AgentAssignment> =
  | UnavailableGap
  | { readonly status: "not-recorded" }
  | { readonly status: "recorded"; readonly assignments: readonly T[] };

export type TakenOwner =
  { readonly status: "loading" } | EntryAssignments<AgentOwner>;

// Queued entries only: the published preparation assignments naming the
// entry. More than one is conflicting evidence, shown as such, never resolved
// by picking one. It records an undertaking, not live activity.
export type Preparing = EntryAssignments<AgentAssignment>;

// A published profile the shared reader could not read, by its file name.
export type UnreadableProfile = {
  readonly file: string;
  readonly problem: string;
};

// A readable published profile as its agent's assignment: the work it names
// by identity, and whether that work is being prepared or is Taken.
export type ProfileAssignment = (
  | (AgentAssignment & { readonly activity: "preparation" })
  | (AgentOwner & { readonly activity: "execution" })
) & { readonly identity: string };

// The rotation the project's setting selects, or why the setting is unreadable.
export type ProjectRotation =
  | { readonly ok: true; readonly names: readonly string[] }
  | { readonly ok: false; readonly error: string };

// The readable profiles as assignments, and the unreadable ones by file, with
// the rotation the project setting selects.
export type ProfileAssignments = {
  readonly rotation: ProjectRotation;
  readonly assignments: readonly ProfileAssignment[];
  readonly unreadable: readonly UnreadableProfile[];
};

const profilesUnreadProblem = "Agent profiles could not be read.";

// Profiles that could not be read, and why, with typed failure meaning when
// the observation retained a cause.
export type ProfilesUnread = {
  readonly unread: string;
  readonly resumesAt?: Date;
  readonly recovery?: "transient";
  readonly bound?: true;
};

export function profilesQuestion(
  sourceId: string,
  revision: string,
): ReadQuestion {
  return {
    sourceId,
    revision,
    operation: "profiles",
  };
}

// What a read of the revision's profiles established.
export type ProfilesRead = ProfileAssignments | ProfilesUnread;

export function profilesUnread(read: ProfilesRead): read is ProfilesUnread {
  return "unread" in read;
}

// Reads the revision's profiles; a failed or bound-interrupted read is a gap
// on each Taken and queued entry, never an empty set of assignments, said as
// the limit when GitHub's rate limit stopped it. Typed failure meaning is
// retained on the gap and the observation's outcome owner.
export async function readAssignments(
  source: PublishedSource,
  revision: string,
  signal: AbortSignal,
  outcomes: ObservationOutcomes,
  bound: AbortSignal,
): Promise<ProfilesRead> {
  const question = profilesQuestion(source.id, revision);
  const prior = outcomes.of(question);
  if (!shouldAsk(outcomes, question) && prior !== undefined) {
    if (prior.kind === "failed" || prior.kind === "bound") {
      const cause = gapCauseFromOutcome(prior, profilesUnreadProblem);
      return {
        unread: profilesUnreadProblem,
        ...(cause === undefined ? {} : gapRetention(cause)),
      };
    }
    // Answered: the listing memo answers without re-settling under the bound.
    return interpretProfiles(
      await readAgentProfilesAt(source, revision, signal),
    );
  }
  try {
    const read = interpretProfiles(
      await readAgentProfilesAt(source, revision, signal),
    );
    settleAnswered(outcomes, question);
    return read;
  } catch (error) {
    const cause = gapCauseOf(
      error,
      signal,
      bound,
      "the agent profiles",
      profilesUnreadProblem,
    );
    settleGapCause(outcomes, question, cause);
    return {
      unread: limitGapProblem(error) ?? profilesUnreadProblem,
      ...gapRetention(cause),
    };
  }
}
