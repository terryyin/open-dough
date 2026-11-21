// A session named by its published close record's UUID is reviewed as a
// session, never a story, and the page lists published sessions at its
// revision or says why it cannot.
import { act, createElement } from "react";
import { createRoot } from "react-dom/client";
import { expect, onTestFinished, test, vi } from "vitest";
import { makeMe } from "../../../Distribution/tests/support/pageMakeMe.mjs";
import { withCarriedFacts } from "../../src/carriedFacts.ts";
import { publishedSessionRecordSchema } from "../../src/publishedSessionRecord.ts";
import {
  readPublishedSessions,
  type PublishedSessionsListing,
} from "../../src/publishedSessions.ts";
import { ReadProblem } from "../../src/readProblem.ts";
import { StoryReviewHeading } from "../../src/StoryReviewHeading.tsx";
import {
  reviewedStoryIdentity,
  reviewedWorkKey,
  reviewedWorkQuery,
  sameReviewedWorkSubject,
} from "../../src/reviewedWorkSubject.ts";

const source = "review-project";
const uuid = "6b1f0c2e-8d4a-4c1e-9f3b-2a7d5e0c9b11";
const published = { source, published: uuid };
const story = { source, identity: "SEED-001#review" };
const session = { source, host: "codex", session: uuid } as const;
const revision = "c".repeat(40);

vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);

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

test("a published session's review heading names its UUID", () => {
  const host = document.body.appendChild(document.createElement("div"));
  const root = createRoot(host);
  onTestFinished(() => {
    act(() => {
      root.unmount();
    });
    host.remove();
  });
  act(() => {
    root.render(
      createElement(StoryReviewHeading, {
        subject: published,
        title: "Ad hoc development",
        headingId: "published-heading",
      }),
    );
  });
  expect(host.textContent).toContain(`Session review ${uuid}`);
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
