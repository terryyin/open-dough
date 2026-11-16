// Admit the reviewed-work subject named on a review URL: story identity or
// session. Review answer and file admission share this discrimination so the
// dual-subject and session-malformed refusals stay one rule.
import { reviewedSessionSubjectSchema } from "../src/reviewedWorkSubject.ts";
import { RefusedRequest } from "./localOrigin.ts";
import { knownSource } from "./sessionAdmission.ts";

export type ReviewedWorkSubjectQuery =
  | {
      readonly kind: "story";
      readonly keys: readonly ["source", "identity"];
    }
  | {
      readonly kind: "session";
      readonly keys: readonly ["source", "host", "session"];
    };

export function reviewedWorkSubjectQuery(url: URL): ReviewedWorkSubjectQuery {
  const namesStory = url.searchParams.has("identity");
  const namesSession = url.searchParams.has("session");
  if (namesStory && namesSession)
    throw new RefusedRequest(
      400,
      "The review names both a story and a session.",
    );
  if (namesSession)
    return { kind: "session", keys: ["source", "host", "session"] };
  if (namesStory) return { kind: "story", keys: ["source", "identity"] };
  throw new RefusedRequest(400, "The review request is malformed.");
}

// Session subject from a review URL after the keys are known exact.
export function queriedReviewedSessionSubject(url: URL) {
  const parsed = reviewedSessionSubjectSchema.safeParse({
    source: url.searchParams.get("source"),
    host: url.searchParams.get("host"),
    session: url.searchParams.get("session"),
  });
  if (!parsed.success)
    throw new RefusedRequest(400, "The review session is malformed.");
  return {
    source: knownSource(parsed.data.source),
    host: parsed.data.host,
    session: parsed.data.session,
  };
}
