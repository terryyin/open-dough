import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
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

async function landingWorkspace() {
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
  const workspace = worktrees[branch];
  const { draft: revision } = await performWork(
    (at) => makeMe.aCheckoutWork.committing("draft", { at: at(30) }),
    { in: branch },
  );
  const submission = makeMe.aLandingSubmission
    .forLaunch({ reference, identity: declaredStory })
    .comparing({ base, revision })
    .please();
  return {
    branch,
    workspace,
    record,
    reference,
    base,
    gitDirectory,
    revision,
    submission,
    performWork,
  };
}

async function preparedLanding() {
  const ready = await landingWorkspace();
  return {
    ...ready,
    prepared: await handleLanding(ready.submission, dashboardOrigin, "prepare"),
  };
}

const clone = <T>(value: T): T => structuredClone(value);

async function captured(workspace: string) {
  const out = async (...args: string[]) =>
    (await git(workspace, ...args)).stdout;
  const indexPath = (
    await out("rev-parse", "--path-format=absolute", "--git-path", "index")
  ).trim();
  return {
    head: (await out("rev-parse", "HEAD")).trim(),
    status: await out("status", "--porcelain"),
    index: createHash("sha256").update(readFileSync(indexPath)).digest("hex"),
    refs: await out("for-each-ref", "--format=%(refname) %(objectname)"),
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

const workspaceCandidate =
  "This is not the established launch's workspace candidate and commit comparison.";

test("a prepare admits only this launch's comparison of its workspace HEAD", async () => {
  const { workspace, record, reference, base, revision, submission } =
    await landingWorkspace();
  const tree = (await git(workspace, "rev-parse", "HEAD^{tree}")).stdout.trim();
  const before = await captured(workspace);
  const beforeRecord = clone(await keptSession(source, record.session));
  expect(before.head).toBe(revision);
  expect(base).not.toBe(revision);
  const comparing = ({
    base: from,
    revision: to,
  }: {
    base: string;
    revision: string;
  }) =>
    makeMe.aLandingSubmission
      .forLaunch({ reference, identity: declaredStory })
      .comparing({ base: from, revision: to })
      .please();
  const omittedStory = Object.fromEntries(
    Object.entries(submission).filter(([key]) => key !== "identity"),
  ) as Omit<typeof submission, "identity">;
  for (const [report, status, message] of [
    [comparing({ base, revision: base }), 409, workspaceCandidate],
    [comparing({ base, revision: tree }), 409, workspaceCandidate],
    [comparing({ base, revision: "e1".repeat(20) }), 409, workspaceCandidate],
    [
      makeMe.aLandingSubmission
        .forLaunch({
          reference: "66666666-6666-4666-8666-666666666666",
          identity: declaredStory,
        })
        .comparing({ base, revision })
        .please(),
      404,
      "This dashboard accepted no such reporting launch.",
    ],
    [
      omittedStory,
      409,
      "This is not the established launch's authorized landing.",
    ],
  ] as const)
    await expect(
      handleLanding(report, dashboardOrigin, "prepare"),
    ).rejects.toMatchObject({ status, message });
  expect(await keptSession(source, record.session)).toEqual(beforeRecord);
  expect(await captured(workspace)).toEqual(before);
});

test("recording waits for acceptance, then a distinct pair leaves that landing unchanged", async () => {
  const {
    branch,
    workspace,
    record,
    reference,
    base,
    revision,
    submission,
    prepared,
    performWork,
  } = await preparedLanding();
  const preparedCapture = await captured(workspace);
  const preparedRecord = clone(await keptSession(source, record.session));
  await expect(
    handleLanding(submission, dashboardOrigin, "record"),
  ).rejects.toMatchObject({
    status: 409,
    message:
      "The authorized remote target has not confirmed this commit comparison.",
  });
  expect(await keptSession(source, record.session)).toEqual(preparedRecord);
  expect(preparedRecord?.landing).toBeUndefined();
  expect(preparedRecord?.landingReporting?.preparations).toEqual([
    expect.objectContaining({ base, revision }),
  ]);
  expect(await captured(workspace)).toEqual(preparedCapture);

  await git(workspace, "push", "--quiet", "origin", "HEAD:refs/heads/main");
  await expect(
    handleLanding(submission, dashboardOrigin, "record"),
  ).resolves.toEqual({ ...prepared, state: "recorded" });
  const { later } = await performWork(
    (at) => makeMe.aCheckoutWork.committing("later", { at: at(15) }),
    { in: branch },
  );
  await git(workspace, "merge-base", "--is-ancestor", base, later);
  const intact = await captured(workspace);
  const accepted = clone(await keptSession(source, record.session));
  expect(intact.head).toBe(later);
  expect(accepted?.landing).toMatchObject({ base, revision });
  const distinct = makeMe.aLandingSubmission
    .forLaunch({ reference, identity: declaredStory })
    .inDelivery("55555555-5555-4555-8555-555555555555")
    .comparing({ base, revision: later })
    .please();
  for (const operation of ["prepare", "record"] as const)
    await expect(
      handleLanding(distinct, dashboardOrigin, operation),
    ).rejects.toMatchObject({
      status: 409,
      message: "This launch already retained a different landing comparison.",
    });
  expect(await keptSession(source, record.session)).toEqual(accepted);
  expect(await captured(workspace)).toEqual(intact);
});
