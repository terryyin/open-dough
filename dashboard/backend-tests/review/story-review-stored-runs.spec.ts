// Stored review runs over the real launch record store: run identity through
// replacement, capture preference and order, deletion and retention. The
// one-shot choice refresh journey owns UI wiring.
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { expect, onTestFinished, test, vi } from "vitest";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { materializeLocalCheckout } from "../../../Distribution/tests/support/repository-fixture.mjs";
import { reviewLaunch } from "../../test-support/support/reviewRunRecords.ts";
import {
  keepLaunchRecords,
  keptLaunchRecords,
} from "../../test-support/support/launchStore.ts";
import { replaceRecords } from "../../server/launchRecordDocument.ts";
import { withinRetention } from "../../server/launchRecordRetention.ts";
import {
  deleteRecord,
  keptRecords,
  replaceKeptSession,
  setRecordDoneAt,
} from "../../server/launchRecordStore.ts";
import {
  preferredReviewRun,
  reviewLandedRunsOf,
  reviewRunKey,
} from "../../src/storyReviewLandedRun.ts";

// The case's own machine HOME, where the real launch record store lives.
function aRecordHome() {
  const home = mkdtempSync(path.join(tmpdir(), "dough-review-records-"));
  vi.stubEnv("HOME", home);
  onTestFinished(() => {
    vi.unstubAllEnvs();
    rmSync(home, { recursive: true, force: true });
  });
  return home;
}

const storedReviewRuns = async () =>
  reviewLandedRunsOf(
    await keptRecords("open-dough"),
    "open-dough",
    "SEED-A#a",
    () => true,
  );

const storedRunKeys = (runs: Awaited<ReturnType<typeof storedReviewRuns>>) =>
  runs.map(({ record }) => reviewRunKey(record));

function preferredReviewKey(
  runs: Awaited<ReturnType<typeof storedReviewRuns>>,
) {
  const chosen = preferredReviewRun(runs, ({ record }) => record.landing);
  return chosen === undefined ? undefined : reviewRunKey(chosen.record);
}

const firstKey = "11111111-1111-4111-8111-111111111111";
const secondKey = "22222222-2222-4222-8222-222222222222";
const thirdKey = "33333333-3333-4333-8333-333333333333";
const base = "a".repeat(40);
const revision = "b".repeat(40);

// A one-shot launch whose landing is captured for its own reporting reference.
function capturedReviewLaunch(
  launch: Parameters<typeof reviewLaunch>[0] & { readonly reference: string },
  landing = makeMe.aLaunchLanding.comparing({ base, revision }),
) {
  return reviewLaunch(launch)
    .withLanding(landing.forLaunch(launch.reference).please())
    .please();
}

test("stored captures keep their identity after a newer capture and native replacement", async () => {
  const recordHome = aRecordHome();
  const first = capturedReviewLaunch({
    sessionId: "first",
    workspace: path.join(recordHome, "retired-first"),
    launchedAt: "2026-01-02T00:00:00.000Z",
    reference: firstKey,
  });
  const legacy = reviewLaunch({
    sessionId: "legacy",
    workspace: path.join(recordHome, "retired-legacy"),
    launchedAt: "2026-01-03T00:00:00.000Z",
  }).please();
  keepLaunchRecords(recordHome, [legacy, first]);
  expect(preferredReviewKey(await storedReviewRuns())).toBe(firstKey);
  const third = capturedReviewLaunch({
    sessionId: "third",
    workspace: path.join(recordHome, "retired-third"),
    launchedAt: "2026-01-04T00:00:00.000Z",
    reference: thirdKey,
  });
  await replaceRecords((kept) => ({
    ...kept,
    "open-dough": [...(kept["open-dough"] ?? []), third],
  }));
  expect(storedRunKeys(await storedReviewRuns())).toEqual([
    thirdKey,
    "codex:legacy",
    firstKey,
  ]);
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
  expect(storedRunKeys(runs)).toEqual([thirdKey, "codex:legacy", firstKey]);
  expect(preferredReviewKey(runs)).toBe(thirdKey);
  expect(keptLaunchRecords(recordHome)).toContainEqual(
    expect.objectContaining({
      session: expect.objectContaining({
        sessionId: "recovered-first",
      }) as unknown,
      landing: first.landing,
    }),
  );
});

test("deleting a replaced captured run selects the newest remaining capture", async () => {
  const recordHome = aRecordHome();
  // deleteRecord also retires captured Git pins; this private immutable pair
  // gives that real operation its repository without launching a native host.
  const repository = await materializeLocalCheckout(
    undefined,
    makeMe.aRepository.withRevision("base").withRevision("result").please(),
  );
  try {
    const capturedHere = () =>
      makeMe.aLaunchLanding
        .capturedFrom({ repository: repository.integration })
        .comparing({
          base: repository.revisions.base,
          revision: repository.revisions.result,
        });
    const first = capturedReviewLaunch(
      {
        sessionId: "first",
        workspace: path.join(recordHome, "first"),
        launchedAt: "2026-01-02T00:00:00.000Z",
        reference: firstKey,
      },
      capturedHere(),
    );
    const second = capturedReviewLaunch(
      {
        sessionId: "second",
        workspace: path.join(recordHome, "second"),
        launchedAt: "2026-01-03T00:00:00.000Z",
        reference: secondKey,
      },
      capturedHere(),
    );
    const third = capturedReviewLaunch(
      {
        sessionId: "third",
        workspace: path.join(recordHome, "third"),
        launchedAt: "2026-01-04T00:00:00.000Z",
        reference: thirdKey,
      },
      capturedHere(),
    );
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
    expect(storedRunKeys(runs)).toEqual([thirdKey, secondKey]);
    expect(preferredReviewKey(runs)).toBe(thirdKey);
    expect(keptLaunchRecords(recordHome)).toHaveLength(2);
  } finally {
    await repository.cleanup();
  }
});

test("retention selects the next capture then the legacy evidence gap", async () => {
  const recordHome = aRecordHome();
  const second = capturedReviewLaunch({
    sessionId: "second",
    workspace: path.join(recordHome, "second"),
    launchedAt: "2026-01-03T00:00:00.000Z",
    reference: secondKey,
  });
  const third = capturedReviewLaunch({
    sessionId: "third",
    workspace: path.join(recordHome, "third"),
    launchedAt: "2026-01-04T00:00:00.000Z",
    reference: thirdKey,
  });
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
  expect(storedRunKeys(await storedReviewRuns())).toEqual([
    secondKey,
    "codex:legacy",
  ]);
  expect(preferredReviewKey(await storedReviewRuns())).toBe(secondKey);
  await setRecordDoneAt(
    "open-dough",
    second.session,
    "2000-01-01T00:00:00.000Z",
  );
  const runs = await storedReviewRuns();
  expect(storedRunKeys(runs)).toEqual(["codex:legacy"]);
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
