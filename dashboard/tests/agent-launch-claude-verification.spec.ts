// A Backlog card's Claude Code launch whose answer did not come within the
// launch wait, settled by Recheck under Startup recovery
// (../server/launchVerification.ts): Claude Code's own session listing is
// read once, and the one session it lists with the launch's name, started in
// its folder since the launch was accepted and held by no other launch
// record, is recorded as the launch's; a readable listing with none settles
// it as not launched. An unreadable listing, or two such sessions, keep the
// story protected with why. Recheck never launches again; the synthetic
// `claude` (./fixtures/fake-claude) stands in for Claude Code.

import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import type { Page } from "@playwright/test";
import { accept, attempts, launchRequest } from "./agentLaunchBoundary.ts";
import { cardSessions } from "./dashboardPage.ts";
import { expect, test } from "./dashboardTest.ts";
import { openTakenBacklog } from "./launchCardPage.ts";
import {
  publishLaunchJourney,
  readyStory,
  type LaunchJourney,
} from "./launchJourney.ts";
import type { DashboardServer } from "./support/dashboardServer.ts";
import { identityB } from "../../src/skills/dough-execute-plan/scripts/workspace-publication-fixtures.mjs";

let journey: LaunchJourney;
test.beforeAll(async () => {
  test.setTimeout(120_000);
  journey = await publishLaunchJourney();
});
test.afterAll(() => (journey as LaunchJourney | undefined)?.cleanup());

test.use({ projectFolders: ["open-dough"], launchTimeoutMs: 3_000 });

const subject = `${readyStory} (${identityB})`;
const storyRequest = {
  source: "open-dough",
  identity: identityB,
  title: readyStory,
  workflow: "execution",
  host: "claude",
};
const recoveryOf = (page: Page) =>
  page.getByRole("region", { name: "Startup recovery" });

const answerKind = async (response: Promise<{ body: string }>) =>
  (JSON.parse((await response).body) as { kind: string; reason?: string }).kind;

// Starts Story B's execution from its card and waits until its launch
// settled uncertain: what the card, the start and the launch call are.
async function uncertainLaunch(page: Page, dashboard: DashboardServer) {
  const opened = await openTakenBacklog(page, journey);
  await opened.start(readyStory).click();
  await opened.dialog.getByRole("button", { name: "Start" }).click();
  await expect
    .poll(async () => (await attempts(dashboard))[0]?.outcome?.kind, {
      timeout: 30_000,
    })
    .toBe("uncertain");
  const [call] = dashboard.claudeLaunchCalls();
  const argv = call?.argv ?? [];
  const [attempt] = await attempts(dashboard);
  await expect(
    recoveryOf(page).getByRole("button", { name: `Recheck ${subject}` }),
  ).toBeEnabled();
  return {
    card: opened.card(readyStory),
    start: opened.start(readyStory),
    name: argv[argv.indexOf("--name") + 1] ?? "",
    cwd: call?.cwd ?? "",
    acceptedAt: Date.parse(attempt?.acceptedAt ?? ""),
  };
}

// Keeps a launch record of another story holding the listed `sessionId`.
function recordHolding(dashboard: DashboardServer, sessionId: string) {
  const file = path.join(
    dashboard.home,
    ".open-dough",
    "dashboard",
    "agent-launches.json",
  );
  mkdirSync(path.dirname(file), { recursive: true });
  let kept: Record<string, unknown[]> = {};
  try {
    kept = JSON.parse(readFileSync(file, "utf8")) as typeof kept;
  } catch {
    // None kept yet.
  }
  kept["open-dough"] = [
    ...(kept["open-dough"] ?? []),
    {
      request: launchRequest,
      session: {
        host: "claude",
        sessionId,
        shortId: sessionId.slice(0, 8),
        name: "another launch",
      },
      launchedAt: new Date().toISOString(),
    },
  ];
  writeFileSync(file, JSON.stringify(kept));
}

