// Every page shows a running start's phase (../server/startProgress.ts,
// ../src/CardLaunches.tsx). A launch asked over raw HTTP runs the real
// installed `execution-start.mjs` against a real bare origin
// (./support/startOrigin.ts) whose `pre-receive` hook holds the push: the
// machine's sessions name the running start's project, identity, and phase
// `preparing`, and a page that did not ask for the launch shows "Preparing
// execution…" on the story's Backlog card, the story still in Backlog and
// nothing Taken. Once the push goes through, the synthetic `claude` holds the
// session launch (./support/fakeClaude.ts, `held`): the phase is `launching`,
// which the card says as "Starting execution in Claude Code…". After the
// launch the phase is gone and the session shows. A stored start whose
// process ended (the server that ran it is gone) reads as a kept start, never
// as running.

import { readFileSync } from "node:fs";
import path from "node:path";
import {
  keptStarts,
  launch,
  launchRequest,
  runningStarts,
} from "./agentLaunchBoundary.ts";
import { publishCommittedOrigin } from "./committedOrigin.ts";
import { expect, test as base } from "./dashboardTest.ts";
import { parts } from "./dashboardPage.ts";
import {
  builtDashboardDir,
  startDashboardServer,
} from "./support/dashboardServer.ts";
import {
  queuedIdentity,
  startOrigin,
  type StartOrigin,
} from "./support/startOrigin.ts";

const test = base.extend<{ origin: StartOrigin }>({
  // eslint-disable-next-line no-empty-pattern
  origin: async ({}, use) => {
    const origin = await startOrigin();
    await use(origin);
    origin.cleanup();
  },
  dashboard: async ({ github, origin }, use) => {
    const server = await startDashboardServer({
      mode: "preview",
      prebuilt: builtDashboardDir,
      github,
      machine: origin.machine,
      projectFolders: ["open-dough"],
      launchTimeoutMs: 60_000,
    });
    await use(server);
    await server.close();
  },
});

const request = {
  ...launchRequest,
  identity: queuedIdentity,
  title: "Story A",
};
const workspaceShown = "~/git/open-dough/.worktrees/story-a";

test("a page that did not ask for the launch shows a running start's phase, then the session", async ({
  page,
  dashboard,
  origin,
}) => {
  test.setTimeout(120_000);
  const push = origin.holdPushes();
  dashboard.claudeScenario("held");
  await publishCommittedOrigin(page, {
    repoDir: origin.origin,
    revision: (await origin.originGit("rev-parse", "main")).trim(),
    repository: "terryyin/open-dough",
  });
  const { backlog, taken } = parts(page);
  const backlogCard = backlog.getByRole("article", { name: "Story A" });
  const takenCard = taken.getByRole("article", { name: "Story A" });

  expect(await runningStarts(dashboard)).toEqual([]);
  const answered = launch(dashboard, request);

  // The script is running: preparing.
  await expect
    .poll(() => runningStarts(dashboard), { timeout: 20_000 })
    .toEqual([
      {
        workflow: "execution",
        source: "open-dough",
        identity: queuedIdentity,
        phase: "preparing",
      },
    ]);
  // Running, not merely kept: no kept start is named.
  expect(await keptStarts(dashboard)).toEqual([]);
  await page.goto("/");
  await expect(backlogCard).toContainText("Preparing execution…");
  await expect(takenCard).toHaveCount(0);

  // The script established the start; Claude Code is launching.
  await expect.poll(() => push.isHeld(), { timeout: 20_000 }).toBe(true);
  push.release();
  await expect
    .poll(() => runningStarts(dashboard), { timeout: 30_000 })
    .toEqual([
      {
        workflow: "execution",
        source: "open-dough",
        identity: queuedIdentity,
        phase: "launching",
      },
    ]);
  await page.reload();
  await expect(backlogCard).toContainText("Starting execution in Claude Code…");
  await expect(backlogCard).not.toContainText("Preparing execution…");
  await expect(takenCard).toHaveCount(0);

  // After the launch the phase is gone and the session shows.
  dashboard.releaseHeldClaude();
  expect(JSON.parse((await answered).body)).toMatchObject({ kind: "launched" });
  expect(await runningStarts(dashboard)).toEqual([]);
  await page.reload();
  await expect(
    backlogCard.getByRole("list", { name: "Sessions" }),
  ).toContainText(`Workspace ${workspaceShown}`);
  await expect(backlogCard).not.toContainText("Starting execution");
  await expect(backlogCard).not.toContainText("Preparing execution");
});

test("a start kept in the store with no running process is kept, never running", async ({
  dashboard,
  origin,
}) => {
  dashboard.claudeScenario("refused");
  const failed = JSON.parse((await launch(dashboard, request)).body) as {
    kind: string;
  };
  expect(failed.kind).toBe("failed");
  const stored = JSON.parse(
    readFileSync(
      path.join(
        origin.machine,
        "home/.open-dough/dashboard/execution-starts.json",
      ),
      "utf8",
    ),
  ) as Record<string, Record<string, unknown>>;
  expect(Object.keys(stored["open-dough"] ?? {})).toEqual([queuedIdentity]);
  expect(await runningStarts(dashboard)).toEqual([]);
  expect(await keptStarts(dashboard)).toEqual([
    expect.objectContaining({ identity: queuedIdentity }),
  ]);
});
