// Reviewed work is one subject: a story of a project, or an ad hoc session.
// Query spelling matches other dashboard session requests: source with
// identity, or source with host and session. No repository or workspace path.

import { z } from "zod";
import { workIdentitySchema } from "./launchRequest.ts";
import { sessionHostSchema } from "./sessionReference.ts";

export const reviewedStorySubjectSchema = z.object({
  source: z.string().min(1),
  identity: workIdentitySchema,
});
export type ReviewedStorySubject = z.infer<typeof reviewedStorySubjectSchema>;

export const reviewedSessionSubjectSchema = z.object({
  source: z.string().min(1),
  host: sessionHostSchema,
  session: z.string().min(1),
});
export type ReviewedSessionSubject = z.infer<
  typeof reviewedSessionSubjectSchema
>;

export type ReviewedWorkSubject = ReviewedStorySubject | ReviewedSessionSubject;

export const isReviewedSessionSubject = (
  subject: ReviewedWorkSubject,
): subject is ReviewedSessionSubject => "session" in subject;

// The review URL query that names this subject, and nothing else of place.
export function reviewedWorkQuery(
  subject: ReviewedWorkSubject,
): Record<string, string> {
  if (isReviewedSessionSubject(subject))
    return {
      source: subject.source,
      host: subject.host,
      session: subject.session,
    };
  return { source: subject.source, identity: subject.identity };
}
