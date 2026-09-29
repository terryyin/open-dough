// Recent sessions lists every session this dashboard launched for the
// selected project, newest first, on a committed origin the production
// commands publish (./launchJourney.ts): an entry names its story, workflow,
// launch time, and session with a copyable `claude attach <id>`; two launches
// of one story are two entries; a refinement launched on a Preparing card is
// listed without a Started; and another project's launches are not listed,
// through reloads and project switches. That every entry stays through the
// Take and completion is ./agent-launch-settlement.spec.ts, and each entry's
// state is ./agent-launch-recent-session-states.spec.ts. The page's own
// dashboard server launches the synthetic `claude` (./fixtures/fake-claude);
// the real one is never reached.

import { expect, test } from "./dashboardTest.ts";
import {
  expectMembership,
  parts,
  recentSessionName,
  sessionNamedBy,
} from "./dashboardPage.ts";
import { doughnutSharedTitle } from "./doughnutProject.ts";
import {
  notRefinedIdentity,
  notRefinedStory,
  publishSettlementJourney,
  readyStory,
  takenStory,
  type SettlementJourney,
} from "./launchJourney.ts";
import { openSettlementJourney, type Workflow } from "./settlementPage.ts";

test.use({ projectFolders: ["open-dough", "doughnut"] });

test.describe("Recent sessions as origin publishes what the launched sessions do", () => {
  let settlement: SettlementJourney;
  test.beforeAll(async () => {
    test.setTimeout(120_000);
    settlement = await publishSettlementJourney();
  });
  test.afterAll(() => (settlement as SettlementJourney | undefined)?.cleanup());

  test("lists each launch newest first with its story, workflow, time, session, and attach command, only under its own project, including a refinement launched on a Preparing card", async ({
    page,
    context,
    dashboard,
  }) => {
    await context.grantPermissions(["clipboard-read", "clipboard-write"]);
    dashboard.claudeScenario("launched");
    const { card, action, settled, show, launch } = await openSettlementJourney(
      page,
      settlement,
    );
    const { project, recentSessions: recent } = parts(page);
    const entries = recent.getByRole("article");
    const sessionIds: string[] = [];
    // Launches the workflow and remembers its session, as the card's Started
    // names it or, when the launch settles at once, as the new entry does.
    const launchListed = async (
      title: string,
      workflow: Workflow,
      settlesAtOnce = false,
    ) => {
      const before = await entries.count();
      await launch(title, workflow);
      await expect(entries).toHaveCount(before + 1);
      await expect(entries.first()).toHaveAccessibleName(
        recentSessionName(workflow, title),
      );
      sessionIds.unshift(
        await sessionNamedBy(
          settlesAtOnce
            ? entries.first()
            : card(title).getByRole("region", { name: `${workflow} started` }),
        ),
      );
    };
    // The entries, newest first, each naming its own launch's session.
    const expectEntries = async (
      launches: readonly (readonly [title: string, workflow: Workflow])[],
    ) => {
      await expect(entries).toHaveCount(launches.length);
      for (const [index, [title, workflow]] of launches.entries()) {
        const entry = entries.nth(index);
        await expect(entry).toHaveAccessibleName(
          recentSessionName(workflow, title),
        );
        await expect(entry.getByRole("heading", { level: 3 })).toHaveText(
          title,
        );
        await expect(entry).toContainText(`${workflow} started in Claude Code`);
        await expect(entry).toContainText(
          `Session ${sessionIds[index] ?? "?"}`,
        );
        await expect(entry).toContainText(
          `claude attach ${(sessionIds[index] ?? "?").slice(0, 8)}`,
        );
      }
    };
    const queued = [takenStory, readyStory, notRefinedStory];
    await expectMembership(page, { taken: [], backlog: queued });
    await settled();
    await expect(recent).toContainText(
      "No sessions launched from this dashboard are kept.",
    );

    const before = Date.now();
    await launchListed(readyStory, "Refinement");
    await launchListed(readyStory, "Execution");
    await launchListed(notRefinedStory, "Execution");
    const launched = [
      [notRefinedStory, "Execution"],
      [readyStory, "Execution"],
      [readyStory, "Refinement"],
    ] as const;
    await expectEntries(launched);
    expect(new Set(sessionIds).size).toBe(3);
    await expectMembership(page, { taken: [], backlog: queued });

    await test.step("an entry names its story, launch time, and local evidence, and copies its attach command", async () => {
      const newest = entries.first();
      await expect(newest).toContainText(notRefinedIdentity);
      await expect(newest).toContainText(
        "Local: launched from this dashboard on this machine.",
      );
      const launchedAt = Date.parse(
        (await newest.locator("time").getAttribute("datetime")) ?? "",
      );
      expect(launchedAt).toBeGreaterThanOrEqual(before - 1_000);
      expect(launchedAt).toBeLessThanOrEqual(Date.now());
      await newest.getByRole("button", { name: "Copy attach command" }).click();
      await expect(newest).toContainText("Copied.");
      expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(
        `claude attach ${(sessionIds[0] ?? "?").slice(0, 8)}`,
      );
    });

    await test.step("another project lists only its own launches, and reloading or returning lists these again", async () => {
      await project
        .getByRole("radio", { name: "Doughnut", exact: true })
        .check();
      await expectMembership(page, {
        taken: [],
        backlog: [doughnutSharedTitle],
      });
      await expect(entries).toHaveCount(0);
      await launch(doughnutSharedTitle, "Execution");
      await expect(entries).toHaveCount(1);
      await expect(entries.first()).toHaveAccessibleName(
        recentSessionName("Execution", doughnutSharedTitle),
      );

      await project
        .getByRole("radio", { name: "Open Dough", exact: true })
        .check();
      await expectMembership(page, { taken: [], backlog: queued });
      await expectEntries(launched);
      await page.reload();
      await expectMembership(page, { taken: [], backlog: queued });
      await expectEntries(launched);
      await expect(recent).not.toContainText(doughnutSharedTitle);
    });

    await test.step("Preparing keeps every entry, and a refinement launched on the Preparing card is listed without a Started", async () => {
      await show(settlement.preparing);
      await expectMembership(page, { taken: [], backlog: queued });
      await expect(
        card(readyStory).getByText("Preparing", { exact: true }),
      ).toBeVisible();
      await expectEntries(launched);

      await launchListed(readyStory, "Refinement", true);
      await expect(action(readyStory, "Refinement")).toBeEnabled();
      await expect(
        card(readyStory).getByRole("region", { name: "Refinement started" }),
      ).toHaveCount(0);
      await expectEntries([[readyStory, "Refinement"], ...launched]);
      expect(new Set(sessionIds).size).toBe(4);
    });

    // Listing never launched anything: five launches, one of them Doughnut's.
    expect(
      dashboard.claudeCalls().filter((call) => call.argv[0] === "--bg"),
    ).toHaveLength(5);
  });
});
