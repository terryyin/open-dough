import path from "node:path";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { deleteRecord } from "../../test-support/agentLaunchBoundary.ts";
import { landingReceiptSchema } from "../../src/launchLanding.ts";
import {
  reviewedFileTextSchema,
  storyReviewFileTextEndpoint,
} from "../../src/storyReviewContract.ts";
import {
  adHocReview,
  keptAdHocRecord,
  markAdHocDone,
  retireAdHocBranch,
} from "../../test-support/support/adHocReview.ts";
import { getReview } from "../../test-support/support/completedReviewRequests.ts";
import { commit, git } from "../../test-support/support/launchLanding.ts";
import { expect, test } from "../../test-support/support/preparationPage.ts";
import { originMain } from "../../test-support/support/sessionDialog.ts";
import {
  launched,
  postLanding,
} from "../../test-support/support/startSessionLandingCapture.ts";
import { repositoryOf } from "../../test-support/support/startSessionLandingContext.ts";
import {
  declaredLandingReference,
  declareThroughLaunchInput,
  declareThroughSession,
  publishDeclaredSessionLanding,
  retryDeclaredLanding,
} from "../../test-support/support/declaredSessionLanding.ts";

test.use({ serverMode: "boundary" });

test("the declared worktree's installed landing and exact retry stay with the original launch", async ({
  dashboard,
  origin,
  request,
}) => {
  const original = await launched(dashboard, {
    instruction: "Write and deliver the draft",
  });
  const other = await launched(dashboard, {
    instruction: "Review a different change",
  });
  const reference = original.record.request.reporting?.reference;
  const otherReference = other.record.request.reporting?.reference;
  if (reference === undefined || otherReference === undefined)
    throw new Error("Missing the launch's reporting context.");

  const base = await originMain(origin);
  const workspace = path.join(origin.machine, "declared-draft");
  git(origin.project, "worktree", "add", "--quiet", "-b", "draft", workspace);
  const handoff = await declareThroughLaunchInput(original.sent, workspace);
  const session = original.record.session.sessionId;
  expect(handoff.session).toBe(session);
  expect(declaredLandingReference(handoff.landingContext)).toBe(reference);
  expect(handoff.branchEntry).toMatchObject({
    branch: "draft",
    repository: repositoryOf(origin.project),
    committedTip: base,
    trunk: { remote: "origin", target: "refs/heads/main" },
  });

  const candidate = commit(workspace, "draft.txt");
  const undeclared = path.join(origin.machine, "undeclared");
  git(
    origin.project,
    "worktree",
    "add",
    "--quiet",
    "-b",
    "unrelated",
    undeclared,
  );
  const wrongTip = commit(undeclared, "unrelated.txt");
  const anotherLaunch = makeMe.aLandingSubmission
    .forLaunch({ reference: otherReference })
    .comparing({ base, revision: candidate })
    .please();
  const anotherWorkspace = makeMe.aLandingSubmission
    .forLaunch({ reference })
    .comparing({ base, revision: wrongTip })
    .please();
  expect((await postLanding(dashboard, anotherLaunch)).status).toBe(409);
  expect((await postLanding(dashboard, anotherWorkspace)).status).toBe(409);
  expect(
    (await keptAdHocRecord(dashboard, session))?.landingReporting?.preparations,
  ).toEqual([]);
  expect(
    (await keptAdHocRecord(dashboard, other.record.session.sessionId))?.landing,
  ).toBeUndefined();

  const { result, before } = publishDeclaredSessionLanding(
    handoff,
    base,
    origin,
    dashboard.home,
  );
  expect(result).toMatchObject({
    ok: true,
    publication: "accepted",
    receipt: { sha: candidate },
    landing: { state: "recorded" },
  });
  expect(before).toMatchObject({
    trunk: base,
    preparations: [{ base, revision: candidate }],
  });
  const receipt = landingReceiptSchema.parse(result.landing.receipt);
  expect(receipt).toMatchObject({
    reference,
    base,
    revision: candidate,
    remote: "origin",
    target: "refs/heads/main",
  });
  expect(await originMain(origin)).toBe(candidate);
  expect((await keptAdHocRecord(dashboard, session))?.doneAt).toBeUndefined();

  retireAdHocBranch(origin.project, workspace, "draft");
  await markAdHocDone(dashboard, session);
  expect(
    await retryDeclaredLanding(handoff.landingContext, origin.machine),
  ).toEqual(receipt);
  expect(await originMain(origin)).toBe(candidate);
  expect(await adHocReview(request, dashboard, session)).toMatchObject({
    kind: "landed",
    baseline: base,
    tree: candidate,
    landing: { reference },
    files: [{ kind: "added", path: "draft.txt" }],
  });
  const file = await getReview(
    request,
    dashboard,
    storyReviewFileTextEndpoint,
    {
      source: "open-dough",
      host: "claude",
      session,
      reference,
      baseline: base,
      tree: candidate,
      path: "draft.txt",
    },
  );
  expect(file.status()).toBe(200);
  expect(reviewedFileTextSchema.parse(await file.json())).toMatchObject({
    baseline: null,
    tree: "draft.txt\n",
  });
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

  await markAdHocDone(dashboard, session);
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
