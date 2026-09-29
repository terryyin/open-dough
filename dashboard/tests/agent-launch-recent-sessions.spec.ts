// Recent sessions lists every session this dashboard launched for the
// selected project, newest first, on a committed origin the production
// commands publish (./launchJourney.ts): an entry names its story, workflow,
// launch time, and session, offers Open terminal, and stays while origin
// prepares, takes, and completes the story, through reloads and project
// switches. Another project's launches are not listed, and origin alone still
// places every story. The page's own dashboard server launches the
// synthetic `claude` (./fixtures/fake-claude); the real one is never reached.

import { expect, test } from "./dashboardTest.ts";
import { expectMembership, parts } from "./dashboardPage.ts";
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

  test("lists each launch newest first with its story, workflow, time, session, and Open terminal, and keeps it through Preparing, the Take, completion, reloads, and project switches", async ({
    page,
    dashboard,
  }) => {
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
        `${workflow} session for ${title}`,
      );
      const naming = settlesAtOnce
        ? entries.first()
        : card(title).getByRole("region", { name: `${workflow} started` });
      const session = await naming
        .locator("p", { hasText: /^Session / })
        .locator("code")
        .textContent();
      sessionIds.unshift(session ?? "");
    };
    // The entries, newest first, each naming its own launch's session.
    const expectEntries = async (
      launches: readonly (readonly [title: string, workflow: Workflow])[],
    ) => {
      await expect(entries).toHaveCount(launches.length);
      for (const [index, [title, workflow]] of launches.entries()) {
        const entry = entries.nth(index);
        await expect(entry).toHaveAccessibleName(
          `${workflow} session for ${title}`,
        );
        await expect(entry.getByRole("heading", { level: 3 })).toHaveText(
          title,
        );
        await expect(entry).toContainText(`${workflow} started in Claude Code`);
        await expect(entry).toContainText(
          `Session ${sessionIds[index] ?? "?"}`,
        );
        await expect(
          entry.getByRole("button", { name: "Open terminal" }),
        ).toBeVisible();
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

    await test.step("an entry names its story, launch time, and local evidence", async () => {
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
        `Execution session for ${doughnutSharedTitle}`,
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

    await test.step("Preparing ends the refinement Started but not its entry, and a refinement launched on the Preparing card is listed without a Started", async () => {
      await show(settlement.preparing);
      await expectMembership(page, { taken: [], backlog: queued });
      await expect(
        card(readyStory).getByText("Preparing", { exact: true }),
      ).toBeVisible();
      await expect(
        card(readyStory).getByRole("region", { name: "Refinement started" }),
      ).toHaveCount(0);
      await expectEntries(launched);

      await launchListed(readyStory, "Refinement", true);
      await expect(action(readyStory, "Refinement")).toBeEnabled();
      await expect(
        card(readyStory).getByRole("region", { name: "Refinement started" }),
      ).toHaveCount(0);
    });

    const all = [[readyStory, "Refinement"], ...launched] as const;
    await expectEntries(all);
    expect(new Set(sessionIds).size).toBe(4);

    await test.step("the published Take keeps every entry", async () => {
      await show(settlement.taken);
      await expectMembership(page, {
        taken: [readyStory],
        backlog: [takenStory, notRefinedStory],
      });
      await expectEntries(all);
    });

    await test.step("a story completed out of every list keeps its entry, through a reload", async () => {
      await show(settlement.completed);
      await expectMembership(page, {
        taken: [readyStory],
        backlog: [takenStory],
      });
      await expectEntries(all);
      await page.reload();
      await expectMembership(page, {
        taken: [readyStory],
        backlog: [takenStory],
      });
      await expectEntries(all);
    });

    // Listing never launched anything: five launches, one of them Doughnut's.
    expect(
      dashboard.claudeCalls().filter((call) => call.argv[0] === "--bg"),
    ).toHaveLength(5);
  });
});
