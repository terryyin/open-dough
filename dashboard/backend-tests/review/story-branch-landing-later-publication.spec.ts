// A claimed Story Branch Mode launch has one landing
// (../../server/launchLandingReservation.ts). Once its trunk integration is
// recorded (first publish may omit --landing-context when an open expectation
// supplies the prepared path), a later trunk publication of the same launch,
// such as a repair, is made without the landing context as the launch's
// instruction directs (../../server/reportingInstruction.ts): trunk accepts it
// and the launch record keeps the first pair. The same publication with the
// context is refused before its push. Raw HTTP against the real installed start
// and a real bare origin (../../tests/support/startOrigin.ts) with the synthetic `claude`.

import { queuedReadyRepository } from "../../../tests/support/queued-repository.mjs";
import { expect, test } from "../../tests/support/pageTest.ts";
import type { DashboardServer } from "../../tests/support/dashboardServer.ts";
import {
  capturedPublicationSchema,
  git,
} from "../../tests/support/launchLanding.ts";
import { startBoundary } from "../../tests/support/launchDashboard.ts";
import {
  startOrigin,
  type StartOrigin,
} from "../../tests/support/startOrigin.ts";
import {
  claimedLaunchWithStoryCommit,
  claimedRecord,
} from "../../tests/support/storyBranchIntegration.ts";
import { openFirstLandingExpectation } from "../../../src/skills/dough-execute-plan/scripts/first-landing-expectation.mjs";

let origin: StartOrigin;
let server: DashboardServer;

test.beforeEach(async () => {
  origin = await startOrigin(queuedReadyRepository().please());
  server = await startBoundary(origin);
});

test.afterEach(async () => {
  await server.close();
  origin.cleanup();
});

test("after the recorded integration from an open expectation, a later trunk publication is accepted without landing and the launch keeps its first pair", async () => {
  const { workspace, branch, trunkTip, ...story } =
    await claimedLaunchWithStoryCommit(origin, server);
  const integrated = capturedPublicationSchema.parse(await story.integrated());
  expect(integrated).toMatchObject({
    classification: "published",
    landing: { state: "recorded" },
  });
  const accepted = (await origin.originGit("rev-parse", "main")).trim();
  const first = (await claimedRecord(server)).landing;
  expect(first).toMatchObject({
    base: trunkTip,
    revision: accepted,
    receipt: integrated.landing.receipt.receipt,
  });
  const repository = git(
    origin.project,
    "rev-parse",
    "--path-format=absolute",
    "--git-common-dir",
  );
  // Accepted capture cleared the expectation so a later omit takes no landing.
  await expect(
    openFirstLandingExpectation({ repository, workspace, branch }),
  ).resolves.toBeUndefined();

  const repair = story.laterTrunkPublication("repair.txt");

  // A second comparison for this launch is refused before anything is pushed.
  const refused = await repair.withContext();
  expect(refused.ok).toBe(false);
  expect(refused.stdout).toBe("");
  expect(refused.stderr).toContain(
    "This launch already retained a different landing comparison.",
  );
  expect((await origin.originGit("rev-parse", "main")).trim()).toBe(accepted);
  expect(git(workspace, "branch", "--show-current")).toBe(branch);
  expect(git(workspace, "status", "--porcelain")).toBe("");

  // The publication the instruction directs carries no context.
  const published = await repair.withoutContext();
  expect(published.ok, published.stderr).toBe(true);
  const result: unknown = JSON.parse(published.stdout);
  expect(result).toMatchObject({ classification: "published", pushCount: 1 });
  expect(result).not.toHaveProperty("landing");
  const main = (await origin.originGit("rev-parse", "main")).trim();
  expect(main).not.toBe(accepted);
  git(workspace, "fetch", "origin");
  git(workspace, "merge-base", "--is-ancestor", repair.tip, main);
  expect(git(workspace, "show", `${main}:repair.txt`)).toBe("repair.txt");
  expect((await claimedRecord(server)).landing).toEqual(first);
});
