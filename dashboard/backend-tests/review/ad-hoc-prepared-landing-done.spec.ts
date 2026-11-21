// A prepared receipt survives the durable Done write before it is recorded.
import { expect, test } from "vitest";
import { git } from "../../../Distribution/src/skills/dough-execute-plan/scripts/publication-git.mjs";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { handleLanding } from "../../server/launchLandingReporting.ts";
import {
  keptSession,
  setRecordDoneAt,
} from "../../server/launchRecordStore.ts";
import { source } from "../support/doneCaptureCase.ts";
import { aDoneCaptureCase } from "../support/doneCaptureCaseBuilder.ts";
import { dashboardOrigin } from "../support/publisherDashboardOrigin.ts";

const submissionReference = "11111111-0000-4000-8000-000000000737";

test("Done leaves the prepared receipt recordable after acceptance", async () => {
  const branch = "prepared-draft";
  const {
    checkout,
    baseTree: entryTree,
    worktrees,
    work: { draft: revision },
    records: { "default-launch": record },
    at,
  } = await aDoneCaptureCase()
    .withOrigin()
    .withWorkspace(branch)
    .withWork(
      (at) => makeMe.aCheckoutWork.committing("draft", { at: at(30) }),
      {
        in: branch,
      },
    )
    .withDefaultMainLaunch(
      "default-launch",
      { launched: 60 },
      (launch, facts) =>
        launch.withDeclaredLanding({
          repository: facts.checkout.gitDirectory,
          workspace: facts.worktrees[branch] ?? "",
          branch,
          committedTip: facts.checkout.base,
          tree: facts.baseTree,
          trunkRevision: facts.checkout.base,
          origin: dashboardOrigin,
          reference: submissionReference,
        }),
    )
    .kept()
    .please();
  const { base } = checkout;
  const workspace = worktrees[branch];
  const submission = makeMe.aLandingSubmission
    .forLaunch({ reference: submissionReference })
    .comparing({ base, revision })
    .please();
  const receipt = await handleLanding(submission, dashboardOrigin, "prepare");
  expect(receipt.state).toBe("prepared");
  await git(workspace, "push", "--quiet", "origin", "HEAD:refs/heads/main");

  const doneAt = at(10);
  await setRecordDoneAt(source, record.session, doneAt);

  const saved = await keptSession(source, record.session);
  expect(saved).toMatchObject({
    doneAt,
    branchResult: { base: entryTree, revision },
    landingReporting: {
      preparations: [
        {
          receipt: receipt.receipt,
          delivery: receipt.delivery,
          base,
          revision,
        },
      ],
    },
  });
  expect(saved?.landing).toBeUndefined();

  expect(await handleLanding(submission, dashboardOrigin, "record")).toEqual({
    ...receipt,
    state: "recorded",
  });
  expect((await keptSession(source, record.session))?.landing).toMatchObject({
    receipt: receipt.receipt,
    delivery: receipt.delivery,
    base,
    revision,
  });
});
