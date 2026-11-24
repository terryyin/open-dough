// A session named by its published close record's UUID is reviewed as a
// session, never a story, and the page lists published sessions at its
// revision or says why it cannot. Its review names published changes and
// the session's close time, never kept-session launch wording.
import { createElement } from "react";
import { expect, test } from "vitest";
import { page } from "vitest/browser";
import { makeMe } from "../../../Distribution/tests/support/pageMakeMe.mjs";
import { withCarriedFacts } from "../../src/carriedFacts.ts";
import { publishedSessionRecordSchema } from "../../src/publishedSessionRecord.ts";
import {
  readPublishedSessions,
  type PublishedSessionsListing,
} from "../../src/publishedSessions.ts";
import { ReadProblem } from "../../src/readProblem.ts";
import {
  ReviewContext,
  reviewDescription,
} from "../../src/StoryReviewContext.tsx";
import { ReviewFeedback } from "../../src/StoryReviewFeedback.tsx";
import { StoryReviewHeading } from "../../src/StoryReviewHeading.tsx";
import type { StoryReview } from "../../src/storyReviewContract.ts";
import {
  reviewedStoryIdentity,
  reviewedWorkKey,
  reviewedWorkQuery,
  sameReviewedWorkSubject,
} from "../../src/reviewedWorkSubject.ts";
import { mountComponent } from "../../test-support/component-mount/mountComponent.ts";
import {
  mountReviewChanges,
  reviewSourceAnswering,
} from "./story-review-panel-page.ts";

const source = "review-project";
const uuid = "6b1f0c2e-8d4a-4c1e-9f3b-2a7d5e0c9b11";
const published = { source, published: uuid };
const story = { source, identity: "SEED-001#review" };
const session = { source, host: "codex", session: uuid } as const;
const revision = "c".repeat(40);

test("a published session is its own review subject, never a story", () => {
  expect(reviewedStoryIdentity(published)).toBeUndefined();
  expect(reviewedWorkQuery(published)).toEqual({ source, published: uuid });
  expect(sameReviewedWorkSubject(published, { ...published })).toBe(true);
  expect(sameReviewedWorkSubject(published, session)).toBe(false);
  expect(sameReviewedWorkSubject(story, published)).toBe(false);
  expect(new Set([published, session, story].map(reviewedWorkKey)).size).toBe(
    3,
  );
});

test("a published session's review heading names its UUID", async () => {
  await mountComponent(
    createElement(StoryReviewHeading, {
      subject: published,
      title: "Ad hoc development",
      headingId: "published-heading",
    }),
  );
  await expect.element(page.getByText(`Session review ${uuid}`)).toBeVisible();
});

const closedAt = "2026-11-20T10:00:00.000Z";
const publishedSessionReview = (): StoryReview => ({
  kind: "published-session",
  session: { closedAt },
  baseline: "a".repeat(40),
  tree: "b".repeat(40),
  files: [
    { kind: "modified", path: "notes.md", lines: { added: 1, removed: 0 } },
  ],
});

test("a published-session review names published changes and the close time", async () => {
  const review = publishedSessionReview();
  await mountComponent(createElement(ReviewContext, { review }));
  const closed = page
    .getByRole("paragraph")
    .filter({ hasText: "Published changes of this session, closed" });
  await expect
    .element(closed.getByRole("time"))
    .toHaveTextContent(new Date(closedAt).toLocaleString());
  expect(document.body.textContent).not.toMatch(
    /launched|done|Execution checkout/i,
  );
  expect(reviewDescription(review)).toMatch(/published changes/i);
  expect(reviewDescription(review)).not.toMatch(
    /launched|kept|Execution checkout/i,
  );
});

test("a published-session refresh names published changes", async () => {
  await mountComponent(
    createElement(ReviewFeedback, {
      review: publishedSessionReview(),
      reading: false,
      problem: undefined,
      round: 1,
    }),
  );
  const feedback = page.getByRole("status");
  await expect
    .element(feedback)
    .toHaveTextContent(
      "Review refreshed: 1 changed file in the published changes.",
    );
  expect(feedback.element().textContent).not.toMatch(/kept session commits/i);
});

test("an unavailable published-session review names published changes", async () => {
  const explanation =
    "This session's published commits are not in this machine's Git.";
  const gap = makeMe.aStoryReview.publishedSessionGap(explanation).please();
  const review = await mountReviewChanges(
    reviewSourceAnswering({ review: () => Promise.resolve(gap) }),
    published,
  );

  await review.expectFeedback(explanation);
  await review.expectComparisonNamed("Published changes");
  await expect
    .element(page.getByRole("region", { name: "Session review" }))
    .toHaveAccessibleDescription(
      /^Read-only: this session's published changes/,
    );
});

// The record as the page receives it: parsed at the read boundary.
const aRecord = publishedSessionRecordSchema.parse(
  makeMe.aSessionRecord.please(),
);

test("the page lists published sessions at its revision", async () => {
  const asked: string[] = [];
  const listing: PublishedSessionsListing = (at) => {
    asked.push(at);
    return Promise.resolve([aRecord]);
  };
  const never = new AbortController().signal;
  expect(await readPublishedSessions(listing, revision, never, never)).toEqual({
    status: "listed",
    revision,
    sessions: [aRecord],
  });
  expect(asked).toEqual([revision]);
});

test("an unreadable listing is a gap, never an empty set", async () => {
  const listing: PublishedSessionsListing = () =>
    Promise.reject(new ReadProblem("The boundary refused."));
  const never = new AbortController().signal;
  const read = await readPublishedSessions(listing, revision, never, never);
  expect(read.status).toBe("unavailable");
  expect("problem" in read && read.problem).toContain(
    "Published sessions could not be read.",
  );
});

const snapshotAt = (at: string) =>
  makeMe.aPublishedWork.ofPygardon.at(at).please();

test("a refresh keeps the shown published sessions until the new revision lists them", () => {
  const listed = {
    status: "listed" as const,
    revision,
    sessions: [aRecord],
  };
  const shown = { ...snapshotAt(revision), publishedSessions: listed };
  const newer = snapshotAt("d".repeat(40));
  expect(
    withCarriedFacts(
      { ...newer, publishedSessions: { status: "loading" } },
      shown,
    ).publishedSessions,
  ).toEqual(listed);
  const answered = {
    status: "listed" as const,
    revision: newer.revision,
    sessions: [],
  };
  expect(
    withCarriedFacts({ ...newer, publishedSessions: answered }, shown)
      .publishedSessions,
  ).toEqual(answered);
});
