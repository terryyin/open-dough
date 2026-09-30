// A refinement launch establishes its preparation before the session
// (../server/preparationStart.ts), over raw HTTP against the real installed
// `preparation-assignment.mjs` and a real bare origin
// (./support/startOrigin.ts), with the synthetic `claude`: origin ends up
// holding the Preparing profile (host claude, the chosen model, no Taken
// profile), and the session starts in the new workspace under the project's
// `.worktrees/` with the established preparation in its instruction. A
// project whose installed skill lacks the start or formatter launches as
// before.

import { existsSync, realpathSync, rmSync } from "node:fs";
import path from "node:path";
import { expect, test } from "@playwright/test";
import { launch, launchRequest } from "./agentLaunchBoundary.ts";
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
  workflow: "refinement",
  identity: queuedIdentity,
  title: queuedTitle,
  instruction: "Focus on the examples.",
};
const slug = "prepare-the-queued-start";

// The profiles origin's trunk holds for one kind of activity.
async function profilesOf(
  origin: StartOrigin,
  activity: string,
): Promise<Record<string, unknown>[]> {
  return (await origin.takenProfiles()).filter(
    (profile) => profile["activity"] === activity,
  );
}

for (const model of ["opus", undefined] as const) {
  test.describe(`refinement preparation start (${model ?? "Default"} model)`, () => {
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

    test("publishes Preparing and opens the session in the workspace with the block", async () => {
      server.claudeScenario("launched");
      const response = await launch(server, { ...request, model });
      expect(JSON.parse(response.body), response.body).toMatchObject({
        kind: "launched",
      });

      const preparing = await profilesOf(origin, "preparation");
      expect(preparing).toHaveLength(1);
      expect(preparing[0]).toMatchObject({
        identity: queuedIdentity,
        host: "claude",
      });
      expect(preparing[0]?.["model"]).toBe(model);
      expect(await profilesOf(origin, "execution")).toEqual([]);

      const workspace = path.join(origin.project, ".worktrees", slug);
      const publishedSha = (await origin.originGit("rev-parse", "main")).trim();
      const [call] = server.claudeLaunchCalls();
      expect(call?.cwd).toBe(realpathSync(workspace));
      const instruction = call?.argv.at(-1) ?? "";
      const [skill, block, developer] = instruction.split("\n\n");
      expect(skill).toBe(`/dough-story-refinement ${queuedIdentity}`);
      expect(developer).toBe("Focus on the examples.");
      const lines = (block ?? "").split("\n");
      expect(lines.slice(0, 2)).toEqual([
        "Established preparation:",
        `- identity: ${queuedIdentity}`,
      ]);
      for (const line of [
        `- workspace: ${workspace}`,
        `- branch: claude/${slug}`,
        "- remote: origin",
        "- target: main",
        `- publishedSha: ${publishedSha}`,
        `- integration checkout: ${origin.project}`,
      ]) {
        expect(lines).toContain(line);
      }
    });
  });
}

test.describe("refinement of a project whose installed skill lacks the preparation formatter", () => {
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

  test("launches as before, in the project folder, with no workspace and no profile", async () => {
    rmSync(
      path.join(
        origin.project,
        ".claude/skills/dough-story-refinement/scripts/established-preparation.mjs",
      ),
    );
    server.claudeScenario("launched");
    const response = await launch(server, request);
    expect(JSON.parse(response.body), response.body).toMatchObject({
      kind: "launched",
    });

    expect(await origin.takenProfiles()).toEqual([]);
    expect(existsSync(path.join(origin.project, ".worktrees"))).toBe(false);
    const [call] = server.claudeLaunchCalls();
    expect(call?.cwd).toBe(realpathSync(origin.project));
    expect(call?.argv.at(-1)).toBe(
      `/dough-story-refinement ${queuedIdentity}\n\nFocus on the examples.`,
    );
  });
});
