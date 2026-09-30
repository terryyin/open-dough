// Every page says what a refinement's Start does in a project whose installed
// skill establishes a preparation (../server/preparationStart.ts), on a real
// bare origin (./support/startOrigin.ts) whose `pre-receive` hook holds the
// push. The refinement dialog says Start also publishes the story's Preparing
// announcement to the project's trunk on origin and creates a workspace under
// `.worktrees/`. A page that did not ask for the launch shows "Preparing
// refinement…" on the story's Backlog card while the script runs, then
// "Starting refinement in Claude Code…" while the synthetic `claude` holds the
// session launch (./support/fakeClaude.ts, `held`); the story stays in
// Backlog and nothing is Taken until origin shows the assignment. A project
// whose installed skill lacks the preparation start keeps today's words
// (./agent-launch-start-card.spec.ts).

import { existsSync, chmodSync, writeFileSync } from "node:fs";
import path from "node:path";
import { launch, launchRequest, runningStarts } from "./agentLaunchBoundary.ts";
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

const establishingSentence =
  "Start also publishes this story's Preparing announcement to the project's trunk on origin and creates a workspace under the project folder's .worktrees/; pressing Start authorizes that push.";

const request = {
  ...launchRequest,
  workflow: "refinement",
  identity: queuedIdentity,
  title: "Story A",
};

test("every page says what Start refinement does and its phases, the story staying in Backlog until origin shows the assignment", async ({
  page,
  dashboard,
  origin,
}) => {
  test.setTimeout(120_000);
  const held = path.join(origin.machine, "push-held");
  const released = path.join(origin.machine, "push-released");
  const hook = path.join(origin.origin, "hooks", "pre-receive");
  writeFileSync(
    hook,
    `#!/bin/sh\ntouch ${held}\nwhile [ ! -e ${released} ]; do sleep 0.2; done\n`,
  );
  chmodSync(hook, 0o755);
  dashboard.claudeScenario("held");
  await publishCommittedOrigin(page, {
    repoDir: origin.origin,
    revision: (await origin.originGit("rev-parse", "main")).trim(),
    repository: "terryyin/open-dough",
  });
  const { backlog, taken } = parts(page);
  const backlogCard = backlog.getByRole("article", { name: "Story A" });
  const takenCard = taken.getByRole("article", { name: "Story A" });

  // The dialog says what Start also does.
  await page.goto("/");
  await backlogCard.getByRole("button", { name: "Start refinement" }).click();
  await expect(
    page.getByRole("dialog", { name: "Start refinement in Claude Code" }),
  ).toContainText(establishingSentence);
  await page.keyboard.press("Escape");

  const answered = launch(dashboard, request);

  // The script is running: preparing.
  await expect
    .poll(() => runningStarts(dashboard), { timeout: 20_000 })
    .toEqual([
      {
        workflow: "refinement",
        source: "open-dough",
        identity: queuedIdentity,
        phase: "preparing",
      },
    ]);
  await page.reload();
  await expect(backlogCard).toContainText("Preparing refinement…");
  await expect(takenCard).toHaveCount(0);

  // The preparation was established; Claude Code is launching.
  await expect.poll(() => existsSync(held), { timeout: 20_000 }).toBe(true);
  writeFileSync(released, "");
  await expect
    .poll(() => runningStarts(dashboard), { timeout: 30_000 })
    .toEqual([
      {
        workflow: "refinement",
        source: "open-dough",
        identity: queuedIdentity,
        phase: "launching",
      },
    ]);
  await page.reload();
  await expect(backlogCard).toContainText(
    "Starting refinement in Claude Code…",
  );
  await expect(backlogCard).not.toContainText("Preparing refinement…");
  await expect(takenCard).toHaveCount(0);

  // After the launch the phase is gone.
  dashboard.releaseHeldClaude();
  expect(JSON.parse((await answered).body)).toMatchObject({ kind: "launched" });
  expect(await runningStarts(dashboard)).toEqual([]);
  await page.reload();
  await expect(backlogCard).not.toContainText("Starting refinement");
  await expect(backlogCard).not.toContainText("Preparing refinement");
});
