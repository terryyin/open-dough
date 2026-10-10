// A claimed Story Branch Mode launch whose published story tip conflicts with
// fetched trunk: the installed `history-preserving-publication.mjs integrate`
// preserves the stopped merge, and once that merge is resolved and committed
// in the launch's worktree the same command publishes it and the real receiver
// records the fetched trunk tip and that merge on the launch record. Raw HTTP
// against the real installed start and a real bare origin
// (./support/startOrigin.ts) with the synthetic `claude`.

import { execFileSync } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { z } from "zod";
import { expect, test } from "./support/pageTest.ts";
import { quote } from "./support/completionRecovery.ts";
import type { DashboardServer } from "./support/dashboardServer.ts";
import { capturedPublicationSchema, git } from "./support/oneShotLanding.ts";
import { startPreview } from "./support/oneShotLaunch.ts";
import { startOrigin, type StartOrigin } from "./support/startOrigin.ts";
import {
  anotherWriterClone,
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

const shared = (checkout: string, body: string) => {
  writeFileSync(path.join(checkout, "shared.txt"), body);
};
const storyChangesShared = (checkout: string) => {
  shared(checkout, "story\n");
  git(checkout, "add", "shared.txt");
  git(checkout, "commit", "-m", "Story shared.txt");
};
const resolveMerge = (workspace: string) => {
  shared(workspace, "story and trunk\n");
  git(workspace, "add", "shared.txt");
  git(workspace, "commit", "--no-edit");
  return git(workspace, "rev-parse", "HEAD");
};

// A `git` whose first push lets another writer's conflicting trunk commit
// land first, so that push is rejected.
function racingTrunkWriter(origin: StartOrigin) {
  const { machine } = origin;
  const writer = anotherWriterClone(origin, "racing");
  shared(writer, "trunk\n");
  git(writer, "add", "shared.txt");
  git(writer, "commit", "-m", "Trunk shared.txt");
  const actual = execFileSync("which", ["git"], { encoding: "utf8" }).trim();
  const bin = path.join(machine, "racing-git-bin");
  mkdirSync(bin);
  const armed = path.join(machine, "racing-armed");
  writeFileSync(armed, "armed\n");
  writeFileSync(
    path.join(bin, "git"),
    `#!/bin/sh
if [ "$1" = push ] && [ -f ${quote(armed)} ]; then
 rm ${quote(armed)}
 ${quote(actual)} -C ${quote(writer)} push --quiet origin HEAD:refs/heads/main || exit $?
fi
exec ${quote(actual)} "$@"
`,
    { mode: 0o755 },
  );
  return {
    tip: git(writer, "rev-parse", "HEAD"),
    env: { ...process.env, PATH: `${bin}:${process.env["PATH"] ?? ""}` },
  };
}

test("a conflicted trunk integration is preserved, and its resolved merge is published and recorded as the launch's landing", async () => {
  const { reporting, workspace, branch, trunkTip, storyTip, ...story } =
    await claimedLaunchWithStoryCommit(origin, server, true, {
      storyWork: storyChangesShared,
      trunkWork: (writer) => {
        shared(writer, "trunk\n");
      },
    });

  // The conflict stops the integration with the merge left in the worktree.
  const stopped = await story.integrate();
  expect((stopped as { code?: unknown }).code, stopped.stderr).toBe(1);
  expect(JSON.parse(stopped.stdout)).toMatchObject({
    classification: "preserved",
    reason: "conflict",
    conflictedPaths: ["shared.txt"],
    pushCount: 0,
    receipt: null,
  });
  expect(git(workspace, "rev-parse", "HEAD")).toBe(trunkTip);
  expect(git(workspace, "rev-parse", "MERGE_HEAD")).toBe(storyTip);
  expect(git(workspace, "status", "--porcelain")).toContain("AA shared.txt");
  expect((await origin.originGit("rev-parse", "main")).trim()).toBe(trunkTip);
  const untouched = await claimedRecord(server);
  expect(untouched.landing).toBeUndefined();
  expect(untouched.landingReporting?.preparations).toEqual([]);

  // The agent resolves and commits the merge; the same command publishes it.
  const resolved = resolveMerge(workspace);
  const integrated = capturedPublicationSchema.parse(await story.integrated());
  expect(integrated).toMatchObject({
    classification: "published",
    pushCount: 1,
    receipt: { sha: resolved, target: "refs/heads/main" },
    landing: { state: "recorded" },
  });
  expect((await origin.originGit("rev-parse", "main")).trim()).toBe(resolved);
  expect(git(workspace, "rev-parse", `${resolved}^1`)).toBe(trunkTip);
  expect(git(workspace, "rev-parse", `${resolved}^2`)).toBe(storyTip);
  expect(git(workspace, "branch", "--show-current")).toBe(branch);

  const receipt = integrated.landing.receipt;
  expect(receipt).toMatchObject({
    state: "recorded",
    reference: reporting.reference,
    base: trunkTip,
    revision: resolved,
  });
  const landed = await claimedRecord(server);
  expect(landed.landing).toMatchObject({
    reference: reporting.reference,
    remote: "origin",
    target: "refs/heads/main",
    base: trunkTip,
    revision: resolved,
    receipt: receipt.receipt,
  });
  // The one pair retained before the push is the resolved merge's.
  expect(landed.landingReporting?.preparations).toHaveLength(1);
  expect(landed.landingReporting?.preparations[0]).toMatchObject({
    delivery: receipt.delivery,
    base: trunkTip,
    revision: resolved,
  });
  expect(
    git(workspace, "show", `${resolved}:shared.txt`),
    "the published merge holds the resolution",
  ).toBe("story and trunk");
});

test("a pair retained before a rejected push gives way to the resolved merge's pair, which is the one recorded", async () => {
  const { workspace, trunkTip, ...story } = await claimedLaunchWithStoryCommit(
    origin,
    server,
    true,
    { storyWork: storyChangesShared },
  );
  const racing = racingTrunkWriter(origin);

  // The clean merge is retained, its push is rejected, and the merge computed
  // again on the racing tip stops on the conflict.
  const stopped = await story.integrate(racing.env);
  expect((stopped as { code?: unknown }).code, stopped.stderr).toBe(1);
  const preserved = z
    .looseObject({ supersededSha: z.string() })
    .parse(JSON.parse(stopped.stdout));
  expect(preserved).toMatchObject({
    classification: "preserved",
    reason: "conflict",
    conflictedPaths: ["shared.txt"],
    rejectedPushCount: 1,
    pushCount: 0,
  });
  expect(git(workspace, "rev-parse", "HEAD")).toBe(racing.tip);
  expect((await origin.originGit("rev-parse", "main")).trim()).toBe(racing.tip);
  const retained = await claimedRecord(server);
  expect(retained.landing).toBeUndefined();
  expect(retained.landingReporting?.preparations).toMatchObject([
    { base: trunkTip, revision: preserved.supersededSha },
  ]);

  const resolved = resolveMerge(workspace);
  const integrated = capturedPublicationSchema.parse(await story.integrated());
  expect(integrated).toMatchObject({
    classification: "published",
    receipt: { sha: resolved },
    landing: { state: "recorded" },
  });
  const landed = await claimedRecord(server);
  expect(landed.landing).toMatchObject({
    base: racing.tip,
    revision: resolved,
    receipt: integrated.landing.receipt.receipt,
  });
  expect(landed.landingReporting?.preparations).toMatchObject([
    { base: trunkTip, revision: preserved.supersededSha },
    { base: racing.tip, revision: resolved },
  ]);
});
