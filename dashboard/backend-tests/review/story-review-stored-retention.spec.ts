// Fast retention rule: actual store reads/writes and the production selection rule.
import path from "node:path";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
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
import { withinRetention } from "../../server/launchRecordDocument.ts";
import { setRecordDoneAt } from "../../server/launchRecordStore.ts";
import { reviewRunKey } from "../../src/storyReviewLandedRun.ts";

const secondKey = "22222222-2222-4222-8222-222222222222";
const thirdKey = "33333333-3333-4333-8333-333333333333";
const base = "a".repeat(40);
const revision = "b".repeat(40);

test("retention selects the next capture then the legacy evidence gap", async ({
  recordHome,
}) => {
  const second = reviewLaunch({
    sessionId: "second",
    workspace: path.join(recordHome, "second"),
    launchedAt: "2026-01-03T00:00:00.000Z",
    reference: secondKey,
  })
    .withLanding(
      makeMe.aLaunchLanding
        .forLaunch(secondKey)
        .comparing({ base, revision })
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
        .forLaunch(thirdKey)
        .comparing({ base, revision })
        .please(),
    )
    .please();
  const legacy = reviewLaunch({
    sessionId: "legacy",
    workspace: path.join(recordHome, "legacy"),
    launchedAt: "2026-01-01T00:00:00.000Z",
  }).please();
  keepLaunchRecords(recordHome, [legacy, third, second]);
  expect(preferredReviewKey(await storedReviewRuns())).toBe(thirdKey);
  await setRecordDoneAt(
    "open-dough",
    third.session,
    "2000-01-01T00:00:00.000Z",
  );
  expect(
    (await storedReviewRuns()).map(({ record }) => reviewRunKey(record)),
  ).toEqual([secondKey, "codex:legacy"]);
  expect(preferredReviewKey(await storedReviewRuns())).toBe(secondKey);
  await setRecordDoneAt(
    "open-dough",
    second.session,
    "2000-01-01T00:00:00.000Z",
  );
  const runs = await storedReviewRuns();
  expect(runs.map(({ record }) => reviewRunKey(record))).toEqual([
    "codex:legacy",
  ]);
  expect(preferredReviewKey(runs)).toBe("codex:legacy");
  expect(runs[0]?.record.landing).toBeUndefined();
  expect(keptLaunchRecords(recordHome)).toHaveLength(2);
  const boundary = reviewLaunch({
    sessionId: "boundary",
    workspace: path.join(recordHome, "boundary"),
    launchedAt: "2026-01-01T00:00:00.000Z",
  })
    .markedDoneAt("2026-01-01T00:00:00.000Z")
    .please();
  expect(
    withinRetention([boundary], Date.parse("2026-01-31T00:00:00.000Z")),
  ).toHaveLength(1);
  expect(
    withinRetention([boundary], Date.parse("2026-01-31T00:00:00.001Z")),
  ).toEqual([]);
});
