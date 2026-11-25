// How long one open's syncs may wait for origin, read from the deadline the
// open builds for its project: a story open gets 30 seconds once the project
// has synced and 50 before its first sync; a session open keeps 30 either way.
import { expect, test } from "vitest";
import { knownSource } from "../../server/sessionAdmission.ts";
import { openSyncDeadline } from "../../server/storyReviewInput.ts";
import { queuedIdentity } from "../../test-support/support/startOrigin.ts";
import {
  aNeverSyncedPublishedSessionOffline,
  aSyncedPublishedSession,
  publishedIdentity,
} from "../support/publishedSessionCase.ts";

const storyOpen = {
  subject: { source: "open-dough", identity: queuedIdentity },
};
const sessionOpen = {
  subject: {
    source: "open-dough",
    identity: publishedIdentity,
    published: crypto.randomUUID(),
  },
};

const deadlineSeconds = async (read: typeof storyOpen | typeof sessionOpen) =>
  (await openSyncDeadline(read).of(knownSource("open-dough"))).seconds;

test("a story open of a project with a last successful sync has a 30-second sync deadline", async () => {
  await aSyncedPublishedSession();

  expect(await deadlineSeconds(storyOpen)).toBe(30);
});

test("a story open of a project never synced has a 50-second sync deadline", async () => {
  await aNeverSyncedPublishedSessionOffline();

  expect(await deadlineSeconds(storyOpen)).toBe(50);
});

test("a session open of a project never synced keeps the 30-second session deadline", async () => {
  await aNeverSyncedPublishedSessionOffline();

  expect(await deadlineSeconds(sessionOpen)).toBe(30);
});

test("a session open of a project with a last successful sync keeps the 30-second session deadline", async () => {
  await aSyncedPublishedSession();

  expect(await deadlineSeconds(sessionOpen)).toBe(30);
});
