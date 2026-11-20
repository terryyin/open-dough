// Observing a published revision delivers a Done branch merged on trunk by
// hand once: repeated and later observations, also after a restart, keep the
// same receipt and landing pins until the launch is deleted.
import { expect, test } from "vitest";
import { git } from "../../../Distribution/src/skills/dough-execute-plan/scripts/publication-git.mjs";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { deleteRecord, keptSession } from "../../server/launchRecordStore.ts";
import { sessionLandingObservations } from "../../server/observedSessionLandings.ts";
import {
  landingPins,
  sessionBranchPins,
} from "../../test-support/support/adHocReview.ts";
import {
  aCheckout,
  anIsolatedLaunch,
  fileText,
  historyBeforeTheCase,
  inWorktree,
  keep,
  markDone,
  minutesAgo,
  review,
  source,
  work,
} from "../support/doneCaptureCase.ts";

const branch = "draft";
const project = { id: source, ref: "main" };

test("ordinary revision checks retain one delivery across repeated observations", async () => {
  const checkout = await aCheckout({
    history: historyBeforeTheCase().withWorkspace(branch, { from: "base" }),
    withOrigin: true,
  });
  const { integration, execution: workspace } = checkout;
  if (workspace === undefined) throw new Error("Missing the draft worktree.");
  const record = anIsolatedLaunch(checkout, { workspace, branch }).please();
  keep(record);
  const { draft: tip } = await work(
    inWorktree(checkout, workspace),
    makeMe.aCheckoutWork.committing("draft", { at: minutesAgo(30) }),
  );
  await markDone(record);
  await git(integration, "merge", "--quiet", "--no-ff", "--no-edit", tip);
  await git(integration, "push", "--quiet", "origin", "main");
  const merge = (await git(integration, "rev-parse", "HEAD")).stdout.trim();

  await sessionLandingObservations().observe(project, merge);
  const captured = await review(record);
  expect(captured).toMatchObject({
    kind: "landed",
    baseline: checkout.base,
    tree: merge,
    files: [{ path: "draft.txt" }],
  });
  if (captured.kind !== "landed") throw new Error("Missing the delivery.");
  expect(
    await fileText(record, {
      reference: captured.landing.reference,
      baseline: checkout.base,
      tree: merge,
      path: "draft.txt",
    }),
  ).toEqual({ kind: "text", baseline: null, tree: "draft work\n" });
  const saved = (await keptSession(source, record.session))?.landing;
  const pins = landingPins(integration);
  expect(pins).toEqual([
    `refs/open-dough/one-shot/${captured.landing.reference}/${captured.landing.delivery}/base`,
    `refs/open-dough/one-shot/${captured.landing.reference}/${captured.landing.delivery}/revision`,
  ]);

  const observations = sessionLandingObservations();
  await observations.observe(project, merge);
  const { advance } = await work(
    checkout,
    makeMe.aCheckoutWork
      .committing("later", { at: minutesAgo(5) })
      .pushingToTrunk("advance", { at: minutesAgo(5) }),
  );
  await observations.observe(project, advance);
  expect(await review(record)).toEqual(captured);
  expect((await keptSession(source, record.session))?.landing).toEqual(saved);
  expect(landingPins(integration)).toEqual(pins);

  await deleteRecord(source, record.session);
  expect(sessionBranchPins(integration, record.session.sessionId)).toEqual([]);
  expect(landingPins(integration)).toEqual([]);
});
