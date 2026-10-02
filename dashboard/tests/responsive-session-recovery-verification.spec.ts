// An execution start whose installed start published its Take and established
// a workspace, and whose Claude Code launch then did not answer within the
// launch wait, settled by Recheck under Startup recovery
// (../server/launchVerification.ts): the session counted as the launch's is
// the one Claude Code lists in that workspace, never one of the same name in
// the project folder. Against the same real bare origin and installed starts
// as ./responsive-session-recovery.spec.ts.

import { readFileSync, realpathSync, writeFileSync } from "node:fs";
import path from "node:path";
import { attempts } from "./agentLaunchBoundary.ts";
import { cardSessions } from "./dashboardPage.ts";
import { expect } from "./dashboardTest.ts";
import {
  expectRecoveryOffered,
  recoveryOf,
  startExecution,
  subject,
  worktrees,
} from "./responsiveRecovery.ts";
import { openStories, test } from "./responsiveStart.ts";
import { queuedIdentity } from "./support/startOrigin.ts";

test.use({ projectFolders: ["open-dough"], launchTimeoutMs: 3_000 });

test("Recheck trusts the start's own record after its kept start was removed, even though the session is listed only in its workspace", async ({
  page,
  dashboard,
  origin,
}) => {
  test.setTimeout(120_000);
  dashboard.claudeScenario("launched-hang");
  const { story, takenStory } = await openStories(page, origin);
  await startExecution(page, story);
  await expect
    .poll(async () => (await attempts(dashboard))[0]?.outcome?.kind, {
      timeout: 60_000,
    })
    .toBe("uncertain");
  const [uncertain] = await attempts(dashboard);
  const [listed] = dashboard.claudeListing();
  expect(listed).toBeDefined();
  const startsFile = path.join(
    dashboard.home,
    ".open-dough/dashboard/execution-starts.json",
  );
  const starts = JSON.parse(readFileSync(startsFile, "utf8")) as Record<
    string,
    Record<string, { start: unknown }>
  >;
  const kept = starts["open-dough"]?.[queuedIdentity];
  expect(kept?.start).toBeDefined();
  const file = path.join(
    dashboard.home,
    ".open-dough/dashboard/agent-launches.json",
  );
  const stored = JSON.stringify({
    "open-dough": [
      {
        request: uncertain?.request,
        session: {
          host: "claude",
          sessionId: listed?.sessionId,
          shortId: listed?.id,
          name: listed?.name,
        },
        start: kept?.start,
        launchedAt: new Date().toISOString(),
      },
    ],
  });
  // State left when keeping the launch and removing its start succeeded,
  // but noting the attempt's launched outcome failed.
  writeFileSync(file, stored);
  writeFileSync(startsFile, JSON.stringify({ "open-dough": {} }));
  const verificationListings = () =>
    dashboard
      .claudeCalls()
      .filter(
        (call) =>
          call.argv[0] === "agents" &&
          call.cwd === realpathSync(origin.project),
      );
  const before = verificationListings();
  expect(listed?.cwd).not.toBe(realpathSync(origin.project));
  await expectRecoveryOffered(page);

  await recoveryOf(page)
    .getByRole("button", { name: `Recheck ${subject}` })
    .click();

  await expect(recoveryOf(page)).toHaveCount(0, { timeout: 30_000 });
  await expect(cardSessions(takenStory)).toHaveCount(1);
  await expect(
    takenStory.getByRole("button", { name: "Inspect story" }),
  ).toBeEnabled();
  expect((await attempts(dashboard))[0]?.outcome).toEqual({
    kind: "launched",
    session: { host: "claude", sessionId: listed?.sessionId },
  });
  expect(verificationListings()).toEqual(before);
  expect(readFileSync(file, "utf8")).toBe(stored);
  expect(dashboard.claudeLaunchCalls()).toHaveLength(1);
});

test("Recheck records the session listed in the start's workspace, not one of the same name in the project folder", async ({
  page,
  dashboard,
  origin,
}) => {
  test.setTimeout(120_000);
  dashboard.claudeScenario("launched-hang");
  const { story, takenStory } = await openStories(page, origin);
  await startExecution(page, story);
  await expect
    .poll(async () => (await attempts(dashboard))[0]?.outcome?.kind, {
      timeout: 60_000,
    })
    .toBe("uncertain");
  const [uncertain] = await attempts(dashboard);
  expect(uncertain?.publication.kind).toBe("published");
  const [call] = dashboard.claudeLaunchCalls();
  const [workspace] = worktrees(origin);
  expect(call?.cwd).toBe(
    realpathSync(path.join(origin.project, ".worktrees", workspace ?? "")),
  );
  const [listed] = dashboard.claudeListing();
  const argv = call?.argv ?? [];
  // The same name, since the launch was accepted, in the project folder.
  dashboard.claudeListsSession({
    name: argv[argv.indexOf("--name") + 1] ?? "",
    cwd: realpathSync(origin.project),
    startedAt: Date.now(),
  });
  await expectRecoveryOffered(page);

  await recoveryOf(page)
    .getByRole("button", { name: `Recheck ${subject}` })
    .click();

  await expect(recoveryOf(page)).toHaveCount(0, { timeout: 30_000 });
  await expect(cardSessions(takenStory)).toHaveCount(1);
  await expect(
    takenStory.getByRole("button", { name: "Inspect story" }),
  ).toBeEnabled();
  expect((await attempts(dashboard))[0]?.outcome).toEqual({
    kind: "launched",
    session: { host: "claude", sessionId: listed?.sessionId },
  });
  expect(dashboard.claudeLaunchCalls()).toHaveLength(1);
});
