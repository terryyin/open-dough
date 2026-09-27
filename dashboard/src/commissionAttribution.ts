// The human developer credited for each published commission: the Git
// committer of the commit that added its agent profile's current allocation,
// as the local authenticated boundary found it by walking that profile's
// history back from the snapshot's revision. Only the snapshot's own readable
// profiles are asked about, each once per read. A later modification of the
// profile, an older allocation of the same rotating agent name, or any other
// commit never supplies the human; when the addition or a usable name cannot
// be established, the gap is said, never guessed. A matched GitHub account's
// avatar is shown only through the local boundary, which finds the account
// itself. Attribution says who commissioned the work, never that anyone is
// working now.

import {
  profileAvatarUrl,
  readProfileAdditionAt,
  type ProfileAddition,
} from "./authenticatedProfileRead.ts";
import type { ProfileAssignments } from "./agentAssignments.ts";
import type { PublishedSource } from "./publishedSource.ts";
import { ReadProblem } from "./readProblem.ts";
import { unansweredWithinReadWait } from "./readWaitBound.ts";

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
      // Where the local boundary serves the avatar of the GitHub account
      // GitHub matched to the committer, when it matched one.
      readonly avatar: string | undefined;
    };

export const attributionLoading: HumanAttribution = { status: "loading" };

function attributionOf(
  addition: ProfileAddition,
  avatar: string,
): HumanAttribution {
  if (addition === null) {
    return { status: "no-addition" };
  }
  return addition.committerName === null
    ? { status: "unnamed" }
    : {
        status: "credited",
        name: addition.committerName,
        avatar: addition.login === null ? undefined : avatar,
      };
}

// One profile's attribution at the snapshot's revision; a failed or
// abandoned read is its gap, and so is a walk still unanswered at the
// snapshot's wait bound: the snapshot itself was read.
async function attributionAt(
  source: PublishedSource,
  profilePath: string,
  revision: string,
  signal: AbortSignal,
): Promise<HumanAttribution> {
  try {
    return attributionOf(
      await readProfileAdditionAt(source, profilePath, revision, signal),
      profileAvatarUrl(source, profilePath, revision),
    );
  } catch (error) {
    return {
      status: "unavailable",
      problem:
        error instanceof ReadProblem
          ? error.message
          : signal.aborted
            ? `${unansweredWithinReadWait} while reading the commit that added this agent profile.`
            : "The commit that added this agent profile could not be read.",
    };
  }
}

// The snapshot's commissions, each with the human its own profile credits,
// read once per readable profile; `withAssignments` places them wherever
// assignments are shown. Each human is passed on to `onAttributed` as soon as
// its own walk ends, so a slow walk delays only its own credit.
export async function readAttributedAssignments(
  source: PublishedSource,
  revision: string,
  assignments: ProfileAssignments | undefined,
  signal: AbortSignal,
  onAttributed?: (assignments: ProfileAssignments) => void,
): Promise<ProfileAssignments | undefined> {
  if (assignments === undefined) {
    return undefined;
  }
  let attributed = assignments;
  await Promise.all(
    assignments.commissions.map(async ({ profilePath }, index) => {
      const human = await attributionAt(source, profilePath, revision, signal);
      attributed = {
        ...attributed,
        commissions: attributed.commissions.map((commission, each) =>
          each === index ? { ...commission, human } : commission,
        ),
      };
      onAttributed?.(attributed);
    }),
  );
  return attributed;
}
