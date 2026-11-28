import { renameSync } from "node:fs";
import path from "node:path";
import { expect, test } from "vitest";
import { stubRemoteRequestRecording } from "../support/fixtureHome.ts";
import { configuredFixtureProject } from "../support/fixtureProject.ts";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import {
  reviewedFileDiff,
  reviewedFileText,
} from "../../server/storyReviewFileResponse.ts";
import { readStoryReviewResult } from "../../server/storyReviewResultRead.ts";
import { reviewRepositoryPath } from "../../server/reviewRepository.ts";
import { knownSource } from "../../server/sessionAdmission.ts";
import { storyReview } from "../../server/storyReview.ts";
import {
  reviewOriginHangs,
  shortSyncDeadline,
  timedOutSync,
} from "../support/hangingOrigin.ts";
import { keepLaunchRecords } from "../../test-support/support/launchStore.ts";
import { reviewLaunch } from "../../test-support/support/reviewRunRecords.ts";
import { queuedIdentity } from "../../test-support/support/startOrigin.ts";
import { git } from "../../test-support/support/storyReviewWorktree.ts";

const reference = "11111111-1111-4111-8111-111111111111";
const literal = "[literal]*.txt";

// A legacy receipt for an accepted landing whose execution checkout is retired.
async function retiredLandedRun() {
  const { repository, home } = await configuredFixtureProject(
    makeMe.aRepository
      .withRevision("base")
      .withRevision("accepted", { files: { [literal]: "accepted file\n" } })
      .withRevision("later", { files: { [literal]: "later change\n" } })
      .please(),
  );
  const { base, accepted } = repository.revisions;
  keepLaunchRecords(home, [
    reviewLaunch({
      sessionId: "retired",
      workspace: path.join(repository.fixture, "retired"),
      launchedAt: "2026-01-02T00:00:00.000Z",
      reference,
    })
      .withLanding(
        makeMe.aLaunchLanding
          .capturedFrom({ repository: path.join(repository.fixture, "gone") })
          .forLaunch(reference)
          .comparing({ base, revision: accepted })
          .please(),
      )
      .please(),
  ]);

  renameSync(repository.integration, `${repository.integration}-retired`);
  const subject = { source: "open-dough", identity: queuedIdentity };
  const review = { read: { subject, run: reference } };
  const moveOrigin = () => {
    renameSync(repository.origin, `${repository.origin}-away`);
  };
  return { repository, base, accepted, subject, review, moveOrigin };
}

test("a legacy receipt reads the exact accepted origin pair with the execution checkout retired, and loses authority when origin omits it", async () => {
  const { repository, base, accepted, subject, review } =
    await retiredLandedRun();
  const signal = new AbortController().signal;
  const file = {
    subject,
    reference,
    baseline: base,
    tree: accepted,
    path: literal,
  };
  await expect(storyReview(review, signal)).resolves.toMatchObject({
    kind: "landed",
    baseline: base,
    tree: accepted,
  });
  const diff = await reviewedFileDiff({ read: file }, signal);
  if (diff.kind !== "diff")
    throw new Error("The accepted file is not readable.");
  expect(diff.printed).toContain("+accepted file");
  expect(diff.printed).not.toContain("later change");
  await expect(
    reviewedFileDiff({ read: { ...file, path: "*.txt" } }, signal),
  ).rejects.toMatchObject({ status: 409 });

  git(repository.origin, "update-ref", "refs/heads/main", base);
  await expect(storyReview(review, signal)).resolves.toMatchObject({
    kind: "landing-unavailable",
  });
  await expect(reviewedFileDiff({ read: file }, signal)).rejects.toMatchObject({
    status: 409,
  });
});

test("an opened landed run reads its files without a remote request after origin moves away", async () => {
  const { repository, base, accepted, subject, review, moveOrigin } =
    await retiredLandedRun();
  const signal = new AbortController().signal;
  await expect(storyReview(review, signal)).resolves.toMatchObject({
    kind: "landed",
  });
  const recording = stubRemoteRequestRecording(repository.fixture);
  moveOrigin();
  const file = { subject, reference, baseline: base, tree: accepted };

  const diff = await reviewedFileDiff(
    { read: { ...file, path: literal } },
    signal,
  );
  if (diff.kind !== "diff") throw new Error("The accepted file is unreadable.");
  expect(diff.printed).toContain("+accepted file");
  await expect(
    reviewedFileDiff({ read: { ...file, path: "*.txt" } }, signal),
  ).rejects.toMatchObject({ status: 409 });
  expect(recording.requests()).toEqual([]);
});

