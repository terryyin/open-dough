// Resolve a workspace from source/story records and local Git under the shared
// workspace rule.
import { workIdentitySchema } from "../src/launchRequest.ts";
import type { LaunchRecord } from "../src/launchRecord.ts";
import type { PublishedSource } from "../src/publishedSource.ts";
import {
  reviewWorkspaceOf,
  severalWorktreesExplanation,
  type ReviewedWorkspace,
} from "../src/storyReviewWorkspace.ts";
import { keptRecords } from "./launchRecordStore.ts";
import { RefusedRequest } from "./localOrigin.ts";
import { localWorkspacesOf } from "./localWorkspaces.ts";
import { knownSource } from "./sessionAdmission.ts";

// The workspace the rule resolves for the story from these kept records, or
// from the project's worktrees when no record names one: local Git is read
// only then. A found worktree is compared with the project's trunk on
// `origin`, as a launch establishes its own. Several found worktrees resolve
// to none of them, with the explanation that names them.
export async function resolvedWorkspace(
  source: PublishedSource,
  identity: string,
  records: readonly LaunchRecord[],
): Promise<
  | { readonly kind: "workspace"; readonly established: ReviewedWorkspace }
  | { readonly kind: "ambiguous"; readonly explanation: string }
  | undefined
> {
  const resolved =
    reviewWorkspaceOf(records, [], source.id, identity) ??
    reviewWorkspaceOf(
      records,
      await localWorkspacesOf(source),
      source.id,
      identity,
    );
  if (resolved === undefined) return undefined;
  if (resolved.kind === "launched")
    return { kind: "workspace", established: resolved.established };
  if (resolved.kind === "ambiguous")
    return {
      kind: "ambiguous",
      explanation: severalWorktreesExplanation(resolved.found),
    };
  return {
    kind: "workspace",
    established: {
      workspace: resolved.found.path,
      branch: resolved.found.branch,
      remote: "origin",
      target: source.ref,
    },
  };
}

// The workspace the named story's review reads: its file diffs, commit
// ranges and mark. Several worktrees holding the story's claim are refused
// with their explanation, so none of them is read or marked.
export async function reviewedWorkspace(
  sourceId: string | null,
  identityNamed: string | null,
) {
  const source = knownSource(sourceId);
  const identity = workIdentitySchema.safeParse(identityNamed);
  if (!identity.success)
    throw new RefusedRequest(400, "The review identity is malformed.");
  const resolved = await resolvedWorkspace(
    source,
    identity.data,
    await keptRecords(source.id),
  );
  if (resolved === undefined)
    throw new RefusedRequest(
      404,
      "This story has no launch workspace to review.",
    );
  if (resolved.kind === "ambiguous")
    throw new RefusedRequest(409, resolved.explanation);
  return {
    source,
    identity: identity.data,
    established: resolved.established,
  };
}

// The workspace the story named in the query reviews.
export const queriedWorkspace = (url: URL) =>
  reviewedWorkspace(
    url.searchParams.get("source"),
    url.searchParams.get("identity"),
  );
