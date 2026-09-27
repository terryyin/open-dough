// Reads of the agent profiles published beside the backlog through the local
// authenticated read boundary (`../server/authenticatedRead.ts`), at a
// revision already resolved: with `agents=profiles`, every profile its
// directory listing names, and with a listed profile's `path` and
// `committed=added`, which commit added that profile's current allocation,
// when, and who committed it; and where the page shows that committer's
// GitHub avatar.

import { z } from "zod";
import {
  authenticatedGet,
  commitSha,
  unexpectedAnswer,
} from "./authenticatedGet.ts";
import {
  authenticatedAvatarEndpoint,
  readingAdditionAt,
} from "./authenticatedReadRules.ts";
import type { PublishedSource } from "./publishedSource.ts";

const okProfiles = z.object({
  revision: commitSha,
  profiles: z.array(z.object({ path: z.string().min(1), text: z.string() })),
});

// A published agent profile's repository path and raw text.
export type PublishedProfile = {
  readonly path: string;
  readonly text: string;
};

// The agent profiles published beside the backlog at `revision`, as the local
// boundary found them listed there; none when the revision has no profile
// directory. What a profile says is left to the shared profile reader.
export async function readAgentProfilesAt(
  source: PublishedSource,
  revision: string,
  signal: AbortSignal,
): Promise<readonly PublishedProfile[]> {
  const reading = `the agent profiles of ${source.repository} at ${revision}`;
  const body = await authenticatedGet(
    `source=${encodeURIComponent(source.id)}&revision=${encodeURIComponent(revision)}&agents=profiles`,
    reading,
    signal,
  );
  const parsed = okProfiles.safeParse(body);
  if (!parsed.success || parsed.data.revision !== revision) {
    throw unexpectedAnswer(reading);
  }
  return parsed.data.profiles;
}

const okAddition = z.object({
  revision: commitSha,
  path: z.string().min(1),
  added: z
    .object({
      commit: commitSha,
      committerName: z.string().min(1).nullable(),
      committedAt: z.iso.datetime({ offset: true }).nullable(),
      login: z.string().min(1).nullable(),
    })
    .nullable(),
});

// The commit that added a published agent profile's current allocation, with
// its Git committer's name, its committer date (when the allocation was made:
// the Take of the work it records), and the GitHub account matched to that
// committer, each null when unusable or unmatched; null when the boundary
// found no commit adding it in the profile's recent history.
export type ProfileAddition = z.infer<typeof okAddition>["added"];

// Which commit added each published agent profile's current allocation, as of
// one snapshot's revision.
export type ProfileAdditions = (
  profilePath: string,
) => Promise<ProfileAddition>;

// Which commit added the agent profile at `profilePath` as of `revision`, as
// the local boundary walked that profile's history back from the revision.
// An answer for another revision or profile is never taken for this one.
async function readProfileAdditionAt(
  source: PublishedSource,
  profilePath: string,
  revision: string,
  signal: AbortSignal,
): Promise<ProfileAddition> {
  const reading = readingAdditionAt(profilePath, revision);
  const body = await authenticatedGet(
    `source=${encodeURIComponent(source.id)}&revision=${encodeURIComponent(revision)}&path=${encodeURIComponent(profilePath)}&committed=added`,
    reading,
    signal,
  );
  const parsed = okAddition.safeParse(body);
  if (
    !parsed.success ||
    parsed.data.revision !== revision ||
    parsed.data.path !== profilePath
  ) {
    throw unexpectedAnswer(reading);
  }
  return parsed.data.added;
}

// One read's additions at `revision`: each profile's addition is asked once,
// however many details of the read need it (its assignment's human and its
// Take's slice clock), and each asker waits only for its own profile's.
export function profileAdditionsAt(
  source: PublishedSource,
  revision: string,
  signal: AbortSignal,
): ProfileAdditions {
  const asked = new Map<string, Promise<ProfileAddition>>();
  return (profilePath) => {
    let addition = asked.get(profilePath);
    if (addition === undefined) {
      addition = readProfileAdditionAt(source, profilePath, revision, signal);
      asked.set(profilePath, addition);
    }
    return addition;
  };
}

// Where the local boundary serves the GitHub avatar of the account matched to
// the human who added the profile at `profilePath` as of `revision`: a
// same-origin image, so the page never asks GitHub itself.
export function profileAvatarUrl(
  source: PublishedSource,
  profilePath: string,
  revision: string,
): string {
  return `${authenticatedAvatarEndpoint}?source=${encodeURIComponent(source.id)}&revision=${encodeURIComponent(revision)}&path=${encodeURIComponent(profilePath)}`;
}
