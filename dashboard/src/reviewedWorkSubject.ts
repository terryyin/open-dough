// Review names a story and, for its published session ranges, that session.
import { z } from "zod";
import { workIdentitySchema } from "./launchRequest.ts";

export const reviewedStorySubjectSchema = z.object({
  source: z.string().min(1),
  identity: workIdentitySchema,
});
export type ReviewedStorySubject = z.infer<typeof reviewedStorySubjectSchema>;

export const reviewedPublishedSessionSubjectSchema =
  reviewedStorySubjectSchema.extend({ published: z.uuid() });
export type ReviewedPublishedSessionSubject = z.infer<
  typeof reviewedPublishedSessionSubjectSchema
>;

export type ReviewedWorkSubject =
  ReviewedStorySubject | ReviewedPublishedSessionSubject;

export const isReviewedPublishedSessionSubject = (
  subject: ReviewedWorkSubject,
): subject is ReviewedPublishedSessionSubject => "published" in subject;

function sessionId(subject: ReviewedWorkSubject) {
  return isReviewedPublishedSessionSubject(subject)
    ? subject.published
    : undefined;
}

export function sameReviewedWorkSubject(
  one: ReviewedWorkSubject,
  other: ReviewedWorkSubject,
): boolean {
  return (
    one.source === other.source &&
    one.identity === other.identity &&
    sessionId(one) === sessionId(other)
  );
}

export function reviewedWorkKey(subject: ReviewedWorkSubject): string {
  const story = `${subject.source}\n${subject.identity}`;
  const session = sessionId(subject);
  return session === undefined ? story : `${story}\n${session}`;
}

export function reviewedWorkQuery(subject: ReviewedWorkSubject) {
  const { source, identity } = subject;
  return {
    source,
    identity,
    ...(isReviewedPublishedSessionSubject(subject)
      ? { published: subject.published }
      : {}),
  };
}
