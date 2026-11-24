// A standalone session's published close record admits its review on a
// machine with no launch history: the typed review and file handlers take the
// published subject and its configured project source, and the recorded pair
// is read from that project's Git at a later published revision. Records of
// several ranges are reviewed in ./published-session-ranges.spec.ts.
import { randomUUID } from "node:crypto";
import { expect, test } from "vitest";
import { RefusedRequest } from "../../server/localOrigin.ts";
import { storyReviewSchema } from "../../src/storyReviewContract.ts";
import {
  aPublishedSession,
  read,
  readFile,
} from "../support/publishedSessionCase.ts";

test("Given a published session record and a later trunk revision, when its UUID is reviewed, then the recorded pair's file diff is shown", async () => {
  const published = await aPublishedSession();

  const review = await read(published);

  expect(review).toMatchObject({
    kind: "published-session",
    session: { closedAt: expect.any(String) as unknown },
    baseline: published.base,
    tree: published.candidate,
    files: [expect.objectContaining({ path: "notes.md" })],
  });
  expect(review).not.toHaveProperty("commitRuns");
});

test("Given a project that published no such session, when that UUID is reviewed, then it is refused as unknown", async () => {
  const published = await aPublishedSession();

  const refused = read(published, { session: randomUUID() });

  await expect(refused).rejects.toBeInstanceOf(RefusedRequest);
  await expect(refused).rejects.toMatchObject({ status: 404 });
});

test("Given a session named by no UUID, when it is reviewed, then it is refused as malformed", async () => {
  const published = await aPublishedSession();

  await expect(
    read(published, { session: "../PRODUCT-BACKLOG" }),
  ).rejects.toMatchObject({
    status: 400,
  });
});

test("Given a record whose commits the Review repository lacks, when it is reviewed, then the review explains they are unavailable", async () => {
  const absent = "0123456789abcdef0123456789abcdef01234567";
  const published = await aPublishedSession({
    base: absent,
    candidate: absent,
  });

  const review = await read(published);

  expect(storyReviewSchema.parse(review)).toMatchObject({
    kind: "landing-unavailable",
    comparison: "published-session",
    explanation: expect.stringContaining(
      "This session's published commits are not in this project's Review repository.",
    ) as unknown,
  });
});

test("Given a published session, when a file of its recorded pair is read, then its diff is shown", async () => {
  const published = await aPublishedSession();

  const diff = readFile(published, { path: "notes.md" });

  await expect(diff).resolves.toMatchObject({
    kind: "diff",
    printed: expect.stringContaining("+edited") as unknown,
  });
});

test("Given a published session, when a file off its recorded pair is read, then it is refused", async () => {
  const published = await aPublishedSession();

  await expect(readFile(published, { path: "later.md" })).rejects.toMatchObject(
    { status: 409 },
  );
  await expect(
    readFile(published, {
      baseline: published.candidate,
      tree: published.source.revision,
      path: "later.md",
    }),
  ).rejects.toMatchObject({ status: 409 });
});
