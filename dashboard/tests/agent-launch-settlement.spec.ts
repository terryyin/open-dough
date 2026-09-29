// How Started lasts and settles on a Backlog card, on a committed origin the
// production commands publish (./launchJourney.ts): it survives reloads and
// project switches; a published preparation assignment ends a refinement
// Started, notes Start refinement "Being prepared", and leaves an execution
// Started beside Preparing; every Started ends once origin publishes the Take
// or the story leaves the backlog. The page's own dashboard server launches
// the synthetic `claude` (./fixtures/fake-claude); the real one is never
// reached.

import { expect, test } from "./dashboardTest.ts";
import { publishCommittedOrigin } from "./committedOrigin.ts";
import { expectMembership, parts } from "./dashboardPage.ts";
import {
  doughnutBacklog,
  doughnutRepository,
  doughnutSharedTitle,
  revisionDoughnut,
} from "./doughnutProject.ts";
import {
  notRefinedStory,
  publishSettlementJourney,
  readyStory,
  takenStory,
  type SettlementJourney,
} from "./launchJourney.ts";
import { publishMovingOrigin } from "./publishedOrigin.ts";

test.use({ projectFolders: ["open-dough"] });

type Workflow = "Execution" | "Refinement";
type Launch = readonly [title: string, workflow: Workflow];

test.describe("as origin publishes what the launched sessions do", () => {
  let settlement: SettlementJourney;
  test.beforeAll(async () => {
    test.setTimeout(120_000);
    settlement = await publishSettlementJourney();
  });
  test.afterAll(() => (settlement as SettlementJourney | undefined)?.cleanup());

  test("Started survives reloads and project switches; Preparing ends a refinement Started and notes Start refinement, leaving the execution Started; the Take or leaving the backlog ends every Started", async ({
    page,
    dashboard,
  }) => {
    dashboard.claudeScenario("launched");
    const origin = await publishCommittedOrigin(page, {
      repoDir: settlement.origin,
      revision: settlement.queued,
      repository: "terryyin/open-dough",
    });
    const doughnut = await publishMovingOrigin(page, doughnutRepository);
    doughnut.push(revisionDoughnut, doughnutBacklog, {});
    await page.goto("/");
    const { backlog, taken, project, source, refresh } = parts(page);
    const card = (title: string) =>
      backlog.getByRole("article", { name: title });
    const started = (title: string, workflow: Workflow) =>
      card(title).getByRole("region", { name: `${workflow} started` });
    const action = (title: string, workflow: Workflow) =>
      card(title).getByRole("button", { name: `Start ${workflow}` });
    const anyStarted = page.getByRole("region", { name: "Started" });
    const launches = () =>
      dashboard.claudeCalls().filter((c) => c.argv[0] === "--bg");
    const settled = async () => {
      await expect(page.getByText("Reading preparation…")).toHaveCount(0);
    };
    const show = async (revision: string) => {
      origin.advanceTo(revision);
      await refresh.click();
      await expect(source).toContainText(revision);
      await settled();
    };
    const launch = async (title: string, workflow: Workflow) => {
      await action(title, workflow).click();
      await page
        .getByRole("dialog", { name: `Start ${workflow} in Claude Code` })
        .getByRole("button", { name: "Start" })
        .click();
    };
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
      const session = await started(title, workflow)
        .locator("p code")
        .first()
        .textContent();
      sessions.set(`${title} ${workflow}`, session ?? "");
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
    });

    await test.step("the published Take shows the story under Taken and ends its Started", async () => {
      await show(settlement.taken);
      await expectMembership(page, {
        taken: [readyStory],
        backlog: [takenStory, notRefinedStory],
      });
      await expect(
        taken.getByRole("article", { name: readyStory }),
      ).not.toContainText("Started");
      await expectStarted([[notRefinedStory, "Execution"]]);
      await page.reload();
      await expectMembership(page, {
        taken: [readyStory],
        backlog: [takenStory, notRefinedStory],
      });
      await settled();
      await expectStarted([[notRefinedStory, "Execution"]]);
    });

    await test.step("a launched story that leaves the backlog shows no Started anywhere", async () => {
      await show(settlement.completed);
      await expectMembership(page, {
        taken: [readyStory],
        backlog: [takenStory],
      });
      await expect(page.getByText(notRefinedStory)).toHaveCount(0);
      await expect(anyStarted).toHaveCount(0);
    });

    // Nothing was launched again along the way.
    expect(launches()).toHaveLength(4);
  });
});
