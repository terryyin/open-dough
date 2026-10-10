// A claimed Story Branch Mode execution launch carries the landing capture a
// one-shot launch does (../server/completionReporting.ts), over raw HTTP
// against the real installed `execution-start.mjs` and a real bare origin
// (./support/startOrigin.ts) with the synthetic `claude`: the kept record
// names the landing context, the attempt holds the capture authority, and the
// instruction's reporting block tells the session where to supply it.

import { readFileSync } from "node:fs";
import path from "node:path";
import { expect, test } from "./support/pageTest.ts";
import { keptAttempts } from "./acceptedAttempts.ts";
import type { DashboardServer } from "./support/dashboardServer.ts";
import { git } from "./support/oneShotLanding.ts";
import { slug, startPreview } from "./support/oneShotLaunch.ts";
import { expectReportingBlock } from "./support/reportingInputAssertions.ts";
import {
  queuedIdentity,
  startOrigin,
  type StartOrigin,
} from "./support/startOrigin.ts";
import { claimedStoryBranchLaunch } from "./support/storyBranchIntegration.ts";

test.describe("a claimed Story Branch Mode execution launch", () => {
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

  test("carries the landing context, the capture authority, and the instruction to supply it", async () => {
    const { record, start, reporting, landingContext } =
      await claimedStoryBranchLaunch(server);
    const workspace = path.join(origin.project, ".worktrees", slug);
    const branch = `claude/${slug}`;
    expect(start).toMatchObject({
      identity: queuedIdentity,
      workspace,
      branch,
      mode: "story-branch",
      remote: "origin",
      target: "main",
    });

    // The kept record names the context file, which names the launch and its
    // trunk target.
    expect(JSON.parse(readFileSync(landingContext, "utf8"))).toEqual({
      origin: server.origin,
      source: "open-dough",
      host: "claude",
      reference: reporting.reference,
      identity: queuedIdentity,
      remote: "origin",
      target: "refs/heads/main",
    });

    // The attempt holds the capture authority: the project's own repository,
    // which outlives the worktree.
    expect(
      keptAttempts(server).find((entry) => entry.id === reporting.reference)
        ?.landingRepository,
    ).toEqual({
      repository: git(
        origin.project,
        "rev-parse",
        "--path-format=absolute",
        "--git-common-dir",
      ),
      workspace,
      branch,
      identity: queuedIdentity,
      remote: "origin",
      target: "refs/heads/main",
    });

    // The session is told to supply the context where its work lands on trunk.
    const instruction = server.claudeLaunchCalls()[0]?.argv.at(-1) ?? "";
    const [, , block] = instruction.split("\n\n");
    expectReportingBlock(block, record.request, server);
  });
});
