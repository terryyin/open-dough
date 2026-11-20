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

// A closed session named by its published close record's UUID, read through
// the configured project without local launch history.
export const reviewedPublishedSessionSubjectSchema = z.object({
  source: z.string().min(1),
  published: z.uuid(),
});
export type ReviewedPublishedSessionSubject = z.infer<
  typeof reviewedPublishedSessionSubjectSchema
>;

export const isReviewedSessionSubject = (
  subject: ReviewedWorkSubject,
): subject is ReviewedSessionSubject => "session" in subject;

export const isReviewedStorySubject = (
  subject: ReviewedWorkSubject,
): subject is ReviewedStorySubject => !isReviewedSessionSubject(subject);

// The story subject when this names a story; undefined for an ad hoc session.
export function reviewedStorySubject(
  subject: ReviewedWorkSubject,
): ReviewedStorySubject | undefined {
  return isReviewedStorySubject(subject) ? subject : undefined;
}

// The story identity when this names a story; undefined for an ad hoc session.
export function reviewedStoryIdentity(
  subject: ReviewedWorkSubject,
): string | undefined {
  return reviewedStorySubject(subject)?.identity;
}

// Whether two subjects name the same reviewed work of the same project.
export function sameReviewedWorkSubject(
  one: ReviewedWorkSubject,
  other: ReviewedWorkSubject,
): boolean {
  if (isReviewedSessionSubject(one)) {
    return (
      isReviewedSessionSubject(other) &&
      one.source === other.source &&
      one.host === other.host &&
      one.session === other.session
    );
  }
  return (
    !isReviewedSessionSubject(other) &&
    one.source === other.source &&
    one.identity === other.identity
  );
}

// Stable panel key for one subject; distinct for story vs session of a project.
export function reviewedWorkKey(subject: ReviewedWorkSubject): string {
  if (isReviewedSessionSubject(subject))
    return `${subject.source}\n${subject.host}\n${subject.session}`;
  return `${subject.source}\n${subject.identity}`;
}

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
