// Review and file reads share story identity admission.
import { workIdentitySchema } from "../src/launchRequest.ts";
import {
  reviewedPublishedSessionSubjectSchema,
  type ReviewedPublishedSessionSubject,
  type ReviewedStorySubject,
} from "../src/reviewedWorkSubject.ts";
import { RefusedRequest } from "./localOrigin.ts";

export function queriedStoryIdentity(url: URL): string {
  const identity = workIdentitySchema.safeParse(
    url.searchParams.get("identity"),
  );
  if (!identity.success)
    throw new RefusedRequest(400, "The review identity is malformed.");
  return identity.data;
}

export function queriedStorySubject(url: URL): ReviewedStorySubject {
  return {
    source: url.searchParams.get("source") ?? "",
    identity: queriedStoryIdentity(url),
  };
}

// A published session names its owning story and UUID.
export function queriedPublishedSessionSubject(
  url: URL,
): ReviewedPublishedSessionSubject {
  const parsed = reviewedPublishedSessionSubjectSchema.safeParse({
    ...queriedStorySubject(url),
    published: url.searchParams.get("published"),
  });
  if (!parsed.success)
    throw new RefusedRequest(400, "The review session is malformed.");
  return parsed.data;
}
