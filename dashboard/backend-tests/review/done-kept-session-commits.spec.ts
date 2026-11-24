import { readFile } from "node:fs/promises";
import path from "node:path";
import { expect, test } from "vitest";
import { git } from "../../../Distribution/src/skills/dough-execute-plan/scripts/publication-git.mjs";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { keptSession } from "../../server/launchRecordStore.ts";
import { markDone, source } from "../support/doneCaptureCase.ts";
import { aDoneCaptureCase } from "../support/doneCaptureCaseBuilder.ts";

test("Done leaves the unpublished checkout as it was and keeps the Done mark", async () => {
  const {
    checkout: { integration },
    records: { "established-default-main": record },
    performWork,
    at,
  } = await aDoneCaptureCase()
    .withEstablishedSession("established-default-main", { launched: 60 })
    .kept()
    .please();
  const { tip } = await performWork(
    makeMe.aCheckoutWork
      .committing("tip", { at: at(30) })
      .editing("working", { at: at(20), files: { "draft.txt": "keep me\n" } }),
  );

  const doneAt = at(10);
  await markDone(record, doneAt);

  const saved = await keptSession(source, record.session);
  expect(saved?.doneAt).toBe(doneAt);
  expect(typeof saved?.dispositionChangedAt).toBe("string");
  expect(await readFile(path.join(integration, "draft.txt"), "utf8")).toBe(
    "keep me\n",
  );
  expect((await git(integration, "rev-parse", "HEAD")).stdout.trim()).toBe(tip);
  expect(
    (await git(integration, "for-each-ref", "refs/open-dough/session-commits"))
      .stdout,
  ).toBe("");
});
