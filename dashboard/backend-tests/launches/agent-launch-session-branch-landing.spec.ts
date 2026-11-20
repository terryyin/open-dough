import path from "node:path";
import {
  deleteRecord,
  markDone,
} from "../../test-support/agentLaunchBoundary.ts";
import {
  adHocReview,
  keptAdHocRecord,
  retireAdHocBranch,
} from "../../test-support/support/adHocReview.ts";
import { commit, git } from "../../test-support/support/launchLanding.ts";
import { expect, test } from "../../test-support/support/preparationPage.ts";
import { originMain } from "../../test-support/support/sessionDialog.ts";
import { launched } from "../../test-support/support/startSessionLandingCapture.ts";
import {
  declaredLandingReference,
  declareThroughSession,
  publishDeclaredSessionLanding,
  retryDeclaredLanding,
} from "../../test-support/support/declaredSessionLanding.ts";

test.use({
  serverMode: "boundary",
  liveServer: "synchronous delivery child blocks the mounted receiver",
});

test("a blank Default main launch keeps its declared landing until record deletion", async ({
  dashboard,
  origin,
  request,
}) => {
  const blank = await launched(dashboard, {});
  expect(blank.sent).toBe("");
  expect(blank.record.request.reporting).toBeUndefined();
  const session = blank.record.session.sessionId;
  const workspace = path.join(origin.machine, "blank-draft");
  git(
    origin.project,
    "worktree",
    "add",
    "--quiet",
    "-b",
    "blank-draft",
    workspace,
  );
  const handoff = await declareThroughSession(
    dashboard,
    session,
    workspace,
    "blank-draft",
  );
  expect(handoff.session).toBe(session);
  const reference = declaredLandingReference(handoff.landingContext);
  const base = await originMain(origin);
  const candidate = commit(workspace, "blank-landing.txt");
  const { result, before } = publishDeclaredSessionLanding(
    handoff,
    base,
    origin,
    dashboard.home,
  );
  expect(result.landing.receipt).toMatchObject({
    reference,
    base,
    revision: candidate,
  });
  expect(before).toMatchObject({
    trunk: base,
    preparations: [{ base, revision: candidate }],
  });
  expect(await originMain(origin)).toBe(candidate);
  retireAdHocBranch(origin.project, workspace, "blank-draft");

  dashboard.claudeSessionBecomes(session, "done-live");
  const response = await markDone(dashboard, { source: "open-dough", session });
  expect(response.status, response.body).toBe(200);
  expect(
    await retryDeclaredLanding(handoff.landingContext, origin.machine),
  ).toEqual(result.landing.receipt);
  expect(
    (await keptAdHocRecord(dashboard, session))?.request.reporting,
  ).toBeUndefined();
  expect(await adHocReview(request, dashboard, session)).toMatchObject({
    kind: "landed",
    baseline: base,
    tree: candidate,
    landing: { reference },
    files: [{ kind: "added", path: "blank-landing.txt" }],
  });
  const pins = () =>
    git(
      origin.project,
      "for-each-ref",
      "--format=%(objectname)",
      `refs/open-dough/one-shot/${reference}/`,
    ).trim();
  expect(pins().split("\n")).toContain(candidate);

  dashboard.claudeListingFails(true);
  const deleted = await deleteRecord(dashboard, {
    source: "open-dough",
    session,
  });
  expect(JSON.parse(deleted.body)).toEqual({ kind: "deleted" });
  expect(pins()).toBe("");
});
