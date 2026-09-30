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

import { z } from "zod";
import {
  agentHosts,
  agentIdentity,
  agentModes,
  agentRotationFor,
  parseAgentProfileFile,
} from "../../src/skills/dough-product-backlog/scripts/product-backlog-agent-profile.mjs";
import {
  readAgentProfilesAt,
  type PublishedProfiles,
} from "./authenticatedProfileRead.ts";
import {
  attributionLoading,
  type HumanAttribution,
} from "./assignmentAttribution.ts";
import { rosterOf } from "./assignmentRoster.ts";
import type { PublishedSource } from "./publishedSource.ts";
import type { PublishedWork } from "./publishedWork.ts";

const agentMode = z.enum(agentModes);
const agentHost = z.enum(agentHosts);

const profileFacts = {
  name: z.string().min(1),
  identity: z.string().min(1),
  host: agentHost.optional(),
  model: z.string().min(1).optional(),
};

const readProfile = z.discriminatedUnion("ok", [
  z.object({
    ok: z.literal(true),
    profile: z.discriminatedUnion("activity", [
      z.object({
        ...profileFacts,
        activity: z.literal("execution"),
        mode: agentMode,
        branch: z.string().min(1),
      }),
      z.object({ ...profileFacts, activity: z.literal("preparation") }),
    ]),
  }),
  z.object({ ok: z.literal(false), error: z.string().min(1) }),
]);

export type AgentMode = z.infer<typeof agentMode>;
export type AgentHost = z.infer<typeof agentHost>;

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
type EntryAssignments<T extends AgentAssignment> =
  | { readonly status: "unavailable"; readonly problem: string }
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

function interpretProfiles({
  profiles,
  settings,
}: PublishedProfiles): ProfileAssignments {
  const assignments: ProfileAssignment[] = [];
  const unreadable: UnreadableProfile[] = [];
  for (const { path, text } of profiles) {
    const file = path.split("/").pop() ?? path;
    let raw: unknown;
    try {
      raw = parseAgentProfileFile(file, text);
    } catch (error) {
      raw = {
        ok: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
    const read = readProfile.safeParse(raw);
    if (!read.success) {
      unreadable.push({
        file,
        problem:
          "The shared profile reader answered in a shape this dashboard does not understand.",
      });
      continue;
    }
    if (!read.data.ok) {
      unreadable.push({ file, problem: read.data.error });
      continue;
    }
    const { profile } = read.data;
    const { name, identity, host, model } = profile;
    const facts: AgentAssignment = {
      profilePath: path,
      name,
      agent: agentIdentity(name).agent,
      host,
      model,
      human: attributionLoading,
    };
    if (profile.activity === "preparation") {
      assignments.push({ ...facts, activity: "preparation", identity });
    } else {
      const { activity, mode, branch } = profile;
      assignments.push({ ...facts, mode, branch, activity, identity });
    }
  }
  return {
    rotation: agentRotationFor(settings) as ProjectRotation,
    assignments,
    unreadable,
  };
}

// The assignments of one activity naming an entry, or the gap when none is
// recorded or the profiles could not be read.
function assignmentsOf<A extends ProfileAssignment["activity"]>(
  identity: string,
  activity: A,
  profiles: ProfileAssignments | undefined,
): EntryAssignments<Extract<ProfileAssignment, { readonly activity: A }>> {
  if (profiles === undefined) {
    return { status: "unavailable", problem: profilesUnreadProblem };
  }
  const named = profiles.assignments.filter(
    (
      assignment,
    ): assignment is Extract<ProfileAssignment, { readonly activity: A }> =>
      assignment.activity === activity && assignment.identity === identity,
  );
  return named.length === 0
    ? { status: "not-recorded" }
    : { status: "recorded", assignments: named };
}

// Every Taken entry waits for its owner, and the roster for every agent's
// assignment, while profiles are read.
export function awaitingOwners(work: PublishedWork): PublishedWork {
  return {
    ...work,
    roster: { status: "loading" },
    taken: work.taken.map((entry) => ({
      ...entry,
      owner: { status: "loading" },
    })),
  };
}

// Reads the revision's profiles; a failed or abandoned read is a gap on each
// Taken and queued entry, never an empty set of assignments.
export async function readAssignments(
  source: PublishedSource,
  revision: string,
  signal: AbortSignal,
): Promise<ProfileAssignments | undefined> {
  try {
    return interpretProfiles(
      await readAgentProfilesAt(source, revision, signal),
    );
  } catch {
    return undefined;
  }
}

export function withAssignments(
  work: PublishedWork,
  profiles: ProfileAssignments | undefined,
): PublishedWork {
  return {
    ...work,
    taken: work.taken.map((entry) => ({
      ...entry,
      owner: assignmentsOf(entry.identity, "execution", profiles),
    })),
    backlog: work.backlog.map((entry) => ({
      ...entry,
      preparing: assignmentsOf(entry.identity, "preparation", profiles),
    })),
    unreadableProfiles: profiles?.unreadable ?? [],
    roster:
      profiles === undefined
        ? { status: "unavailable", problem: profilesUnreadProblem }
        : rosterOf(work, profiles),
  };
}
