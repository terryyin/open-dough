// A claimed Story Branch Mode launch's trunk integration records its delivered
// pair (../server/launchLandingGit.ts): the installed
// `history-preserving-publication.mjs integrate` merges the published story
// tip onto fetched trunk in the launch's own worktree, and the real receiver
// keeps the fetched trunk tip and the accepted revision on the launch record.
// Raw HTTP against the real installed start and a real bare origin
// (./support/startOrigin.ts) with the synthetic `claude`.

import path from "node:path";
import { z } from "zod";
import { expect, test } from "./support/pageTest.ts";
import { keptAttempts } from "./acceptedAttempts.ts";
import { landingReceiptSchema } from "../src/launchLanding.ts";
import { quote, reportingChild } from "./support/completionRecovery.ts";
import {
  builtDashboardDir,
  startDashboardServer,
  type DashboardServer,
} from "./support/dashboardServer.ts";
import {
  capturedPublicationSchema,
  git,
  refs,
} from "./support/oneShotLanding.ts";
import { landingGitFault } from "./support/oneShotLandingRecovery.ts";
import { startPreview } from "./support/oneShotLaunch.ts";
import { startOrigin, type StartOrigin } from "./support/startOrigin.ts";
import {
  claimedLaunchWithStoryCommit,
  claimedRecord,
} from "./support/storyBranchIntegration.ts";

