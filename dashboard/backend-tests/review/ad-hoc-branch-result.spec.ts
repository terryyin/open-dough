// Done pins an isolated ad hoc branch's result. Deletion and expiry release
// only that launch's pins.
import { writeFileSync } from "node:fs";
import path from "node:path";
import { expect, test } from "vitest";
import { git } from "../../../Distribution/src/skills/dough-execute-plan/scripts/publication-git.mjs";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { sessionBranchPins } from "../../server/launchRecordPins.ts";
import {
  changeSessionRecord,
  deleteRecord,
} from "../../server/launchRecordStore.ts";
import { retireExpiredRecords } from "../../server/launchRecordRemoval.ts";
import {
  launchRetentionDays,
  type LaunchRecord,
} from "../../src/launchRecord.ts";
import { markDone, source } from "../support/doneCaptureCase.ts";
import { aDoneCaptureCase } from "../support/doneCaptureCaseBuilder.ts";
import { captureBranchResult } from "../../server/sessionBranchCapture.ts";

test("Done's capture reads an empty branch and refuses a missing checkout", async () => {
  const {
    checkout,
    worktrees,
    records: { empty, missing },
    at,
  } = await aDoneCaptureCase()
    .withOrigin()
    .withWorkspace("empty")
    .withWorkspace("missing")
    .withIsolatedLaunch("empty", { launched: 60 }, "empty")
    .withIsolatedLaunch("missing", { launched: 60 }, "missing")
    .please();
  await git(checkout.integration, "worktree", "remove", worktrees.missing);
  const doneAt = at(10);

  expect((await captureBranchResult(empty, doneAt)).result).toMatchObject({
    base: checkout.base,
    revision: checkout.base,
    committedTip: checkout.base,
  });
  await expect(captureBranchResult(missing, doneAt)).rejects.toThrow();
});

const retentionAgo = new Date(
  Date.now() - (launchRetentionDays + 1) * 86_400_000,
).toISOString();

const removals = {
  deletion: (record) => deleteRecord(source, record.session),
  // Retention drops the aged record at the project's next record write,
  // which retires it through the production cleanup.
  expiry: async (record) => {
    await changeSessionRecord(source, record.session, (kept) => ({
      ...kept,
      doneAt: retentionAgo,
    }));
    await changeSessionRecord(
      source,
      record.session,
      (kept) => kept,
      retireExpiredRecords,
    );
  },
} satisfies Record<string, (record: LaunchRecord) => Promise<unknown>>;

for (const [reason, remove] of Object.entries(removals)) {
  test(`${reason} releases only that launch's retained branch evidence`, async () => {
    const {
      checkout,
      worktrees,
      records: { leaving, staying },
      work: { first, second },
    } = await aDoneCaptureCase()
      .withOrigin()
      .withWorkspace("leaving")
      .withWorkspace("staying")
      .withIsolatedLaunch("leaving", { launched: 60 }, "leaving")
      .withIsolatedLaunch("staying", { launched: 60 }, "staying")
      .withWork(
        (at) => makeMe.aCheckoutWork.committing("first", { at: at(30) }),
        {
          in: "leaving",
        },
      )
      .withWork(
        (at) => makeMe.aCheckoutWork.committing("second", { at: at(30) }),
        {
          in: "staying",
        },
      )
      .kept()
      .please();
    writeFileSync(
      path.join(worktrees.leaving, "draft.txt"),
      "A draft to keep.\n",
    );
    await markDone(leaving);
    await markDone(staying);
    const pins = (record: LaunchRecord) =>
      sessionBranchPins(checkout.integration, record.session);
    expect(await pins(leaving)).toContainEqual(
      expect.objectContaining({ objectId: first }),
    );
    expect(await pins(leaving)).toHaveLength(3);
    const stayingPins = await pins(staying);
    expect(stayingPins).toContainEqual(
      expect.objectContaining({ objectId: second }),
    );

    await remove(leaving);

    expect(await pins(leaving)).toEqual([]);
    expect(await pins(staying)).toEqual(stayingPins);
  });
}
