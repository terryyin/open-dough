import { expect, test } from "vitest";
import { git } from "../../../Distribution/src/skills/dough-execute-plan/scripts/publication-git.mjs";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { heldLandingPins } from "../../server/launchLandingGit.ts";
import {
  handleLanding,
  machineLandingStores,
} from "../../server/launchLandingReporting.ts";
import { keptSession } from "../../server/launchRecordStore.ts";
import { landingReportingReference } from "../../src/launchLanding.ts";
import { keep, source } from "../support/doneCaptureCase.ts";
import {
  aDoneCaptureCase,
  declaredStory,
} from "../support/doneCaptureCaseBuilder.ts";
import { dashboardOrigin } from "../support/publisherDashboardOrigin.ts";

async function preparedLanding() {
  const branch = "landing-draft" as const;
  const { checkout, worktrees, records, performWork } = await aDoneCaptureCase()
    .withOrigin()
    .withWorkspace(branch)
    .withDeclaredLandingLaunch("default-launch", { launched: 60 }, branch)
    .please();
  const record = records["default-launch"];
  keep(record);
  const reference = landingReportingReference(record);
  if (reference === undefined) throw new Error("Missing landing reference.");
  const { base, gitDirectory } = checkout;
  const { draft: revision } = await performWork(
    (at) => makeMe.aCheckoutWork.committing("draft", { at: at(30) }),
    { in: branch },
  );
  const submission = makeMe.aLandingSubmission
    .forLaunch({ reference, identity: declaredStory })
    .comparing({ base, revision })
    .please();
  const prepared = await handleLanding(submission, dashboardOrigin, "prepare");
  return {
    branch,
    workspace: worktrees[branch],
    record,
    reference,
    base,
    gitDirectory,
    revision,
    submission,
    prepared,
    performWork,
  };
}

test("landing recording repairs missing and wrong pins before writing acceptance", async () => {
  const {
    workspace,
    record,
    reference,
    base,
    gitDirectory,
    revision,
    submission,
    prepared,
  } = await preparedLanding();
  const prefix = `refs/open-dough/one-shot/${reference}/${submission.delivery}/`;
  await git(gitDirectory, "update-ref", "-d", `${prefix}base`);
  await git(gitDirectory, "update-ref", `${prefix}revision`, base);
  await git(workspace, "push", "--quiet", "origin", "HEAD:refs/heads/main");

  const recorded = await handleLanding(submission, dashboardOrigin, "record", {
    ...machineLandingStores,
    replaceRecords: async (change) => {
      expect(
        (await keptSession(source, record.session))?.landing,
      ).toBeUndefined();
      expect(await heldLandingPins(gitDirectory, submission)).toEqual([
        { ref: `${prefix}base`, objectId: base },
        { ref: `${prefix}revision`, objectId: revision },
      ]);
      await machineLandingStores.replaceRecords(change);
    },
  });

  const { state, ...landing } = recorded;
  expect(state).toBe("recorded");
  expect(recorded).toEqual({ ...prepared, state });
  expect((await keptSession(source, record.session))?.landing).toEqual({
    ...landing,
    repository: gitDirectory,
  });
});

test("landing recording follows the exact authorized target as it advances past the revision", async () => {
  const { branch, workspace, submission, prepared, performWork } =
    await preparedLanding();
  await git(
    workspace,
    "push",
    "--quiet",
    "origin",
    "HEAD:refs/heads/lookalike/refs/heads/main",
  );
  await expect(
    handleLanding(submission, dashboardOrigin, "record"),
  ).rejects.toMatchObject({ status: 409 });

  await performWork(
    (at) => makeMe.aCheckoutWork.committing("later", { at: at(15) }),
    { in: branch },
  );
  await git(workspace, "push", "--quiet", "origin", "HEAD:refs/heads/main");

  await expect(
    handleLanding(submission, dashboardOrigin, "record"),
  ).resolves.toEqual({ ...prepared, state: "recorded" });
});
