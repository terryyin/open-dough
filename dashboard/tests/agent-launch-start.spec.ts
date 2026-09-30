// An execution launch establishes its start before the session
// (../server/executionStart.ts), over raw HTTP against the real installed
// `execution-start.mjs` and a real bare origin (./support/startOrigin.ts),
// with the synthetic `claude`: origin ends up holding the Taken profile that
// names host claude and the chosen model (none on Default), the session
// starts in the new workspace under the project's `.worktrees/` with the
// established start in its instruction, and the kept record has the start.
// The workspace and result rules themselves are ./claude-workspace.spec.ts
// and ./execution-start-result.spec.ts.

import { existsSync, realpathSync, rmSync } from "node:fs";
import path from "node:path";
import { expect, test } from "@playwright/test";
import {
  establishingProjects,
  launch,
  launchRequest,
  recordsOf,
} from "./agentLaunchBoundary.ts";
import {
  builtDashboardDir,
  startDashboardServer,
  type DashboardServer,
} from "./support/dashboardServer.ts";
import {
  queuedIdentity,
  queuedTitle,
  startOrigin,
  type StartOrigin,
} from "./support/startOrigin.ts";

const request = {
  ...launchRequest,
  identity: queuedIdentity,
  title: queuedTitle,
};
const slug = "prepare-the-queued-start";

for (const model of ["opus", undefined] as const) {
  test.describe(`execution start (${model ?? "Default"} model)`, () => {
    let origin: StartOrigin;
    let server: DashboardServer;

    test.beforeAll(async () => {
      origin = await startOrigin();
      server = await startDashboardServer({
        mode: "preview",
        prebuilt: builtDashboardDir,
        machine: origin.machine,
        projectFolders: ["open-dough"],
        launchTimeoutMs: 30_000,
      });
    });

    test.afterAll(async () => {
      await server.close();
      origin.cleanup();
    });

    test("publishes the Take, opens the session in the workspace with the start, and keeps it", async () => {
      server.claudeScenario("launched");
      const response = await launch(server, { ...request, model });
      const answer = JSON.parse(response.body) as {
        kind: string;
        record: { start?: Record<string, unknown> };
      };
      expect(answer.kind, response.body).toBe("launched");

      // Origin holds the Taken profile, naming host claude and the model.
      const profiles = await origin.takenProfiles();
      expect(profiles).toHaveLength(1);
      expect(profiles[0]).toMatchObject({
        identity: queuedIdentity,
        host: "claude",
        mode: "story-branch",
        branch: `claude/${slug}`,
      });
      expect("model" in (profiles[0] ?? {})).toBe(model !== undefined);
      expect(profiles[0]?.["model"]).toBe(model);

      // The session starts in the workspace, carrying the established start.
      const workspace = path.join(origin.project, ".worktrees", slug);
      const publishedSha = (await origin.originGit("rev-parse", "main")).trim();
      const [call] = server.claudeLaunchCalls();
      expect(call?.cwd).toBe(realpathSync(workspace));
      const instruction = call?.argv.at(-1) ?? "";
      expect(call?.argv.slice(0, 3)).toEqual([
        "--bg",
        "--name",
        `Open Dough · Execution · ${queuedTitle}`,
      ]);
      expect(call?.argv.includes("--model")).toBe(model !== undefined);
      expect(call?.argv.at(model === undefined ? 3 : 4)).toBe(
        model === undefined ? instruction : model,
      );
      expect(instruction.split("\n\n")[0]).toBe(
        `/dough-execute-plan ${queuedIdentity}`,
      );
      const lines = instruction.split("\n");
      expect(lines.slice(2, 4)).toEqual([
        "Established start:",
        `- identity: ${queuedIdentity}`,
      ]);
      expect(lines[4]).toMatch(/^- publisher ID: dashboard-.+-open-dough$/);
      for (const line of [
        `- workspace: ${workspace}`,
        `- branch: claude/${slug}`,
        "- mode: story-branch",
        "- remote: origin",
        "- target: main",
        `- publishedSha: ${publishedSha}`,
      ]) {
        expect(lines).toContain(line);
      }

      // The launch record keeps the start, and the machine's sessions answer it.
      expect(answer.record.start).toMatchObject({
        identity: queuedIdentity,
        workspace,
        branch: `claude/${slug}`,
        mode: "story-branch",
        remote: "origin",
        target: "main",
        publishedSha,
      });
      const kept = (await recordsOf(server, "open-dough")) as {
        start?: unknown;
      }[];
      expect(kept).toHaveLength(1);
      expect(kept[0]?.start).toEqual(answer.record.start);
    });
  });
}

test.describe("execution start of a project whose origin is not the catalog repository", () => {
  let origin: StartOrigin;
  let server: DashboardServer;

  test.beforeAll(async () => {
    origin = await startOrigin("someone/else");
    server = await startDashboardServer({
      mode: "preview",
      prebuilt: builtDashboardDir,
      machine: origin.machine,
      projectFolders: ["open-dough"],
      launchTimeoutMs: 30_000,
    });
  });

  test.afterAll(async () => {
    await server.close();
    origin.cleanup();
  });

  test("starts nothing and launches nothing", async () => {
    const response = await launch(server, request);
    expect(JSON.parse(response.body)).toMatchObject({
      kind: "failed",
      reason: "start-refused",
      explanation:
        "The origin of ~/git/open-dough is not terryyin/open-dough, where the Take would be published. Nothing was started or launched.",
    });
    expect(server.claudeCalls()).toEqual([]);
    expect(await origin.takenProfiles()).toEqual([]);
    expect(await recordsOf(server, "open-dough")).toEqual([]);
  });
});

test.describe("execution start of a project whose installed skill cannot continue from a start", () => {
  let origin: StartOrigin;
  let server: DashboardServer;

  test.beforeAll(async () => {
    origin = await startOrigin();
    server = await startDashboardServer({
      mode: "preview",
      prebuilt: builtDashboardDir,
      machine: origin.machine,
      projectFolders: ["open-dough"],
      launchTimeoutMs: 30_000,
    });
  });

  test.afterAll(async () => {
    await server.close();
    origin.cleanup();
  });

  test("launches as before, in the project folder, with no Take and no workspace", async () => {
    // The folder that ships the formatter is a project that establishes a start.
    expect(await establishingProjects(server)).toEqual(["open-dough"]);

    // An installed skill that predates the handoff does not.
    rmSync(
      path.join(
        origin.project,
        ".claude/skills/dough-execute-plan/scripts/established-start.mjs",
      ),
    );
    expect(await establishingProjects(server)).toEqual([]);

    server.claudeScenario("launched");
    const response = await launch(server, request);
    const answer = JSON.parse(response.body) as {
      kind: string;
      record: { start?: unknown };
    };
    expect(answer.kind, response.body).toBe("launched");

    expect(await origin.takenProfiles()).toEqual([]);
    expect(existsSync(path.join(origin.project, ".worktrees"))).toBe(false);
    const [call] = server.claudeLaunchCalls();
    expect(call?.cwd).toBe(realpathSync(origin.project));
    expect(call?.argv.at(-1)).toBe(`/dough-execute-plan ${queuedIdentity}`);
    expect(answer.record.start).toBeUndefined();
  });
});
