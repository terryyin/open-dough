// A story review names a known project and a work identity, exactly, never a
// path: its workspace comes from the project's kept launch records by the
// rule the card offers Review changes with (`reviewWorkspaceOf`).

import { workIdentitySchema } from "../src/launchRequest.ts";
import type { EstablishedContext } from "../src/launchRecord.ts";
import { reviewWorkspaceOf } from "../src/storyReview.ts";
import { keptRecords } from "./launchRecordStore.ts";
import { shownStartWorkspace } from "./launchWorkspace.ts";
import { RefusedRequest } from "./localOrigin.ts";
import { projectFolder } from "./projectFolders.ts";
import { knownSource, requireExactQuery } from "./sessionAdmission.ts";

export interface AdmittedReview {
  readonly kind: "review";
  readonly established: EstablishedContext;
  // The workspace as the page shows it.
  readonly shown: string;
}

export async function reviewRequest(url: URL): Promise<AdmittedReview> {
  requireExactQuery(url, ["source", "identity"], "review");
  const source = knownSource(url.searchParams.get("source"));
  const identity = workIdentitySchema.safeParse(
    url.searchParams.get("identity"),
  );
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
  return {
    kind: "review",
    established: found.established,
    shown: shownStartWorkspace(
      projectFolder(source),
      found.established.workspace,
    ),
  };
}
