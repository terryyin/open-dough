// Fast rule owners declared before measurement: real persistence, run identity,
// capture preference/order, deletion and retention. Refresh specs own UI wiring.
import path from "node:path";
import { makeMe } from "../../../tests/support/makeMe.mjs";
import { materializeLocalCheckout } from "../../../tests/support/repository-fixture.mjs";
import {
  test,
  expect,
  storedReviewRuns,
  preferredReviewKey,
} from "../../tests/support/reviewRunStore.ts";
import { reviewLaunch } from "../../tests/support/reviewRunRecords.ts";
import {
  keepLaunchRecords,
  keptLaunchRecords,
} from "../../tests/support/launchStore.ts";
import { replaceRecords } from "../../server/launchRecordDocument.ts";
import {
  deleteRecord,
  replaceKeptSession,
} from "../../server/launchRecordStore.ts";
import { reviewRunKey } from "../../src/storyReviewLandedRun.ts";

const firstKey = "11111111-1111-4111-8111-111111111111";
const secondKey = "22222222-2222-4222-8222-222222222222";
const thirdKey = "33333333-3333-4333-8333-333333333333";
const base = "a".repeat(40);
const revision = "b".repeat(40);

test("stored captures keep their identity after a newer capture and native replacement", async ({
  recordHome,
}) => {
  const first = reviewLaunch({
    sessionId: "first",
    workspace: path.join(recordHome, "retired-first"),
    launchedAt: "2026-01-02T00:00:00.000Z",
    reference: firstKey,
  })
    .withLanding(
      makeMe.aLaunchLanding
        .forLaunch(firstKey)
        .comparing({ base, revision })
        .please(),
    )
    .please();
  const legacy = reviewLaunch({
    sessionId: "legacy",
    workspace: path.join(recordHome, "retired-legacy"),
    launchedAt: "2026-01-03T00:00:00.000Z",
  }).please();
  keepLaunchRecords(recordHome, [legacy, first]);
  expect(preferredReviewKey(await storedReviewRuns())).toBe(firstKey);
  const third = reviewLaunch({
    sessionId: "third",
    workspace: path.join(recordHome, "retired-third"),
    launchedAt: "2026-01-04T00:00:00.000Z",
    reference: thirdKey,
  })
    .withLanding(
      makeMe.aLaunchLanding
        .forLaunch(thirdKey)
        .comparing({ base, revision })
        .please(),
    )
    .please();
  await replaceRecords((kept) => ({
    ...kept,
    "open-dough": [...(kept["open-dough"] ?? []), third],
  }));
  expect(
    (await storedReviewRuns()).map(({ record }) => reviewRunKey(record)),
  ).toEqual([thirdKey, "codex:legacy", firstKey]);
  const replacement = reviewLaunch({
    sessionId: "recovered-first",
    workspace: path.join(recordHome, "retired-first"),
    launchedAt: "2026-01-02T00:00:00.000Z",
    reference: firstKey,
  }).please();
  await replaceKeptSession("open-dough", first.session, replacement);
  const runs = await storedReviewRuns();
  const keptFirst = runs.find(
    ({ record }) => reviewRunKey(record) === firstKey,
  );
  expect(keptFirst?.record.session.sessionId).toBe("recovered-first");
  expect(keptFirst?.record.landing).toEqual(first.landing);
  expect(runs.map(({ record }) => reviewRunKey(record))).toEqual([
    thirdKey,
    "codex:legacy",
    firstKey,
  ]);
  expect(preferredReviewKey(runs)).toBe(thirdKey);
  expect(keptLaunchRecords(recordHome)).toContainEqual(
    expect.objectContaining({
      session: expect.objectContaining({ sessionId: "recovered-first" }),
      landing: first.landing,
    }),
  );
});

test("deleting a replaced captured run selects the newest remaining capture", async ({
  recordHome,
}) => {
  // deleteRecord also retires captured Git pins; this private immutable pair
  // gives that real operation its repository without launching a native host.
  const repository = await materializeLocalCheckout(
    undefined,
    makeMe.aRepository.withRevision("base").withRevision("result").please(),
  );
  try {
    const comparison = {
      base: repository.revisions.base,
      revision: repository.revisions.result,
    };
    const first = reviewLaunch({
      sessionId: "first",
      workspace: path.join(recordHome, "first"),
      launchedAt: "2026-01-02T00:00:00.000Z",
      reference: firstKey,
    })
      .withLanding(
        makeMe.aLaunchLanding
          .capturedFrom({ repository: repository.integration })
          .forLaunch(firstKey)
          .comparing(comparison)
          .please(),
      )
      .please();
    const second = reviewLaunch({
      sessionId: "second",
      workspace: path.join(recordHome, "second"),
      launchedAt: "2026-01-03T00:00:00.000Z",
      reference: secondKey,
    })
      .withLanding(
        makeMe.aLaunchLanding
          .capturedFrom({ repository: repository.integration })
          .forLaunch(secondKey)
          .comparing(comparison)
          .please(),
      )
      .please();
    const third = reviewLaunch({
      sessionId: "third",
      workspace: path.join(recordHome, "third"),
      launchedAt: "2026-01-04T00:00:00.000Z",
      reference: thirdKey,
    })
      .withLanding(
        makeMe.aLaunchLanding
          .capturedFrom({ repository: repository.integration })
          .forLaunch(thirdKey)
          .comparing(comparison)
          .please(),
      )
      .please();
    keepLaunchRecords(recordHome, [second, first, third]);
    const replacement = reviewLaunch({
      sessionId: "recovered-first",
      workspace: path.join(recordHome, "first"),
      launchedAt: "2026-01-02T00:00:00.000Z",
      reference: firstKey,
    }).please();
    await replaceKeptSession("open-dough", first.session, replacement);
    expect(await deleteRecord("open-dough", first.session)).toBe(false);
    expect(await deleteRecord("open-dough", replacement.session)).toBe(true);
    const runs = await storedReviewRuns();
    expect(runs.map(({ record }) => reviewRunKey(record))).toEqual([
      thirdKey,
      secondKey,
    ]);
    expect(preferredReviewKey(runs)).toBe(thirdKey);
    expect(keptLaunchRecords(recordHome)).toHaveLength(2);
  } finally {
    await repository.cleanup();
  }
});
