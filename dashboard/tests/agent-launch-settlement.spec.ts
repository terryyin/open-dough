// How Started lasts and settles on a Backlog card, on a committed origin the
// production commands publish (./launchJourney.ts): it survives reloads and
// project switches, stays beside a published preparation assignment, and ends
// once origin publishes the Take or the story leaves the backlog. The page's
// own dashboard server launches the synthetic `claude`
// (./fixtures/fake-claude); the real one is never reached.

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

test.describe("as origin publishes what the launched sessions do", () => {
  let settlement: SettlementJourney;
  test.beforeAll(async () => {
    test.setTimeout(120_000);
    settlement = await publishSettlementJourney();
  });
  test.afterAll(() => (settlement as SettlementJourney | undefined)?.cleanup());

  test("Started survives reloads and project switches, stays beside a published Preparing, and is gone once origin shows the story Taken or no longer queued", async ({
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
    const started = (title: string) =>
      card(title).getByRole("region", { name: "Started" });
    const anyStarted = page.getByRole("region", { name: "Started" });
    const dialog = page.getByRole("dialog", {
      name: "Start execution in Claude Code",
    });
    const settled = async () => {
      await expect(page.getByText("Reading preparation…")).toHaveCount(0);
    };
    const show = async (revision: string) => {
      origin.advanceTo(revision);
      await refresh.click();
      await expect(source).toContainText(revision);
      await settled();
    };
    const queued = [takenStory, readyStory, notRefinedStory];
    await expectMembership(page, { taken: [], backlog: queued });
    await settled();

    // Story B is taken later; Story C is completed without being taken.
    const sessions = new Map<string, string>();
    for (const title of [readyStory, notRefinedStory]) {
      await card(title)
        .getByRole("button", { name: "Start execution" })
        .click();
      await dialog.getByRole("button", { name: "Start" }).click();
      await expect(started(title)).toBeVisible();
      const session = await started(title)
        .locator("p code")
        .first()
        .textContent();
      sessions.set(title, session ?? "");
    }
    const expectStarted = async (titles: readonly string[]) => {
      for (const title of titles) {
        await expect(started(title)).toContainText(
          `Session ${sessions.get(title) ?? "?"}`,
        );
        await expect(
          card(title).getByRole("button", { name: "Start execution" }),
        ).toHaveCount(0);
      }
      await expect(anyStarted).toHaveCount(titles.length);
    };
    await expectStarted([readyStory, notRefinedStory]);
    expect(
      dashboard.claudeCalls().filter((c) => c.argv[0] === "--bg"),
    ).toHaveLength(2);

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
      await expectStarted([readyStory, notRefinedStory]);
      await expect(
        card(takenStory).getByRole("button", { name: "Start execution" }),
      ).toBeEnabled();
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
      await expect(
        card(doughnutSharedTitle).getByRole("button", {
          name: "Start execution",
        }),
      ).toBeEnabled();

      await project
        .getByRole("radio", { name: "Open Dough", exact: true })
        .check();
      await expectMembership(page, { taken: [], backlog: queued });
      await settled();
      await expectStarted([readyStory, notRefinedStory]);
    });

    await test.step("a published preparation assignment shows Preparing beside Started", async () => {
      await show(settlement.preparing);
      await expectMembership(page, { taken: [], backlog: queued });
      await expect(card(readyStory).locator(".preparing-activity")).toHaveText(
        "Preparing",
      );
      await expectStarted([readyStory, notRefinedStory]);
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
      await expectStarted([notRefinedStory]);
      await page.reload();
      await expectMembership(page, {
        taken: [readyStory],
        backlog: [takenStory, notRefinedStory],
      });
      await settled();
      await expectStarted([notRefinedStory]);
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
    expect(
      dashboard.claudeCalls().filter((c) => c.argv[0] === "--bg"),
    ).toHaveLength(2);
  });
});
