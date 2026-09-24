// Who holds each Taken entry, from the agent profiles published beside the
// backlog at the snapshot's revision. What a profile says is decided by the
// shared profile reader under `src/skills/dough-product-backlog/scripts/`;
// its answer is checked here for the fields this dashboard shows. A profile
// refers to its work by identity. An unreadable profile names no identity, so
// it is reported as unreadable and never matched to an entry by guess.

import { z } from "zod";
import {
  agentIdentity,
  parseAgentProfile,
} from "../../src/skills/dough-product-backlog/scripts/product-backlog-agent-profile.mjs";
import {
  readAgentProfilesAt,
  type PublishedProfile,
} from "./authenticatedRead";
import type { PublishedSource } from "./publishedSource";
import type { PublishedWork } from "./publishedWork";

const agentMode = z.enum(["trunk", "story-branch"]);
const agentHost = z.enum(["claude", "codex", "cursor"]);

const readProfile = z.discriminatedUnion("ok", [
  z.object({
    ok: z.literal(true),
    profile: z.object({
      name: z.string().min(1),
      identity: z.string().min(1),
      mode: agentMode,
      branch: z.string().min(1),
      host: agentHost.optional(),
      model: z.string().min(1).optional(),
    }),
  }),
  z.object({ ok: z.literal(false), error: z.string().min(1) }),
]);

export type AgentMode = z.infer<typeof agentMode>;
export type AgentHost = z.infer<typeof agentHost>;

// One published profile's facts; host and model stay undefined when the
// profile does not record them.
export type AgentOwner = {
  readonly agent: string;
  readonly mode: AgentMode;
  readonly branch: string;
  readonly host: AgentHost | undefined;
  readonly model: string | undefined;
};

export type TakenOwner =
  | { readonly status: "loading" }
  | { readonly status: "unavailable"; readonly problem: string }
  | { readonly status: "not-recorded" }
  | { readonly status: "recorded"; readonly owners: readonly AgentOwner[] };

// A published profile the shared reader could not read, by its file name.
export type UnreadableProfile = {
  readonly file: string;
  readonly problem: string;
};

type Ownership = {
  readonly owners: ReadonlyMap<string, readonly AgentOwner[]>;
  readonly unreadable: readonly UnreadableProfile[];
};

const profilesUnreadProblem = "Agent profiles could not be read.";

function interpretProfiles(profiles: readonly PublishedProfile[]): Ownership {
  const owners = new Map<string, AgentOwner[]>();
  const unreadable: UnreadableProfile[] = [];
  for (const { path, text } of profiles) {
    const file = path.split("/").pop() ?? path;
    let raw: unknown;
    try {
      raw = parseAgentProfile(text);
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
    const { name, identity, mode, branch, host, model } = read.data.profile;
    owners.set(identity, [
      ...(owners.get(identity) ?? []),
      { agent: agentIdentity(name).agent, mode, branch, host, model },
    ]);
  }
  return { owners, unreadable };
}

function ownerOf(
  identity: string,
  ownership: Ownership | undefined,
): TakenOwner {
  if (ownership === undefined) {
    return { status: "unavailable", problem: profilesUnreadProblem };
  }
  const owners = ownership.owners.get(identity);
  return owners === undefined
    ? { status: "not-recorded" }
    : { status: "recorded", owners };
}

// Every Taken entry waits for its owner while profiles are read.
export function awaitingOwners(work: PublishedWork): PublishedWork {
  return {
    ...work,
    taken: work.taken.map((entry) => ({
      ...entry,
      owner: { status: "loading" },
    })),
  };
}

// Reads the revision's profiles; a failed or abandoned read is a gap on each
// Taken entry, never an empty ownership.
export async function readOwnership(
  source: PublishedSource,
  revision: string,
  signal: AbortSignal,
): Promise<Ownership | undefined> {
  try {
    return interpretProfiles(
      await readAgentProfilesAt(source, revision, signal),
    );
  } catch {
    return undefined;
  }
}

export function withOwners(
  work: PublishedWork,
  ownership: Ownership | undefined,
): PublishedWork {
  return {
    ...work,
    taken: work.taken.map((entry) => ({
      ...entry,
      owner: ownerOf(entry.identity, ownership),
    })),
    unreadableProfiles: ownership?.unreadable ?? [],
  };
}
