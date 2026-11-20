// A pair the installed publisher prepared before Done still records as the
// exact receipt and the session's landed comparison after Done.
import { expect, test } from "vitest";
import { git } from "../../../Distribution/src/skills/dough-execute-plan/scripts/publication-git.mjs";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import {
  aDeclaredPublisherBranch,
  contextReference,
  prepareLanding,
  recordLanding,
} from "../support/declaredPublisherBranch.ts";
import {
  inWorktree,
  keptRecordOf,
  markDone,
  minutesAgo,
  source,
  work,
} from "../support/doneCaptureCase.ts";
import { review } from "../support/doneCaptureReview.ts";
import { keptRecords } from "../../server/launchRecordStore.ts";

test("Done leaves the installed publisher's prepared receipt recordable after acceptance", async () => {
  const { checkout, workspace, record, entry, context } =
    await aDeclaredPublisherBranch("prepared-draft");
  const base = entry.committedTip;
  const { draft: revision } = await work(
    inWorktree(checkout, workspace),
    makeMe.aCheckoutWork.committing("draft", { at: minutesAgo(30) }),
  );
  const submission = makeMe.aLandingSubmission
    .forLaunch({ host: "claude", reference: contextReference(context) })
    .comparing({ base, revision })
    .please();
  const receipt = await prepareLanding(submission);
  expect(receipt.state).toBe("prepared");
  await git(workspace, "push", "--quiet", "origin", "HEAD:refs/heads/main");

  await markDone(record);
  const kept = await keptRecordOf(record.session.sessionId);
  expect(kept?.doneAt).toBeDefined();
  expect(kept?.landingReporting?.preparations).toMatchObject([
    { receipt: receipt.receipt, base, revision },
  ]);

  expect(await recordLanding(submission)).toEqual({
    ...receipt,
    state: "recorded",
  });
  expect(await review(await keptRecords(source), record)).toMatchObject({
    kind: "landed",
    baseline: base,
    tree: revision,
  });
});
