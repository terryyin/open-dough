// A kept record owns its Git pins until deletion or retention expiry.
import { randomUUID } from "node:crypto";
import { rmSync } from "node:fs";
import path from "node:path";
import { expect, test } from "vitest";
import { git } from "../../../Distribution/src/skills/dough-execute-plan/scripts/publication-git.mjs";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import {
  readStoredRecords,
  replaceRecords,
} from "../../server/launchRecordDocument.ts";
import { retireExpiredRecords } from "../../server/launchRecordRemoval.ts";
import { deleteRecord } from "../../server/launchRecordStore.ts";
import {
  launchRetentionDays,
  type LaunchRecord,
} from "../../src/launchRecord.ts";
import { keep, minutesAgo, source } from "../support/doneCaptureCase.ts";
import {
  aDoneCaptureCase,
  type Refinement,
} from "../support/doneCaptureCaseBuilder.ts";

const days = (count: number) => count * 24 * 60;
// Launched and worked in before the retention window, so expiry can apply.
const launched = days(launchRetentionDays + 3);
const workedAt = minutesAgo(days(launchRetentionDays + 2));

const removals = {
  deletion: {
    done: 10,
    remove: async (record: LaunchRecord) => {
      expect(await deleteRecord(source, record.session)).toBe(true);
    },
  },
  expiry: {
    done: days(launchRetentionDays + 1),
    remove: async () => {
      await replaceRecords((kept) => kept, retireExpiredRecords);
    },
  },
};

// The record kept the comparison of the case's `commit` at Done and, when
// `landed`, the landing captured from it.
const keepingRun =
  <Work extends string>(
    commit: Work,
    { landed = false } = {},
  ): Refinement<Work> =>
  (launch, { checkout, work }) => {
    const repository = path.join(checkout.integration, ".git");
    const revision = work[commit];
    const kept = launch.keptSessionCommits({
      repository,
      runs: [{ base: checkout.base, revision }],
    });
    return landed
      ? kept.withCapturedLanding(
          makeMe.aLaunchLanding
            .capturedFrom({ repository })
            .forLaunch(randomUUID())
            .comparing({ base: checkout.base, revision })
            .please(),
        )
      : kept;
  };

// Pins the record's session and landing pairs the way its Done left them.
async function pinsOf(record: LaunchRecord, base: string, revision: string) {
  const { session, sessionCommits, landing } = record;
  if (sessionCommits === undefined || landing === undefined)
    throw new Error("Missing the kept comparison or captured landing.");
  const { repository } = sessionCommits;
  const prefixes = [
    `refs/open-dough/session-commits/${session.host}/${session.sessionId}/0/`,
    `refs/open-dough/one-shot/${landing.reference}/${landing.delivery}/`,
  ];
  const pins: string[] = [];
  for (const prefix of prefixes) {
    await git(repository, "update-ref", `${prefix}base`, base);
    await git(repository, "update-ref", `${prefix}revision`, revision);
    pins.push(`${prefix}base ${base}`, `${prefix}revision ${revision}`);
  }
  return pins;
}

async function refs(repository: string) {
  const { stdout } = await git(
    repository,
    "for-each-ref",
    "--format=%(refname) %(objectname)",
  );
  return stdout.trim().split("\n").filter(Boolean);
}

// Read the operational document itself, where expiry must remove the record.
async function storedSessionIds() {
  const stored = await readStoredRecords();
  if (stored.kind !== "document")
    throw new Error("Launch store is unreadable.");
  return (stored.document[source] ?? []).flatMap((record) =>
    "session" in record ? [record.session.sessionId] : [],
  );
}

for (const [reason, { done, remove }] of Object.entries(removals)) {
  test(`${reason} releases only the leaving record's session and landing pins`, async () => {
    const {
      checkout,
      records: { leaving, staying },
      work: { first, second },
    } = await aDoneCaptureCase()
      .withWork(
        makeMe.aCheckoutWork
          .committing("first", { at: workedAt })
          .committing("second", { at: workedAt }),
      )
      .withEstablishedSession(
        "leaving",
        { launched, done },
        keepingRun("first", { landed: true }),
      )
      .withEstablishedSession(
        "staying",
        { launched, done: 10 },
        keepingRun("second", { landed: true }),
      )
      .please();
    const repository = path.join(checkout.integration, ".git");
    const beforePins = await refs(repository);
    const leavingPins = await pinsOf(leaving, checkout.base, first);
    const stayingPins = await pinsOf(staying, checkout.base, second);
    // A failed legacy capture can leave refs without a kept comparison.
    const failedCapture = {
      ...leaving,
      sessionCommitsFailedAt: leaving.doneAt,
    };
    delete failedCapture.sessionCommits;
    keep(reason === "deletion" ? failedCapture : leaving, staying);
    expect(await storedSessionIds()).toEqual(["leaving", "staying"]);
    expect(await refs(repository)).toEqual(
      [...beforePins, ...leavingPins, ...stayingPins].sort(),
    );

    await remove(leaving);

    expect(await refs(repository)).toEqual(
      [...beforePins, ...stayingPins].sort(),
    );
    expect(await storedSessionIds()).toEqual(["staying"]);
  });

  test(`${reason} removes a record whose saved repository is gone`, async () => {
    const {
      checkout,
      records: { leaving: record },
    } = await aDoneCaptureCase()
      .withWork(makeMe.aCheckoutWork.committing("kept", { at: workedAt }))
      .withEstablishedSession("leaving", { launched, done }, keepingRun("kept"))
      .kept()
      .please();
    rmSync(path.join(checkout.integration, ".git"), { recursive: true });
    expect(await storedSessionIds()).toEqual(["leaving"]);

    await remove(record);

    expect(await storedSessionIds()).toEqual([]);
  });
}
