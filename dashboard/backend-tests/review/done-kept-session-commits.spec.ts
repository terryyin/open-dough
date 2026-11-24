// Done keeps and pins the work an execution checkout session made.
import { expect, test } from "vitest";
import { git } from "../../../Distribution/src/skills/dough-execute-plan/scripts/publication-git.mjs";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { keptSession } from "../../server/launchRecordStore.ts";
import { markDone, source } from "../support/doneCaptureCase.ts";
import { aDoneCaptureCase } from "../support/doneCaptureCaseBuilder.ts";

test("Done stores and pins the commit of an established Execution checkout session", async () => {
  const {
    checkout,
    records: { "established-default-main": record },
    performWork,
    at,
  } = await aDoneCaptureCase()
    .withEstablishedSession("established-default-main", { launched: 60 })
    .kept()
    .please();
  const { base, integration } = checkout;
  const { typo } = await performWork(
    makeMe.aCheckoutWork.committing("typo", { at: at(30) }),
  );

  const doneAt = at(10);
  await markDone(record, doneAt);

  expect(await keptSession(source, record.session)).toMatchObject({
    doneAt,
    sessionCommits: { runs: [{ base, revision: typo }] },
  });
  const refs =
    "refs/open-dough/session-commits/claude/established-default-main/0";
  expect(
    (
      await git(
        integration,
        "for-each-ref",
        "--format=%(refname) %(objectname)",
        refs,
      )
    ).stdout,
  ).toBe(`${refs}/base ${base}\n${refs}/revision ${typo}\n`);
});
