// A refinement launch whose preparation start stops launches nothing and
// answers "Launch failed:" with why (../server/preparationResult.ts
// `preparationRefusal`), over raw HTTP against the real installed
// `preparation-assignment.mjs` and a real bare origin
// (./support/startOrigin.ts), with the synthetic `claude`: the story not
// queued, every agent name held, a workspace that cannot be selected. Each
// leaves no session and no progress phase. The table's mapping of the
// remaining stop statuses is ./preparation-start-result.spec.ts.

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { execFile } from "node:child_process";
import path from "node:path";
import { promisify } from "node:util";
import { expect, test } from "./support/pageTest.ts";
import { renderAgentProfile } from "../../src/skills/dough-product-backlog/scripts/product-backlog-agent-profile.mjs";
import { launch, launchRequest, runningStarts } from "./agentLaunchBoundary.ts";
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

const exec = promisify(execFile);

const request = {
  ...launchRequest,
  workflow: "refinement",
  identity: queuedIdentity,
  title: queuedTitle,
};

test.describe("refinement preparation start that stops", () => {
  let origin: StartOrigin;
  let server: DashboardServer;

  test.beforeEach(async () => {
    origin = await startOrigin();
    server = await startDashboardServer({
      mode: "preview",
      prebuilt: builtDashboardDir,
      machine: origin.machine,
      projectFolders: ["open-dough"],
      launchTimeoutMs: 30_000,
    });
  });

  test.afterEach(async () => {
    await server.close();
    origin.cleanup();
  });

  async function refused(body: object): Promise<string> {
    server.claudeScenario("launched");
    const response = await launch(server, body);
    const answer = JSON.parse(response.body) as {
      kind: string;
      reason: string;
      explanation: string;
    };
    expect(answer, response.body).toMatchObject({
      kind: "failed",
      reason: "start-refused",
    });
    expect(server.claudeLaunchCalls()).toEqual([]);
    expect(await runningStarts(server)).toEqual([]);
    return answer.explanation;
  }

  // The stop leaves no workspace and no branch of this launch behind.
  async function expectNoWorkspaceLeft(): Promise<void> {
    const worktrees = path.join(origin.project, ".worktrees");
    expect(existsSync(path.join(worktrees, "prepare-the-queued-start"))).toBe(
      false,
    );
    const { stdout } = await exec("git", ["branch", "--list", "claude/*"], {
      cwd: origin.project,
    });
    expect(stdout.trim()).toBe("");
    const listed = await exec("git", ["worktree", "list", "--porcelain"], {
      cwd: origin.project,
    });
    expect(listed.stdout).not.toContain("prepare-the-queued-start");
    // The kept start goes with the workspace: nothing was assigned to resume.
    const store = path.join(
      origin.machine,
      "home/.open-dough/dashboard/refinement-starts.json",
    );
    const kept = existsSync(store)
      ? (JSON.parse(readFileSync(store, "utf8")) as Record<string, object>)
      : {};
    expect(Object.values(kept["open-dough"] ?? {})).toEqual([]);
  }

  test("a story not queued in Backlog is not started and makes no workspace", async () => {
    expect(await refused({ ...request, identity: "SEED-A#not-queued" })).toBe(
      "The story is not queued in Backlog on origin, so it cannot be started. Nothing was launched.",
    );
    expect(await origin.takenProfiles()).toEqual([]);
    expect(existsSync(path.join(origin.project, ".worktrees"))).toBe(false);
    await expectNoWorkspaceLeft();
  });

  test("every agent name held stops and lists the holders", async () => {
    const { agentNames } =
      await import("../../src/skills/dough-product-backlog/scripts/product-backlog-agent-profile.mjs");
    const agents = path.join(origin.project, ".planning", "agents");
    mkdirSync(agents, { recursive: true });
    for (const name of agentNames) {
      writeFileSync(
        path.join(agents, `${name.toLowerCase()}-chan.json`),
        renderAgentProfile({
          name,
          identity: "SEED-B#b",
          activity: "preparation",
        }),
      );
    }
    await exec("git", ["add", "."], { cwd: origin.project });
    await exec("git", ["commit", "-m", "hold every name"], {
      cwd: origin.project,
    });
    await exec("git", ["push", "origin", "main"], { cwd: origin.project });
    const held = await origin.takenProfiles();

    const explanation = await refused(request);
    expect(explanation).toBe(
      `Every agent name is held on origin (${agentNames
        .map((name) => `${name}-chan`)
        .sort()
        .join(
          ", ",
        )}), so no agent is free to prepare the story. Nothing was launched.`,
    );
    expect(await origin.takenProfiles()).toEqual(held);
    await expectNoWorkspaceLeft();
  });

  test("a workspace that cannot be created is not used", async () => {
    // A file where the worktrees folder belongs: Git cannot add a worktree.
    writeFileSync(path.join(origin.project, ".worktrees"), "in the way\n");
    const explanation = await refused(request);
    expect(explanation).toMatch(
      /^The workspace could not be set up: .+\. Nothing was launched\.$/s,
    );
    expect(await origin.takenProfiles()).toEqual([]);
    await expectNoWorkspaceLeft();
  });
});
