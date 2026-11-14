// Recheck trusts a launch's own durable record even when the host's listing
// no longer names its session, using the latest record when several exist.
import { readFileSync, realpathSync, writeFileSync } from "node:fs";
import path from "node:path";
import { attempts } from "../../dashboard/tests/agentLaunchBoundary.ts";
import { storyCardSessions } from "../../dashboard/tests/dashboardPage.ts";
import {
  openSessionStartReason,
  type LaunchAttemptRecord,
} from "../../dashboard/src/agentLaunch.ts";
import {
  keepLaunchStore,
  launchStoreFile,
} from "../../dashboard/tests/support/launchStore.ts";
import { makeMe } from "../../tests/support/makeMe.mjs";
import { readyStory } from "../../dashboard/tests/launchJourney.ts";
import { identityB } from "../../src/skills/dough-execute-plan/scripts/workspace-publication-fixtures.mjs";
import {
  expect,
  test,
  recoveryOf,
  subject,
  useUncertainLaunch,
} from "../../dashboard/tests/claudeVerification.ts";

const openSessionDescription = new RegExp(
  openSessionStartReason.replace(/[.]/g, "\\."),
);

const uncertainLaunch = useUncertainLaunch();

for (const count of [1, 2]) {
  test(`Recheck trusts the latest own record among ${String(count)} unlisted sessions without reading the listing or keeping another record`, async ({
    page,
    dashboard,
    launchJourney,
  }) => {
    dashboard.claudeScenario("hang");
    const { card, start, acceptedAt } = await uncertainLaunch(
      page,
      dashboard,
      launchJourney,
    );
    // An older writer left worker facts on a settled uncertain attempt.
    // They cannot make it running, and Recheck must clear them with its outcome.
    const attemptFile = path.join(
      dashboard.home,
      ".open-dough/dashboard/launch-attempts.json",
    );
    const retained = JSON.parse(readFileSync(attemptFile, "utf8")) as Record<
      string,
      LaunchAttemptRecord[]
    >;
    retained["open-dough"] = (retained["open-dough"] ?? []).map((entry) => ({
      ...entry,
      worker: {
        pid: dashboard.pid,
        serverPid: dashboard.pid,
        step: "launch",
        notedAt: entry.acceptedAt,
      },
      slowSince: entry.acceptedAt,
    }));
    writeFileSync(attemptFile, JSON.stringify(retained));
    expect((await attempts(dashboard))[0]).toMatchObject({
      running: false,
      worker: { pid: dashboard.pid },
    });
    // Story B's own executions, each launched after the attempt was accepted.
    const records = [0, 1].slice(0, count).map((index) =>
      makeMe.aLaunchRecord
        .executing({ identity: identityB, title: readyStory })
        .inClaudeSession({
          sessionId: `unlisted-own-session-${String(index)}`,
          shortId: `own-${String(index)}`,
        })
        .launchedAt(new Date(acceptedAt + index + 1).toISOString())
        .please(),
    );
    const latest = records.at(-1);
    // Deliberately newest first: selection depends on time, not file order.
    const stored = keepLaunchStore(dashboard, {
      "open-dough": records.toReversed(),
    });
    expect(dashboard.claudeListing()).toEqual([]);
    // Page session reads use HOME; verification reads in the project folder.
    const verificationListings = () =>
      dashboard
        .claudeCalls()
        .filter(
          (call) =>
            call.argv[0] === "agents" &&
            call.cwd ===
              realpathSync(path.join(dashboard.home, "git/open-dough")),
        );
    const before = verificationListings();
    dashboard.claudeListingFails(true);

    await recoveryOf(page)
      .getByRole("button", { name: `Recheck ${subject}` })
      .click();

    await expect(recoveryOf(page)).toHaveCount(0, { timeout: 30_000 });
    await expect(storyCardSessions(card)).toHaveCount(count);
    await expect(start).toBeDisabled();
    await expect(start).toHaveAccessibleDescription(openSessionDescription);
    await expect(
      card.getByRole("button", { name: "Inspect story" }),
    ).toBeEnabled();
    expect((await attempts(dashboard))[0]?.outcome).toEqual({
      kind: "launched",
      session: { host: "claude", sessionId: latest?.session.sessionId },
    });
    expect((await attempts(dashboard))[0]?.worker).toBeUndefined();
    expect((await attempts(dashboard))[0]?.slowSince).toBeUndefined();
    expect(verificationListings()).toEqual(before);
    expect(readFileSync(launchStoreFile(dashboard), "utf8")).toBe(stored);
    expect(dashboard.claudeLaunchCalls()).toHaveLength(1);
  });
}
