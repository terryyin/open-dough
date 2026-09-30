// An execution launch whose start cannot be established launches nothing and
// answers "Launch failed:" with why (../server/executionStart.ts `refusal`),
// over raw HTTP against the real installed `execution-start.mjs` and a real
// bare origin (./support/startOrigin.ts): the story Taken by another agent,
// the story not queued, an installed start command that gives no readable
// result. The project whose origin is not the catalog repository is in
// ./agent-launch-start.spec.ts; the table's mapping of the remaining stop
// statuses is ./execution-start-result.spec.ts.

import { writeFileSync } from "node:fs";
import path from "node:path";
import { expect, test } from "@playwright/test";
import { launch, launchRequest, recordsOf } from "./agentLaunchBoundary.ts";
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

test.describe("execution start that cannot be established", () => {
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
    expect(server.claudeCalls()).toEqual([]);
    expect(await recordsOf(server, "open-dough")).toEqual([]);
    return answer.explanation;
  }

  test("a story Taken by another agent names its owner", async () => {
    const owner = await origin.takenByAnotherAgent();
    expect(owner).not.toBe("undefined");
    expect(await refused(request)).toBe(
      `Taken by ${owner}, so this dashboard did not start it. Nothing was launched.`,
    );
    expect(await origin.takenProfiles()).toHaveLength(1);
  });

  test("a story not queued in Backlog is not started", async () => {
    expect(await refused({ ...request, identity: "SEED-A#not-queued" })).toBe(
      "The story is not queued in Backlog on origin, so it cannot be started. Nothing was launched.",
    );
    expect(await origin.takenProfiles()).toEqual([]);
  });

  test("an installed start command that gives no readable result is not trusted", async () => {
    writeFileSync(
      path.join(
        origin.project,
        ".claude/skills/dough-execute-plan/scripts/execution-start.mjs",
      ),
      'process.stdout.write("not json\\n");\n',
    );
    expect(await refused(request)).toBe(
      "The start command gave no result this dashboard could read, so the story may or may not be Taken. Workspace ~/git/open-dough/.worktrees/prepare-the-queued-start on branch claude/prepare-the-queued-start. The start was kept; pressing Start again resumes it. Nothing was launched.",
    );
    expect(await origin.takenProfiles()).toEqual([]);
  });
});
