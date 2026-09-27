// The human developer credited for each published commission: the Git
// committer of the commit that added its agent profile's current allocation,
// as the local authenticated boundary found it by walking that profile's
// history back from the snapshot's revision. Only the snapshot's own readable
// profiles are asked about, each once per read. A later modification of the
// profile, an older allocation of the same rotating agent name, or any other
// commit never supplies the human; when the addition or a usable name cannot
// be established, the gap is said, never guessed. Attribution says who
// commissioned the work, never that anyone is working now.

import {
  readProfileAdditionAt,
  type ProfileAddition,
} from "./authenticatedProfileRead.ts";
import type { ProfileAssignments } from "./agentAssignments.ts";
import type { PublishedSource } from "./publishedSource.ts";
import { ReadProblem } from "./readProblem.ts";

export type HumanAttribution =
  | { readonly status: "loading" }
  // The addition could not be read.
  | { readonly status: "unavailable"; readonly problem: string }
  // The read profile history has no commit adding this allocation.
  | { readonly status: "no-addition" }
  // The addition was found, but its committer's name is not usable.
  | { readonly status: "unnamed" }
  | {
      readonly status: "credited";
      readonly name: string;
      // The GitHub account GitHub matched to the committer, when it matched
      // one.
      readonly login: string | undefined;
    };

export const attributionLoading: HumanAttribution = { status: "loading" };

function attributionOf(addition: ProfileAddition): HumanAttribution {
  if (addition === null) {
    return { status: "no-addition" };
  }
  return addition.committerName === null
    ? { status: "unnamed" }
    : {
        status: "credited",
        name: addition.committerName,
        login: addition.login ?? undefined,
      };
}

// One profile's attribution at the snapshot's revision; a failed or
// abandoned read is its gap.
async function attributionAt(
  source: PublishedSource,
  profilePath: string,
  revision: string,
  signal: AbortSignal,
): Promise<HumanAttribution> {
  try {
    return attributionOf(
      await readProfileAdditionAt(source, profilePath, revision, signal),
    );
  } catch (error) {
    return {
      status: "unavailable",
      problem:
        error instanceof ReadProblem
          ? error.message
          : "The commit that added this agent profile could not be read.",
    };
  }
}

// The snapshot's commissions, each with the human its own profile credits,
// read once per readable profile; `withAssignments` places them wherever
// assignments are shown.
export async function readAttributedAssignments(
  source: PublishedSource,
  revision: string,
  assignments: ProfileAssignments | undefined,
  signal: AbortSignal,
): Promise<ProfileAssignments | undefined> {
  return (
    assignments && {
      ...assignments,
      commissions: await Promise.all(
        assignments.commissions.map(async (commission) => ({
          ...commission,
          human: await attributionAt(
            source,
            commission.profilePath,
            revision,
            signal,
          ),
        })),
      ),
    }
  );
}