test.describe("a claimed Story Branch Mode launch's trunk integration", () => {
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

  test("records the fetched trunk tip and the accepted merge, and refuses a candidate that is not the workspace HEAD", async () => {
    const { record, reporting, workspace, branch, identity, ...story } =
      await claimedLaunchWithStoryCommit(origin, server);
    const { storyTip, trunkTip, integrated: integrate } = story;

    // The bound record took the attempt's capture authority at binding.
    const authority = keptAttempts(server).find(
      (entry) => entry.id === reporting.reference,
    )?.landingRepository;
    expect(authority).toMatchObject({ workspace, branch, identity });
    expect(record.landingReporting).toMatchObject({
      origin: server.origin,
      authority,
      preparations: [],
    });
    expect(record.landing).toBeUndefined();

    // A comparison whose candidate the workspace does not hold is refused.
    git(workspace, "fetch", "origin");
    const startTip = git(workspace, "rev-parse", `${trunkTip}^`);
    const refused = await reportingChild(
      `${reporting.command} --operation landing-prepare --identity ${quote(identity)} --remote origin --target refs/heads/main --base ${startTip} --revision ${trunkTip}`,
      origin.machine,
    );
    expect(refused.ok).toBe(false);
    expect(refused.stderr).toContain(
      "This is not the established launch's workspace candidate and commit comparison.",
    );
    expect(
      (await claimedRecord(server)).landingReporting?.preparations,
    ).toEqual([]);

    const integrated = capturedPublicationSchema.parse(await integrate());
    const accepted = (await origin.originGit("rev-parse", "main")).trim();
    expect(integrated).toMatchObject({
      classification: "published",
      pushCount: 1,
      receipt: { sha: accepted, target: "refs/heads/main" },
      landing: { state: "recorded" },
    });
    // A detached merge of the story tip onto the fetched trunk tip.
    expect(accepted).not.toBe(storyTip);
    expect(git(workspace, "rev-parse", `${accepted}^1`)).toBe(trunkTip);
    expect(git(workspace, "rev-parse", `${accepted}^2`)).toBe(storyTip);
    expect(git(workspace, "branch", "--show-current")).toBe(branch);

    const receipt = integrated.landing.receipt;
    expect(receipt).toMatchObject({
      state: "recorded",
      reference: reporting.reference,
      identity,
      remote: "origin",
      target: "refs/heads/main",
      base: trunkTip,
      revision: accepted,
    });
    const landed = await claimedRecord(server);
    const repository = git(
      origin.project,
      "rev-parse",
      "--path-format=absolute",
      "--git-common-dir",
    );
    expect(landed.landing).toMatchObject({
      repository,
      reference: reporting.reference,
      identity,
      remote: "origin",
      target: "refs/heads/main",
      base: trunkTip,
      revision: accepted,
      receipt: receipt.receipt,
    });
    // The one pair prepared before the push is the pair recorded after it.
    expect(landed.landingReporting?.authority).toEqual(authority);
    expect(landed.landingReporting?.preparations).toHaveLength(1);
    expect(landed.landingReporting?.preparations[0]).toMatchObject({
      delivery: receipt.delivery,
      base: trunkTip,
      revision: accepted,
    });
    expect(landed.completion).toBeUndefined();
    expect(landed.doneAt).toBeUndefined();

    // Both ends are pinned, and the comparison holds the story's file alone.
    const pin = `refs/open-dough/one-shot/${reporting.reference}/${receipt.delivery}`;
    const pinned = refs(repository).split("\n");
    expect(pinned).toContain(`${pin}/base ${trunkTip}`);
    expect(pinned).toContain(`${pin}/revision ${accepted}`);
    expect(git(repository, "diff", "--name-only", trunkTip, accepted)).toBe(
      "story.txt",
    );

    // Running the integration again publishes nothing and answers the same
    // landing receipt.
    expect(capturedPublicationSchema.parse(await integrate())).toMatchObject({
      classification: "already-accepted",
      pushCount: 0,
      landing: { state: "recorded", receipt },
    });
    expect((await origin.originGit("rev-parse", "main")).trim()).toBe(accepted);
    expect((await claimedRecord(server)).landing).toEqual(landed.landing);
  });

  test("a fast-forward integration records the comparison from fetched trunk to the story tip", async () => {
    const { reporting, trunkTip, storyTip, workspace, ...story } =
      await claimedLaunchWithStoryCommit(origin, server, false);
    const integrated = capturedPublicationSchema.parse(
      await story.integrated(),
    );
    expect(integrated).toMatchObject({
      classification: "published",
      receipt: { sha: storyTip, target: "refs/heads/main" },
      landing: { state: "recorded" },
    });
    expect((await origin.originGit("rev-parse", "main")).trim()).toBe(storyTip);
    expect((await claimedRecord(server)).landing).toMatchObject({
      reference: reporting.reference,
      base: trunkTip,
      revision: storyTip,
      receipt: integrated.landing.receipt.receipt,
    });
    expect(git(workspace, "diff", "--name-only", trunkTip, storyTip)).toBe(
      "story.txt",
    );
  });

  test("an accepted integration whose landing record fails keeps Git acceptance and names the reporting-only retry", async () => {
    const { landingContext, trunkTip, storyTip, workspace, integrate } =
      await claimedLaunchWithStoryCommit(origin, server);
    // The push is accepted while its answer is lost, so nothing is recorded.
    const fault = landingGitFault(origin.machine);
    fault.losePush();
    const lost = await integrate(fault.env);
    expect(lost.ok).toBe(false);
    expect(lost.stderr).toContain("Accepted push response lost");
    const accepted = (await origin.originGit("rev-parse", "main")).trim();
    expect(git(workspace, "rev-parse", `${accepted}^1`)).toBe(trunkTip);
    expect(git(workspace, "rev-parse", `${accepted}^2`)).toBe(storyTip);
    expect((await claimedRecord(server)).landing).toBeUndefined();

    // With the receiver away, the rerun reports the accepted integration and
    // an unacknowledged landing with its retry.
    const port = Number(new URL(server.origin).port);
    await server.close();
    const rerun = await integrate(fault.env);
    expect(rerun.ok, rerun.stderr).toBe(true);
    const unacknowledged = z
      .looseObject({ landing: z.looseObject({ error: z.string() }) })
      .parse(JSON.parse(rerun.stdout));
    expect(unacknowledged).toMatchObject({
      classification: "already-accepted",
      pushCount: 0,
      acceptedSha: accepted,
      landing: { state: "unacknowledged" },
    });
    expect(fault.pushes()).toBe(1);
    const retry = /^Retry reporting only: (.+)$/m.exec(
      unacknowledged.landing.error,
    )?.[1];
    if (retry === undefined) throw new Error("No printed reporting-only retry");
    expect(retry).toContain(path.dirname(landingContext));
    expect(retry).not.toContain(workspace);

    // Once the receiver is back, that retry alone records the pair.
    server = await startDashboardServer({
      mode: "preview",
      prebuilt: builtDashboardDir,
      machine: origin.machine,
      projectFolders: ["open-dough"],
      port,
    });
    const retried = await reportingChild(retry, origin.machine);
    expect(retried.ok, retried.stderr).toBe(true);
    const receipt = landingReceiptSchema.parse(JSON.parse(retried.stdout));
    expect(receipt).toMatchObject({
      state: "recorded",
      base: trunkTip,
      revision: accepted,
    });
    expect((await claimedRecord(server)).landing).toMatchObject({
      base: trunkTip,
      revision: accepted,
      receipt: receipt.receipt,
    });
    expect((await origin.originGit("rev-parse", "main")).trim()).toBe(accepted);
    expect(fault.pushes()).toBe(1);
  });
});
