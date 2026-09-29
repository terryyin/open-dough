// How Started lasts and settles on a Backlog card, on a committed origin the
// production commands publish (./launchJourney.ts): it survives reloads and
// project switches; a published preparation assignment ends a refinement
// Started, notes Start refinement "Being prepared", and leaves an execution
// Started beside Preparing; every Started ends once origin publishes the Take
// or the story leaves the backlog, while Recent sessions keeps every entry.
// What an entry shows is ./agent-launch-recent-sessions.spec.ts. The page's
// own dashboard server launches the synthetic `claude`
// (./fixtures/fake-claude); the real one is never reached.

import { expect, test } from "./dashboardTest.ts";
import {
  expectMembership,
  parts,
  recentSessionName,
  sessionNamedBy,
} from "./dashboardPage.ts";
import { doughnutSharedTitle } from "./doughnutProject.ts";
import {
  notRefinedStory,
  publishSettlementJourney,
  readyStory,
  takenStory,
  type SettlementJourney,
} from "./launchJourney.ts";
import { openSettlementJourney, type Workflow } from "./settlementPage.ts";

test.use({ projectFolders: ["open-dough"] });

type Launch = readonly [title: string, workflow: Workflow];

test.describe("as origin publishes what the launched sessions do", () => {
  let settlement: SettlementJourney;
  test.beforeAll(async () => {
    test.setTimeout(120_000);
    settlement = await publishSettlementJourney();
  });
  test.afterAll(() => (settlement as SettlementJourney | undefined)?.cleanup());

  test("Started survives reloads and project switches; Preparing ends a refinement Started and notes Start refinement, leaving the execution Started; the Take or leaving the backlog ends every Started and keeps every Recent sessions entry", async ({
    page,
    dashboard,
  }) => {
    dashboard.claudeScenario("launched");
    const { card, action, settled, show, launch } = await openSettlementJourney(
      page,
      settlement,
    );
    const { stages, taken, project, recentSessions } = parts(page);
    const started = (title: string, workflow: Workflow) =>
      card(title).getByRole("region", { name: `${workflow} started` });
    const anyStarted = page.getByRole("region", { name: "Started" });
    const launches = () =>
      dashboard.claudeCalls().filter((c) => c.argv[0] === "--bg");
    const queued = [takenStory, readyStory, notRefinedStory];
    await expectMembership(page, { taken: [], backlog: queued });
    await settled();

    // Story B is prepared and then taken; Story C is completed without being
    // taken.
    const launched: Launch[] = [
      [readyStory, "Execution"],
      [readyStory, "Refinement"],
      [notRefinedStory, "Execution"],
    ];
    const sessions = new Map<string, string>();
    for (const [title, workflow] of launched) {
      await launch(title, workflow);
      await expect(started(title, workflow)).toBeVisible();
      sessions.set(
        `${title} ${workflow}`,
        await sessionNamedBy(started(title, workflow)),
      );
    }
    const expectStarted = async (launches: readonly Launch[]) => {
      for (const [title, workflow] of launches) {
        await expect(started(title, workflow)).toContainText(
          `Session ${sessions.get(`${title} ${workflow}`) ?? "?"}`,
        );
        await expect(action(title, workflow)).toHaveCount(0);
      }
      await expect(anyStarted).toHaveCount(launches.length);
    };
    await expectStarted(launched);
    expect(launches()).toHaveLength(3);
    // Recent sessions lists every launch, newest first, each naming its own
    // session: the three above, and later the refinement launched on the
    // Preparing card.
    const entries = recentSessions.getByRole("article");
    const listed = launched.map(
      ([title, workflow]) =>
        [title, workflow, sessions.get(`${title} ${workflow}`) ?? "?"] as const,
    );
    const expectEveryEntry = async () => {
      await expect(entries).toHaveCount(listed.length);
      for (const [index, [title, workflow, session]] of listed
        .toReversed()
        .entries()) {
        await expect(entries.nth(index)).toHaveAccessibleName(
          recentSessionName(workflow, title),
        );
        await expect(entries.nth(index)).toContainText(`Session ${session}`);
      }
    };
    await expectEveryEntry();

    await test.step("reloading the page keeps Started, read again from the running server", async () => {
      const reads = page.waitForRequest(
        (request) =>
          request.method() === "GET" &&
          request.url().endsWith("/__agent-launch?source=open-dough"),
      );
      await page.reload();
      await reads;
      await expectMembership(page, { taken: [], backlog: queued });
      await settled();
      await expectStarted(launched);
      await expect(action(takenStory, "Execution")).toBeEnabled();
    });

    await test.step("another project shows none of these launches, and returning shows Started again", async () => {
      await project
        .getByRole("radio", { name: "Doughnut", exact: true })
        .check();
      await expectMembership(page, {
        taken: [],
        backlog: [doughnutSharedTitle],
      });
      await expect(anyStarted).toHaveCount(0);
      await expect(action(doughnutSharedTitle, "Execution")).toBeEnabled();

      await project
        .getByRole("radio", { name: "Open Dough", exact: true })
        .check();
      await expectMembership(page, { taken: [], backlog: queued });
      await settled();
      await expectStarted(launched);
    });

    await test.step("a published preparation assignment ends the refinement Started, notes Start refinement, and keeps the execution Started beside Preparing", async () => {
      await show(settlement.preparing);
      await expectMembership(page, { taken: [], backlog: queued });
      await expect(
        card(readyStory).getByText("Preparing", { exact: true }),
      ).toBeVisible();
      const stillStarted: Launch[] = [
        [readyStory, "Execution"],
        [notRefinedStory, "Execution"],
      ];
      await expectStarted(stillStarted);
      await expect(
        action(readyStory, "Refinement"),
      ).toHaveAccessibleDescription("Being prepared");
      for (const title of [takenStory, notRefinedStory]) {
        await expect(action(title, "Refinement")).toHaveAccessibleDescription(
          "",
        );
      }
      await page.reload();
      await settled();
      await expectStarted(stillStarted);
    });

    await test.step("a refinement launched on a story already Preparing settles at once", async () => {
      await launch(readyStory, "Refinement");
      await expect.poll(() => launches().length).toBe(4);
      await expect(action(readyStory, "Refinement")).toBeEnabled();
      await expect(
        action(readyStory, "Refinement"),
      ).toHaveAccessibleDescription("Being prepared");
      await expect(started(readyStory, "Refinement")).toHaveCount(0);
      await expect(entries).toHaveCount(listed.length + 1);
      listed.push([
        readyStory,
        "Refinement",
        await sessionNamedBy(entries.first()),
      ]);
      await expectEveryEntry();
    });

    await test.step("the published Take shows the story under Taken, ends its Started, and keeps every entry", async () => {
      await show(settlement.taken);
      await expectMembership(page, {
        taken: [readyStory],
        backlog: [takenStory, notRefinedStory],
      });
      await expect(
        taken.getByRole("article", { name: readyStory }),
      ).not.toContainText("Started");
      await expectStarted([[notRefinedStory, "Execution"]]);
      await expectEveryEntry();
      await page.reload();
      await expectMembership(page, {
        taken: [readyStory],
        backlog: [takenStory, notRefinedStory],
      });
      await settled();
      await expectStarted([[notRefinedStory, "Execution"]]);
      await expectEveryEntry();
    });

    await test.step("a launched story that leaves the backlog shows no Started anywhere, and every entry stays through a reload", async () => {
      await show(settlement.completed);
      const completed = { taken: [readyStory], backlog: [takenStory] };
      await expectMembership(page, completed);
      await expect(stages.getByText(notRefinedStory)).toHaveCount(0);
      await expect(anyStarted).toHaveCount(0);
      await expectEveryEntry();
      await page.reload();
      await expectMembership(page, completed);
      await settled();
      await expect(anyStarted).toHaveCount(0);
      await expectEveryEntry();
    });

    // Nothing was launched again along the way.
    expect(launches()).toHaveLength(4);
  });
});
