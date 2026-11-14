// A claimed Story Branch Mode execution launch carries the landing capture a
// one-shot launch does (../../server/completionReporting.ts), over raw HTTP
// against the real installed `execution-start.mjs` and a real bare origin
// (../../tests/support/startOrigin.ts) with the synthetic `claude`: the kept record
// names the landing context, the attempt holds the capture authority, and the
// instruction's reporting block tells the session where to supply it.

import { queuedReadyRepository } from "../../../Distribution/tests/support/queued-repository.mjs";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { expect, test } from "../../tests/support/pageTest.ts";
import { keptAttempts } from "../../tests/acceptedAttempts.ts";
import type { DashboardServer } from "../../tests/support/dashboardServer.ts";
import { git } from "../../tests/support/launchLanding.ts";
import { slug, startBoundary } from "../../tests/support/launchDashboard.ts";
import { expectReportingBlock } from "../../tests/support/reportingInputAssertions.ts";
import {
  queuedIdentity,
  startOrigin,
  type StartOrigin,
} from "../../tests/support/startOrigin.ts";
import { claimedStoryBranchLaunch } from "../../tests/support/storyBranchIntegration.ts";
import {
  firstLandingExpectationPath,
  openFirstLandingExpectation,
} from "../../../Distribution/src/skills/dough-execute-plan/scripts/first-landing-expectation.mjs";

test.describe("a claimed Story Branch Mode execution launch", () => {
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
    const repository = git(
      origin.project,
      "rev-parse",
      "--path-format=absolute",
      "--git-common-dir",
    );
    expect(
      keptAttempts(server).find((entry) => entry.id === reporting.reference)
        ?.landingRepository,
    ).toEqual({
      repository,
      workspace,
      branch,
      identity: queuedIdentity,
      remote: "origin",
      target: "refs/heads/main",
    });

    // Reporting preparation planted a durable first-landing expectation beside
    // that management context, keyed to this workspace/branch — not in the tree.
    await expect(
      openFirstLandingExpectation({ repository, workspace, branch }),
    ).resolves.toEqual({
      workspace,
      branch,
      landingContext,
    });
    expect(
      existsSync(firstLandingExpectationPath(repository, workspace, branch)),
    ).toBe(true);
    expect(readdirSync(workspace).includes("open-dough")).toBe(false);
    expect(
      existsSync(path.join(workspace, "first-landing-expectation.json")),
    ).toBe(false);

    // The session is told which publication takes the context: the one that
    // first lands its work on trunk.
    const instruction = server.claudeLaunchCalls()[0]?.argv.at(-1) ?? "";
    const [, , block] = instruction.split("\n\n");
    expectReportingBlock(block, record.request, server);
  });
});
