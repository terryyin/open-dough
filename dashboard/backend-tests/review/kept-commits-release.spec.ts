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
import { daysAgo } from "../../test-support/machineLaunchRecords.ts";
import {
  aCheckout,
  anEstablishedSession,
  type Checkout,
  keep,
  minutesAgo,
  source,
  work,
} from "../support/doneCaptureCase.ts";

const removals = {
  deletion: {
    doneAt: minutesAgo(10),
    remove: async (record: LaunchRecord) => {
      expect(await deleteRecord(source, record.session)).toBe(true);
    },
  },
  expiry: {
    doneAt: daysAgo(launchRetentionDays + 1),
    remove: async () => {
      await replaceRecords((kept) => kept, retireExpiredRecords);
    },
  },
};

function keepingRun(
  checkout: Checkout,
  repository: string,
  sessionId: string,
  revision: string,
  doneAt: string,
) {
  return anEstablishedSession(checkout, {
    sessionId,
    launchedAt: daysAgo(launchRetentionDays + 3),
  })
    .keptSessionCommits({
      repository,
      runs: [{ base: checkout.base, revision }],
    })
    .markedDoneAt(doneAt);
}

async function recordKeepingPins(
  checkout: Checkout,
  repository: string,
  sessionId: string,
  revision: string,
  doneAt: string,
) {
  const landing = makeMe.aLaunchLanding
    .capturedFrom({ repository })
    .forLaunch(randomUUID())
    .comparing({ base: checkout.base, revision })
    .please();
  const record = keepingRun(checkout, repository, sessionId, revision, doneAt)
    .withCapturedLanding(landing)
    .please();
  const prefixes = [
    `refs/open-dough/session-commits/${record.session.host}/${sessionId}/0/`,
    `refs/open-dough/one-shot/${landing.reference}/${landing.delivery}/`,
  ];
  const pins: string[] = [];
  for (const prefix of prefixes) {
    await git(repository, "update-ref", `${prefix}base`, checkout.base);
    await git(repository, "update-ref", `${prefix}revision`, revision);
    pins.push(
      `${prefix}base ${checkout.base}`,
      `${prefix}revision ${revision}`,
    );
  }
  return { record, pins };
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

for (const [reason, { doneAt, remove }] of Object.entries(removals)) {
  test(`${reason} releases only the leaving record's session and landing pins`, async () => {
    const checkout = await aCheckout();
    const { first, second } = await work(
      checkout,
      makeMe.aCheckoutWork
        .committing("first", { at: daysAgo(launchRetentionDays + 2) })
        .committing("second", { at: daysAgo(launchRetentionDays + 2) }),
    );
    const repository = path.join(checkout.integration, ".git");
    const beforePins = await refs(repository);
    const leaving = await recordKeepingPins(
      checkout,
      repository,
      "leaving",
      first,
      doneAt,
    );
    const staying = await recordKeepingPins(
      checkout,
      repository,
      "staying",
      second,
      minutesAgo(10),
    );
    keep(leaving.record, staying.record);
    expect(await storedSessionIds()).toEqual(["leaving", "staying"]);
    expect(await refs(repository)).toEqual(
      [...beforePins, ...leaving.pins, ...staying.pins].sort(),
    );

    await remove(leaving.record);

    expect(await refs(repository)).toEqual(
      [...beforePins, ...staying.pins].sort(),
    );
    expect(await storedSessionIds()).toEqual(["staying"]);
  });

  test(`${reason} removes a record whose saved repository is gone`, async () => {
    const checkout = await aCheckout();
    const { kept } = await work(
      checkout,
      makeMe.aCheckoutWork.committing("kept", {
        at: daysAgo(launchRetentionDays + 2),
      }),
    );
    const repository = path.join(checkout.integration, ".git");
    const record = keepingRun(
      checkout,
      repository,
      "leaving",
      kept,
      doneAt,
    ).please();
    keep(record);
    rmSync(repository, { recursive: true });
    expect(await storedSessionIds()).toEqual(["leaving"]);

    await remove(record);

    expect(await storedSessionIds()).toEqual([]);
  });
}
