import { existsSync, symlinkSync } from "node:fs";
import path from "node:path";
import { doneRecordFileName } from "../../../Distribution/src/skills/dough-product-backlog/scripts/product-backlog-done-record.mjs";
import { sessionRecordPathBeside } from "../../../Distribution/src/skills/dough-execute-plan/scripts/session-record.mjs";
import {
  admitForCompletion,
  finishAdmittedClaim,
} from "../../test-support/support/admittedSessionCompletion.ts";
import { expect, test } from "../../test-support/support/codexStart.ts";
import { reportingChild } from "../../test-support/support/completionRecovery.ts";
import { git } from "../../test-support/support/storyReviewWorktree.ts";

test("ordinary no-change wrap-up closes the admitted claim and keeps the borrowed checkout", async ({
  dashboard,
  origin,
}) => {
  const head = git(origin.project, "rev-parse", "HEAD");
  const admitted = await admitForCompletion(
    dashboard,
    origin,
    "Confirm the current behavior",
  );
  const base = admitted.claim.publishedSha;
  const nativeAlias = path.join(origin.machine, "borrowed-checkout-alias");
  symlinkSync(origin.project, nativeAlias, "dir");
  const final = await finishAdmittedClaim(admitted, base, nativeAlias);
  expect(existsSync(admitted.claim.workspace)).toBe(false);
  expect(git(origin.project, "rev-parse", "HEAD")).toBe(head);
  expect(
    await origin.originGit(
      "show",
      `main:.planning/done/${doneRecordFileName(admitted.identity)}`,
    ),
  ).toContain(admitted.identity);
  const record = sessionRecordPathBeside(
    ".planning/PRODUCT-BACKLOG.md",
    admitted.reporting.reference,
  );
  expect(
    JSON.parse(await origin.originGit("show", `main:${record}`)),
  ).toMatchObject({
    sessionId: admitted.reporting.reference,
    story: admitted.identity,
    ranges: [{ base, candidate: final }],
  });
  expect(
    existsSync(
      path.join(
        path.dirname(admitted.landingContext),
        "first-landing-expectation.json",
      ),
    ),
  ).toBe(false);
  const tip = (await origin.originGit("rev-parse", "main")).trim();
  const report = await reportingChild(
    `${admitted.reporting.command} --outcome completed`,
    origin.machine,
  );
  expect(report.ok, report.stderr).toBe(true);
  expect(JSON.parse(report.stdout)).toMatchObject({
    reference: admitted.reporting.reference,
    outcome: "completed",
    message: "",
    state: "recorded",
  });
  expect((await origin.originGit("rev-parse", "main")).trim()).toBe(tip);
});