test("a synced landed run reopens offline with the same pair and files and the sync notice", async () => {
  const { base, accepted, review, moveOrigin } = await retiredLandedRun();
  const signal = new AbortController().signal;
  const synced = await storyReview(review, signal);
  if (synced.kind !== "landed") throw new Error("No landed review");
  moveOrigin();

  const reopened = await storyReview(review, signal);
  expect(reopened).toMatchObject({
    kind: "landed",
    baseline: base,
    tree: accepted,
    files: synced.files,
  });
  if (reopened.kind !== "landed") throw new Error("No landed review");
  expect(typeof reopened.syncFailure?.lastSyncedAt).toBe("string");
});

test("a landed run never synced and opened offline is unavailable and names the failed sync", async () => {
  const { review, moveOrigin } = await retiredLandedRun();
  moveOrigin();

  const answer = await storyReview(review, new AbortController().signal);

  expect(answer.kind).toMatch(/unavailable/);
  expect("explanation" in answer && answer.explanation).toMatch(
    /^The review could not sync from origin/,
  );
});

const deadlineMs = 500;
const originHangs = () =>
  reviewOriginHangs(reviewRepositoryPath(knownSource("open-dough")));

test("a synced landed run reopened while origin hangs shows its last synced pair, naming the timeout", async () => {
  const { base, accepted, review } = await retiredLandedRun();
  const signal = new AbortController().signal;
  const synced = await storyReview(review, signal);
  if (synced.kind !== "landed") throw new Error("No landed review");
  await originHangs();

  const reopened = await storyReview(
    review,
    signal,
    shortSyncDeadline(deadlineMs),
  );

  // The timeout names the deadline that cut the hang, well before it ends.
  expect(reopened).toMatchObject({
    kind: "landed",
    baseline: base,
    tree: accepted,
    files: synced.files,
    syncFailure: { problem: timedOutSync(deadlineMs) },
  });
});

test("a landed run never synced and opened while origin hangs is unavailable and names the timed-out sync", async () => {
  const { review } = await retiredLandedRun();
  await originHangs();

  const answer = await storyReview(
    review,
    new AbortController().signal,
    shortSyncDeadline(deadlineMs),
  );

  expect(answer).toMatchObject({
    kind: "landing-unavailable",
    explanation: expect.stringMatching(
      /^The review could not sync from origin/,
    ) as unknown,
  });
  expect("explanation" in answer && answer.explanation).toContain(
    timedOutSync(deadlineMs),
  );
});

test("a retired landing's admitted pair reads its text and result only for its own story", async () => {
  const { base, accepted, subject, review } = await retiredLandedRun();
  const signal = new AbortController().signal;
  await expect(storyReview(review, signal)).resolves.toMatchObject({
    kind: "landed",
  });
  const read = { subject, reference, baseline: base, tree: accepted };
  await expect(
    reviewedFileText({ read: { ...read, path: literal } }, signal),
  ).resolves.toEqual({ kind: "text", baseline: null, tree: "accepted file\n" });
  await expect(
    reviewedFileText({ read: { ...read, path: "later.txt" } }, signal),
  ).rejects.toMatchObject({ status: 409 });
  const result = { subject, reference, tree: accepted };
  await expect(
    readStoryReviewResult({ ...result, path: literal }, signal),
  ).resolves.toEqual({
    kind: "text",
    revision: accepted,
    path: literal,
    text: "accepted file\n",
  });
  await expect(
    readStoryReviewResult(
      { ...result, subject: { ...subject, identity: "SEED-B#b" } },
      signal,
    ),
  ).rejects.toMatchObject({
    status: 404,
    message: expect.stringContaining("This story has no landed run") as unknown,
  });
});
