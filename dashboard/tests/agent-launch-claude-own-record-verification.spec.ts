// Recheck trusts a launch's own durable record even when the host's listing
// no longer names its session, using the latest record when several exist.
import { mkdirSync, readFileSync, realpathSync, writeFileSync } from "node:fs";
import path from "node:path";
import { attempts } from "./agentLaunchBoundary.ts";
import { cardSessions } from "./dashboardPage.ts";
import {
  expect,
  test,
  recoveryOf,
  storyRequest,
  subject,
  useUncertainLaunch,
} from "./claudeVerification.ts";

const uncertainLaunch = useUncertainLaunch();

for (const count of [1, 2]) {
  test(`Recheck trusts the latest own record among ${String(count)} unlisted sessions without reading the listing or keeping another record`, async ({
    page,
    dashboard,
  }) => {
    test.setTimeout(90_000);
    dashboard.claudeScenario("hang");
    const { card, start, acceptedAt } = await uncertainLaunch(page, dashboard);
    const file = path.join(
      dashboard.home,
      ".open-dough/dashboard/agent-launches.json",
    );
    mkdirSync(path.dirname(file), { recursive: true });
    const records = [0, 1].slice(0, count).map((index) => ({
      request: storyRequest,
      session: {
        host: "claude",
        sessionId: `unlisted-own-session-${String(index)}`,
        shortId: `own-${String(index)}`,
        name: "own launch",
      },
      launchedAt: new Date(acceptedAt + index + 1).toISOString(),
    }));
    const latest = records.at(-1);
    // Deliberately newest first: selection depends on time, not file order.
    const stored = JSON.stringify({ "open-dough": records.toReversed() });
    writeFileSync(file, stored);
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
    await expect(cardSessions(card)).toHaveCount(count);
    await expect(start).toBeEnabled();
    await expect(
      card.getByRole("button", { name: "Inspect story" }),
    ).toBeEnabled();
    expect((await attempts(dashboard))[0]?.outcome).toEqual({
      kind: "launched",
      session: { host: "claude", sessionId: latest?.session.sessionId },
    });
    expect(verificationListings()).toEqual(before);
    expect(readFileSync(file, "utf8")).toBe(stored);
    expect(dashboard.claudeLaunchCalls()).toHaveLength(1);
  });
}
