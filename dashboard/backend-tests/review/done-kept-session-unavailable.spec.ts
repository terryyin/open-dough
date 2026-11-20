// Done keeps its timestamp even when a Default main session has no readable run.
import { renameSync, rmSync } from "node:fs";
import path from "node:path";
import { expect, test } from "vitest";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { keptRecords } from "../../server/launchRecordStore.ts";
import {
  aCheckout,
  aDefaultLaunch,
  aKeptSession,
  keep,
  markDone,
  minutesAgo,
  noCommits,
  notCaptured,
  review,
  source,
  work,
} from "../support/doneCaptureCase.ts";

const doneAt = minutesAgo(10);

test("a blank default launch that edited files and committed nothing says it made no commits in the Default main checkout", async () => {
  const checkout = await aCheckout();
  const record = aDefaultLaunch(checkout).please();
  keep(record);
  await work(
    checkout,
    makeMe.aCheckoutWork.editing("edit", { at: minutesAgo(30) }),
  );

  await markDone(record, doneAt);

  expect(await keptRecords(source)).toMatchObject([{ doneAt }]);
  expect(await review(record)).toEqual(noCommits);
});

test("a session whose only commit stays on another branch says its changes were not captured", async () => {
  const { checkout, record } = await aKeptSession();
  await work(
    checkout,
    makeMe.aCheckoutWork.committingOnBranch("side", { at: minutesAgo(30) }),
  );

  await markDone(record, doneAt);

  expect(await keptRecords(source)).toMatchObject([{ doneAt }]);
  expect(await review(record)).toEqual(notCaptured);
});

for (const { when, earlier } of [
  { when: "on its own", earlier: makeMe.aCheckoutWork },
  {
    when: "after a retained commit",
    earlier: makeMe.aCheckoutWork.committing("earlier", { at: minutesAgo(40) }),
  },
]) {
  test(`a session commit reworded ${when} leaves changes not captured`, async () => {
    const { checkout, record } = await aKeptSession();
    await work(
      checkout,
      earlier
        .committing("notes", { at: minutesAgo(35) })
        .rewordingTip("reworded", {
          at: minutesAgo(30),
          message: "Clarify session notes",
        }),
    );

    await markDone(record, doneAt);

    expect(await keptRecords(source)).toMatchObject([{ doneAt }]);
    expect(await review(record)).toEqual(notCaptured);
  });
}

test("a session whose checkout log cannot be read at Done is done and says its changes were not captured", async () => {
  const { checkout, record } = await aKeptSession();
  await work(
    checkout,
    makeMe.aCheckoutWork.committing("typo", { at: minutesAgo(30) }),
  );
  const gitDirectory = path.join(checkout.integration, ".git");
  renameSync(gitDirectory, `${gitDirectory}-away`);

  expect((await markDone(record, doneAt))?.doneAt).toBe(doneAt);

  const [kept] = await keptRecords(source);
  expect(kept).toMatchObject({ doneAt });
  expect(kept?.sessionCommits).toBeUndefined();
  expect(await review(record)).toEqual(notCaptured);
});

test("a session whose checkout log holds no entry at Done is done and says its changes were not captured", async () => {
  const { checkout, record } = await aKeptSession();
  // Git still reads the checkout. Remove all logs so it cannot fall back to the branch log.
  rmSync(path.join(checkout.integration, ".git", "logs"), { recursive: true });

  expect((await markDone(record, doneAt))?.doneAt).toBe(doneAt);

  const [kept] = await keptRecords(source);
  expect(kept).toMatchObject({ doneAt });
  expect(kept?.sessionCommits).toBeUndefined();
  expect(await review(record)).toEqual(notCaptured);
});
