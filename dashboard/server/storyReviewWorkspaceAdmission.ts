// Resolve a workspace from source/story records under the shared latest-workspace rule.
import { workIdentitySchema } from "../src/launchRequest.ts";
import { reviewWorkspaceOf } from "../src/storyReview.ts";
import { keptRecords } from "./launchRecordStore.ts";
import { RefusedRequest } from "./localOrigin.ts";
import { knownSource } from "./sessionAdmission.ts";
// The workspace the named story's review reads.
export async function reviewedWorkspace(
  sourceId: string | null,
  identityNamed: string | null,
) {
  const source = knownSource(sourceId);
  const identity = workIdentitySchema.safeParse(identityNamed);
  if (!identity.success)
    throw new RefusedRequest(400, "The review identity is malformed.");
  const found = reviewWorkspaceOf(
    await keptRecords(source.id),
    source.id,
    identity.data,
  );
  if (found === undefined)
    throw new RefusedRequest(
      404,
      "This story has no launch workspace to review.",
    );
  return { source, identity: identity.data, established: found.established };
}

// The workspace the story named in the query reviews.
export const queriedWorkspace = (url: URL) =>
  reviewedWorkspace(
    url.searchParams.get("source"),
    url.searchParams.get("identity"),
  );
