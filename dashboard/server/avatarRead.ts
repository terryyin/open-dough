// The avatar of the human credited for one agent profile, for the local
// authenticated read boundary (`./authenticatedRead.ts`): only the GitHub
// account GitHub matched to the committer of the commit that added that
// profile's current allocation, as the boundary itself walks it at a pinned
// revision (`./ghProfileAddition.ts`, remembered in `./pinnedTexts.ts`), and
// only from the avatar source GitHub named for it. The image is fetched and
// kept by `./avatarImages.ts`. A request names a profile and revision, never
// an account or an image address, so this is no image proxy.

import type { IncomingMessage } from "node:http";
import type { AvatarImage } from "./avatarImages.ts";
import type { ProfileAddition } from "./ghProfileAddition.ts";
import type { Boundary } from "./performedRead.ts";
import type { PinnedTexts } from "./pinnedTexts.ts";
import { reportedFailure } from "./readFailureMessage.ts";
import { unreachable, type Outcome } from "./readOutcome.ts";
import { listedProfileAddition } from "./recordsBesideBacklog.ts";
import { parseAdditionRead, type AdditionRead } from "./additionRead.ts";
import { withTrackedGh } from "./trackedGh.ts";
import {
  contextForAvatarRead,
  withReadDiagnosticContext,
} from "./readDiagnostics.ts";
import type { PublishedSource } from "../src/publishedSource.ts";
import { readingAdditionAt } from "../src/authenticatedReadRules.ts";

export type AvatarOutcome =
  | { readonly kind: "image"; readonly image: AvatarImage }
  | Exclude<Outcome, { readonly kind: "answered" }>;

// Which profile's credited account an avatar read asks about: a listed agent
// profile at a pinned revision, as for its addition read, and nothing else.
export function parseAvatarRead(
  params: URLSearchParams,
): ReturnType<typeof parseAdditionRead> {
  if ([...params.keys()].sort().join("&") !== "path&revision&source") {
    return {
      kind: "refused",
      status: 400,
      message:
        "An avatar read names only a catalog source, a pinned revision, and an agent profile path.",
    };
  }
  return parseAdditionRead(params.get("revision"), params.get("path"));
}

function noAvatar(message: string): AvatarOutcome {
  return { kind: "refused", status: 404, message };
}

type AvatarBoundary = Pick<Boundary, "tracked" | "avatars"> & {
  readonly pinned: Pick<PinnedTexts, "lister" | "adder">;
};
type TrackAddition = (
  lookup: (signal: AbortSignal) => Promise<ProfileAddition | undefined>,
) => Promise<ProfileAddition | undefined>;

export async function performAvatarRead(
  req: IncomingMessage,
  boundary: AvatarBoundary,
  source: PublishedSource,
  params: URLSearchParams,
): Promise<AvatarOutcome> {
  const read = parseAvatarRead(params);
  if (read.kind === "refused") {
    return read;
  }
  return performAvatarAt(boundary, source, read, (lookup) =>
    withReadDiagnosticContext(
      contextForAvatarRead(source.id, read.revision),
      () => withTrackedGh(req, boundary.tracked, lookup),
    ),
  );
}

export async function performAvatarAt(
  { pinned, tracked, avatars }: AvatarBoundary,
  source: PublishedSource,
  read: AdditionRead,
  trackAddition: TrackAddition,
): Promise<AvatarOutcome> {
  let added;
  try {
    added = await trackAddition((signal) =>
      listedProfileAddition(pinned, source, read, signal),
    );
  } catch (error) {
    return {
      kind: "failed",
      ...reportedFailure(
        error,
        source,
        readingAdditionAt(read.path, read.revision),
      ),
    };
  }
  if (added === undefined) {
    return unreachable;
  }
  if (added === null || added.login === null) {
    return noAvatar(
      "No GitHub account is matched to the human who added this agent profile.",
    );
  }
  if (added.avatar === null) {
    return noAvatar(
      `GitHub named no usable avatar for ${added.login}, the account matched to the human who added this agent profile.`,
    );
  }
  try {
    return {
      kind: "image",
      image: await avatars.image(added.avatar, tracked),
    };
  } catch {
    // Refused as not a bounded image, or not fetched at all.
    return {
      kind: "failed",
      message: `The GitHub avatar of ${added.login} could not be fetched as a small image.`,
      retryAfterSeconds: undefined,
      recovery: undefined,
    };
  }
}