test("Recheck records the one session the uncertain launch started, and the card lists it with its actions back", async ({
  page,
  dashboard,
}) => {
  test.setTimeout(90_000);
  dashboard.claudeScenario("launched-hang");
  const { card, start } = await uncertainLaunch(page, dashboard);
  const [listed] = dashboard.claudeListing();
  await expect(card).toContainText("Startup needs reconciliation");
  expect(await answerKind(accept(dashboard, storyRequest))).toBe("failed");

  await recoveryOf(page)
    .getByRole("button", { name: `Recheck ${subject}` })
    .click();

  await expect(recoveryOf(page)).toHaveCount(0, { timeout: 30_000 });
  await expect(cardSessions(card)).toHaveCount(1);
  await expect(card).not.toContainText("Startup needs reconciliation");
  await expect(start).toBeEnabled();
  await expect(
    card.getByRole("button", { name: "Inspect story" }),
  ).toBeEnabled();
  expect((await attempts(dashboard))[0]?.outcome).toEqual({
    kind: "launched",
    session: { host: "claude", sessionId: listed?.sessionId },
  });
  expect(dashboard.claudeLaunchCalls()).toHaveLength(1);
});

test("Recheck finding no session this launch started, among others listed, settles it as not launched and lifts protection", async ({
  page,
  dashboard,
}) => {
  test.setTimeout(90_000);
  dashboard.claudeScenario("hang");
  const { card, start, name, cwd, acceptedAt } = await uncertainLaunch(
    page,
    dashboard,
  );
  const now = Date.now();
  // Each is this launch's but for one thing.
  dashboard.claudeListsSession({
    name: `${name} (other)`,
    cwd,
    startedAt: now,
  });
  dashboard.claudeListsSession({ name, cwd: dashboard.home, startedAt: now });
  dashboard.claudeListsSession({ name, cwd, startedAt: acceptedAt - 60_000 });
  recordHolding(
    dashboard,
    dashboard.claudeListsSession({ name, cwd, startedAt: now }),
  );
  expect(await answerKind(accept(dashboard, storyRequest))).toBe("failed");

  await recoveryOf(page)
    .getByRole("button", { name: `Recheck ${subject}` })
    .click();

  await expect(recoveryOf(page)).toHaveCount(0, { timeout: 30_000 });
  await expect(start).toBeEnabled();
  await expect(card).not.toContainText("Startup needs reconciliation");
  await expect(cardSessions(card)).toHaveCount(0);
  expect((await attempts(dashboard))[0]?.outcome).toMatchObject({
    kind: "failed",
    reason: "not-listed",
    explanation: expect.stringContaining(
      "Claude Code lists no session this launch started in ~/git/open-dough",
    ),
  });
  expect(dashboard.claudeLaunchCalls()).toHaveLength(1);

  // Settled, its story starts afresh.
  expect(await answerKind(accept(dashboard, storyRequest))).toBe("accepted");
});

test("Recheck keeps the story protected, saying why, while the listing cannot be read or names two sessions it could have started", async ({
  page,
  dashboard,
}) => {
  test.setTimeout(90_000);
  dashboard.claudeScenario("launched-hang");
  const { card, name, cwd } = await uncertainLaunch(page, dashboard);
  const [before] = await attempts(dashboard);
  const recovery = recoveryOf(page);
  const recheck = recovery.getByRole("button", { name: `Recheck ${subject}` });
  const continues = recovery.getByRole("button", {
    name: `Continue execution start of ${subject}`,
  });

  dashboard.claudeListingFails(true);
  await recheck.click();
  await expect(recovery.locator(".launch-problem")).toContainText(
    "Claude Code's session listing could not be read, so whether this launch started its session is still not known.",
  );
  await expect(continues).toBeEnabled();
  await expect(card).toContainText("Startup needs reconciliation");
  await expect(card.getByRole("button", { disabled: false })).toHaveCount(0);
  expect(await attempts(dashboard)).toEqual([before]);

  dashboard.claudeListingFails(false);
  dashboard.claudeListsSession({ name, cwd, startedAt: Date.now() });
  await recheck.click();
  await expect(recovery.locator(".launch-problem")).toContainText(
    "Claude Code lists 2 sessions this launch could have started in ~/git/open-dough, so which one it started is not known.",
  );
  await expect(continues).toBeEnabled();
  await expect(card).toContainText("Startup needs reconciliation");
  expect(await attempts(dashboard)).toEqual([before]);
  expect(await answerKind(accept(dashboard, storyRequest))).toBe("failed");
  expect(dashboard.claudeLaunchCalls()).toHaveLength(1);
});
