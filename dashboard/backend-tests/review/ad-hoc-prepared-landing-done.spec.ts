// A prepared receipt survives the durable Done write before it is recorded.
import { expect, test } from "vitest";
import { git } from "../../../Distribution/src/skills/dough-execute-plan/scripts/publication-git.mjs";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { handleLanding } from "../../server/launchLandingReporting.ts";
import {
  keptSession,
  setRecordDoneAt,
} from "../../server/launchRecordStore.ts";
import { dashboardOrigin } from "../support/publisherDashboardOrigin.ts";
import {
  aCheckoutWithCanonicalWorktree,
  aDefaultLaunch,
  canonicalGitDirectory,
  inWorktree,
  keep,
  minutesAgo,
  source,
  work,
} from "../support/doneCaptureCase.ts";

test("Done leaves the prepared receipt recordable after acceptance", async () => {
  const branch = "prepared-draft";
  const { checkout, workspace } = await aCheckoutWithCanonicalWorktree(branch);
  const { base } = checkout;
  const repository = canonicalGitDirectory(checkout);
  const entryTree = (
    await git(workspace, "rev-parse", `${base}^{tree}`)
  ).stdout.trim();
  const authority = makeMe.aLandingAuthority
    .ofRepository(repository)
    .inWorktree({ workspace, branch })
    .please();
  const { draft: revision } = await work(
    inWorktree(checkout, workspace),
    makeMe.aCheckoutWork.committing("draft", { at: minutesAgo(30) }),
  );
  const submission = makeMe.aLandingSubmission
    .comparing({ base, revision })
    .please();
  const record = aDefaultLaunch(checkout)
    .enteredBranch({
      repository,
      workspace,
      branch,
      committedTip: base,
      tree: entryTree,
      trunk: {
        remote: authority.remote,
        target: authority.target,
        revision: base,
      },
    })
    .withLandingReporting({
      origin: dashboardOrigin,
      authority,
      preparations: [],
      branchContext: {
        reference: submission.reference,
        file: "/tmp/prepared-landing-context.json",
      },
    })
    .please();
  keep(record);
  const receipt = await handleLanding(submission, dashboardOrigin, "prepare");
  expect(receipt.state).toBe("prepared");
  await git(workspace, "push", "--quiet", "origin", "HEAD:refs/heads/main");

  const doneAt = minutesAgo(10);
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
