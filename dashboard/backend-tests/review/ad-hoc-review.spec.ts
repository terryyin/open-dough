// An ad hoc review names the project and session and reads the retained
// landing after the worktree is gone and trunk has advanced; file reads name
// that answer's reference, pair and a listed path, including a rename's old path.
import { test } from "../../tests/support/codexStart.ts";
import {
  expectDefaultLaunchNotCaptured,
  expectEmptySameTreeLanding,
  expectLandedAfterTrunkAdvance,
  expectSessionSubjectRefusals,
  expectUnreadableLandingGaps,
} from "../../tests/support/adHocReviewCases.ts";
import {
  expectForeignFileRefusals,
  expectRenameFileAdmission,
} from "../../tests/support/adHocReviewFileCases.ts";

test.use({ serverMode: "boundary" });

test("a kept ad hoc landing answers as landed after worktree removal and trunk advance", async ({
  request,
  dashboard,
}) => {
  await expectLandedAfterTrunkAdvance(request, dashboard);
});

test("ad hoc review refuses a story session, an unknown session, and a dual subject", async ({
  request,
  dashboard,
}) => {
  await expectSessionSubjectRefusals(request, dashboard);
});

test("a default launch without a landing says its changes were not captured", async ({
  request,
  dashboard,
}) => {
  await expectDefaultLaunchNotCaptured(request, dashboard);
});

test("an ad hoc landing whose repository or objects are gone explains the gap", async ({
  request,
  dashboard,
}) => {
  await expectUnreadableLandingGaps(request, dashboard);
});

test("an ad hoc landing whose base and revision hold the same tree is landed empty", async ({
  request,
  dashboard,
}) => {
  await expectEmptySameTreeLanding(request, dashboard);
});

test("an ad hoc landed answer admits its file diff and text for a rename's old path", async ({
  request,
  dashboard,
}) => {
  await expectRenameFileAdmission(request, dashboard);
});

test("an ad hoc file read refuses a foreign path, pair, or another session's reference", async ({
  request,
  dashboard,
}) => {
  await expectForeignFileRefusals(request, dashboard);
});
