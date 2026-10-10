// A claimed Story Branch Mode launch has one landing
// (../server/launchLandingReservation.ts). Once its trunk integration is
// recorded, a later trunk publication of the same launch, such as a repair,
// is made without the landing context as the launch's instruction directs
// (../server/reportingInstruction.ts): trunk accepts it and the launch record
// keeps the first pair. The same publication with the context is refused
// before its push. Raw HTTP against the real installed start and a real bare
// origin (./support/startOrigin.ts) with the synthetic `claude`.

import { expect, test } from "./support/pageTest.ts";
import type { DashboardServer } from "./support/dashboardServer.ts";
import { capturedPublicationSchema, git } from "./support/oneShotLanding.ts";
import { startPreview } from "./support/oneShotLaunch.ts";
import { startOrigin, type StartOrigin } from "./support/startOrigin.ts";
import {
  claimedLaunchWithStoryCommit,
  claimedRecord,
} from "./support/storyBranchIntegration.ts";

let origin: StartOrigin;
let server: DashboardServer;

test.beforeEach(async () => {
  origin = await startOrigin();
  server = await startPreview(origin);
});

test.afterEach(async () => {
  await server.close();
  origin.cleanup();
});

test("after the recorded integration, a later trunk publication is accepted without the landing context and the launch keeps its first pair", async () => {
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
