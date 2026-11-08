// A Backlog card's Claude Code launch whose answer did not come within the
// launch wait, settled by Recheck under Startup recovery
// (../../server/launchVerification.ts): Claude Code's own session listing is
// read once, and the one session it lists with the launch's name, started in
// its folder since the launch was accepted and held by no other launch
// record, is recorded as the launch's; a readable listing with none settles
// it as not launched. An unreadable listing, or two such sessions, keep the
// story protected with why. Recheck never launches again; the synthetic
// `claude` (./fixtures/fake-claude) stands in for Claude Code.

import type { Page } from "@playwright/test";
import { makeMe } from "../../../tests/support/makeMe.mjs";
import { accept, attempts, identity, title } from "../agentLaunchBoundary.ts";
import { storyCardSessions } from "../dashboardPage.ts";
import { openSessionStartReason } from "../../src/agentLaunch.ts";
import {
  expect,
  test,
  recoveryOf,
  storyRequest,
  subject,
  useUncertainLaunch,
} from "../claudeVerification.ts";
import type { DashboardServer } from "../support/dashboardServer.ts";
import { keepMoreLaunchRecords } from "../support/launchStore.ts";
import { selectStory } from "../storyCardSelection.ts";

const openSessionDescription = new RegExp(
  openSessionStartReason.replace(/[.]/g, "\\."),
);

const uncertainLaunch = useUncertainLaunch();
const answerKind = async (response: Promise<{ body: string }>) =>
  (JSON.parse((await response).body) as { kind: string; reason?: string }).kind;

// Keeps a launch record of another story, launched now, holding the listed
// `sessionId`.
function recordHolding(dashboard: DashboardServer, sessionId: string) {
  keepMoreLaunchRecords(dashboard, [
    makeMe.aLaunchRecord
      .executing({ identity, title })
      .inClaudeSession({ sessionId })
      .launchedAt(new Date().toISOString())
      .please(),
  ]);
}

// Holds the page's reads of the project's ref asked once a launch is sent,
// each answered by the service at once but reaching the page only after a
// Recheck verification has reached it.
async function holdReadsSinceLaunchUntilVerified(page: Page) {
  let launchSent = false;
  page.on("request", (request) => {
    if (new URL(request.url()).pathname === "/__agent-launch/accept")
      launchSent = true;
  });
  const verified = page
    .waitForResponse("**/__agent-launch/verify", { timeout: 0 })
    .catch(() => undefined);
  await page.route(
    (url) =>
      url.pathname === "/__authenticated-read" &&
      !url.searchParams.has("revision"),
    async (route) => {
      const held = launchSent;
      // Fetched outside the page, so its same-origin mark is restated.
      const response = await route.fetch({
        headers: {
          ...route.request().headers(),
          "sec-fetch-site": "same-origin",
        },
      });
      if (held) await verified;
      await route.fulfill({ response });
    },
  );
}

test("Recheck records the one session the uncertain launch started, and the card lists it with Starts held for the open session", async ({
  page,
  dashboard,
  launchJourney,
}) => {
  dashboard.claudeScenario("launched-hang");
  // The read the uncertain settling asks is still under way when Recheck
  // answers, so the read asked after the launch settled must still follow.
  await holdReadsSinceLaunchUntilVerified(page);
  const { card, start } = await uncertainLaunch(page, dashboard, launchJourney);
  const [listed] = dashboard.claudeListing();
  await expect(card).toContainText("Startup needs reconciliation");
  expect(await answerKind(accept(dashboard, storyRequest))).toBe("failed");

  await recoveryOf(page)
    .getByRole("button", { name: `Recheck ${subject}` })
    .click();

  await expect(recoveryOf(page)).toHaveCount(0, { timeout: 30_000 });
  await expect(storyCardSessions(card)).toHaveCount(1);
  await expect(card).not.toContainText("Startup needs reconciliation");
  await expect(start).toBeDisabled();
  await expect(start).toHaveAccessibleDescription(openSessionDescription);
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
  launchJourney,
}) => {
  dashboard.claudeScenario("hang");
  const { card, start, name, cwd, acceptedAt } = await uncertainLaunch(
    page,
    dashboard,
    launchJourney,
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
  await expect(storyCardSessions(card)).toHaveCount(0);
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
  launchJourney,
}) => {
  dashboard.claudeScenario("launched-hang");
  const { card, name, cwd } = await uncertainLaunch(
    page,
    dashboard,
    launchJourney,
  );
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
  // Only Select story, no protected action, stays available.
  await expect(card.getByRole("button", { disabled: false })).toHaveCount(1);
  await expect(selectStory(card)).toBeEnabled();
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
