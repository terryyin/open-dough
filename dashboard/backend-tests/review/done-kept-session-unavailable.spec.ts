// Why a Default main session's capture finds no readable run, how its review
// says so, and that Done keeps its timestamp when the capture fails.
import { storyReview } from "../../server/storyReviewSnapshot.ts";
import { renameSync, rmSync } from "node:fs";
import path from "node:path";
import { expect, test } from "vitest";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { keptSession } from "../../server/launchRecordStore.ts";
import { readSessionCommits } from "../../server/sessionCommitsCapture.ts";
import type { LaunchRecord } from "../../src/launchRecord.ts";
import {
  aCheckout,
  type Checkout,
  keep,
  markDone,
  minutesAgo,
  source,
  work,
} from "../support/doneCaptureCase.ts";
import { aDoneCaptureCase } from "../support/doneCaptureCaseBuilder.ts";
import { noCommits, notCaptured } from "../support/doneCaptureReview.ts";

const doneAt = minutesAgo(10);

// What production's Git-only capture reads for the session in the checkout
// at Done.
const captured = (checkout: Checkout, record: LaunchRecord) =>
  readSessionCommits(record, { workspace: checkout.integration });

// A session established in Default main an hour before the case.
const anEstablishedCase = () =>
  aDoneCaptureCase()
    .withEstablishedSession("session", { launched: 60 })
    .please();

test("a blank default launch that edited files and committed nothing says it made no commits in the Default main checkout", async () => {
  const checkout = await aCheckout();
  const launch = makeMe.aLaunchRecord
    .ofDefaultMainLaunch("default-launch", checkout)
    .launchedAt(minutesAgo(60));
  await work(
    checkout,
    makeMe.aCheckoutWork.editing("edit", { at: minutesAgo(30) }),
  );

  const { repository, runs } = await captured(checkout, launch.please());
  const record = launch
    .keptSessionCommits({ repository, runs })
    .markedDoneAt(doneAt)
    .please();

  expect(
    await storyReview({ record, read: {} }, new AbortController().signal),
  ).toEqual(noCommits);
});

test("a session whose only commit stays on another branch fails its capture", async () => {
  const {
    checkout,
    records: { session },
  } = await anEstablishedCase();
  await work(
    checkout,
    makeMe.aCheckoutWork.committingOnBranch("side", { at: minutesAgo(30) }),
  );

  await expect(captured(checkout, session)).rejects.toThrow(
    "None of the session's commits is in the checkout's HEAD.",
  );
});

for (const { when, earlier } of [
  { when: "on its own", earlier: makeMe.aCheckoutWork },
  {
    when: "after a retained commit",
    earlier: makeMe.aCheckoutWork.committing("earlier", { at: minutesAgo(40) }),
  },
]) {
  test(`a session commit reworded ${when} fails its capture`, async () => {
    const {
      checkout,
      records: { session },
    } = await anEstablishedCase();
    await work(
      checkout,
      earlier
        .committing("notes", { at: minutesAgo(35) })
        .rewordingTip("reworded", {
          at: minutesAgo(30),
          message: "Clarify session notes",
        }),
    );

    await expect(captured(checkout, session)).rejects.toThrow(
      "The checkout's log has a commit that cannot be placed.",
    );
  });
}

// The adapter keeps the Done when its capture fails.
test("a session whose checkout log cannot be read at Done is done and says its changes were not captured", async () => {
  const {
    checkout,
    records: { session: record },
  } = await anEstablishedCase();
  keep(record);
  await work(
    checkout,
    makeMe.aCheckoutWork.committing("typo", { at: minutesAgo(30) }),
  );
  const gitDirectory = path.join(checkout.integration, ".git");
  renameSync(gitDirectory, `${gitDirectory}-away`);

  expect((await markDone(record, doneAt))?.doneAt).toBe(doneAt);

  const saved = await keptSession(source, record.session);
  if (saved === undefined) throw new Error("Missing the kept launch.");
  expect(saved).toMatchObject({ doneAt });
  expect(saved.sessionCommits).toBeUndefined();
  expect(
    await storyReview(
      { record: saved, read: {} },
      new AbortController().signal,
    ),
  ).toEqual(notCaptured);
});

test("a session whose checkout log holds no entry at Done fails its capture", async () => {
  const {
    checkout,
    records: { session },
  } = await anEstablishedCase();
  // Git still reads the checkout. Remove all logs so it cannot fall back to the branch log.
  rmSync(path.join(checkout.integration, ".git", "logs"), { recursive: true });

  await expect(captured(checkout, session)).rejects.toThrow(
    "The checkout's log has no entries.",
  );
});
