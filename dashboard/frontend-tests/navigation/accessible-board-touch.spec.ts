import type { Page } from "@playwright/test";
import { expect, test } from "../../tests/support/frontendApp.ts";
import {
  doughnutSource,
  openDoughSource,
  putFrontendDonePublication,
  putFrontendBacklog,
  type FrontendServiceState,
} from "../../tests/support/frontendServiceState.ts";
import { authenticatedReadEndpoint } from "../../src/authenticatedReadRules.ts";
import { agentLaunchEndpoint } from "../../src/agentLaunch.ts";
import {
  longBacklog,
  longIdentity,
  longPlan,
  longTitle,
  queuedCount,
  queuedTitles,
  publishLargeBacklog,
  revision,
} from "../../tests/accessibleBoard.ts";
import {
  chooseProject,
  expectProjectChoice,
  expectSettledPage,
  parts,
} from "../../tests/dashboardPage.ts";
import {
  tapColumnIndicator,
  expectView,
  wheelTo,
} from "../../tests/boardPage.ts";
import { expectReadWholeInCard } from "../../tests/boardReading.ts";
import { describedBacklog } from "../../tests/describedRevisions.ts";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import {
  compactProjectSelectCut,
  expectNoSidewaysScrollAndWholeText,
  tapWhereShown,
} from "../../tests/pageLayout.ts";
import { doneRecordFiles, executed } from "../../tests/recentlyDoneRecords.ts";
import { openSessionStartReason } from "../../src/agentLaunch.ts";

const phoneWholeTextCut = [".owner-mark", ...compactProjectSelectCut] as const;
const doneDirectory = ".planning/done/";

// Open Dough's done records, published beside its own backlog.
function publishDoneRecords(services: FrontendServiceState, now: number) {
  const files = doneRecordFiles(now);
  const bodies = Object.fromEntries(
    Object.entries(files)
      .filter(([path]) => path.startsWith(doneDirectory))
      .map(([path, text]) => [path.slice(doneDirectory.length), text]),
  );
  const catalog = files[`${doneDirectory}.catalog.json`];
  if (catalog === undefined) throw new Error("Expected a done catalog.");
  putFrontendDonePublication(services, openDoughSource.id, { catalog, bodies });
}

// Doughnut publishes a backlog with nothing recorded in it.
async function publishEmptyDoughnut(
  page: Page,
  services: FrontendServiceState,
) {
  Object.assign(services, { projects: [openDoughSource, doughnutSource] });
  const empty = describedBacklog(makeMe.aRepository.please());
  await page.route(
    (url) =>
      url.pathname === authenticatedReadEndpoint &&
      url.searchParams.get("source") === doughnutSource.id &&
      [...url.searchParams.keys()].every((key) =>
        ["source", "revision"].includes(key),
      ),
    (route) =>
      route.fulfill({
        json: {
          revision: "d7".repeat(20),
          backlog: empty,
          askedAt: "2026-11-05T08:00:00.000Z",
        },
      }),
  );
}

test.describe("touch reading", () => {
  test.use({ hasTouch: true });

  test("project and column navigation keep a long story readable and its detail selected through rotation", async ({
    page,
    frontendServices,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.emulateMedia({ reducedMotion: "reduce" });
    putFrontendBacklog(frontendServices, { revision, backlog: longBacklog });
    publishDoneRecords(frontendServices, Date.now());
    await publishEmptyDoughnut(page, frontendServices);
    await page.goto("/");
    await expectSettledPage(page);
    const { taken, recentlyDone } = parts(page);
    await chooseProject(page, "Doughnut");
    await expect(parts(page).backlog).toContainText(
      "No Backlog entries are recorded.",
    );
    await chooseProject(page, "Open Dough");
    await expect(parts(page).backlog.getByRole("article")).toHaveCount(3);
    await tapColumnIndicator(page, "Taken");
    await expectView(
      page,
      ["Taken"],
      ["Backlog 3 entries", "Recently done 2 entries"],
      phoneWholeTextCut,
    );
    const card = taken.getByRole("article", { name: longTitle });
    const title = card.getByRole("heading", { level: 3 });
    await expect(title).toHaveText(longTitle);
    await expectReadWholeInCard(title, card);
    const inspect = card.getByRole("button", { name: "Inspect story" });
    await inspect.scrollIntoViewIfNeeded();
    await tapWhereShown(inspect);
    const detail = card.getByRole("region", {
      name: `Detail for ${longTitle}`,
    });
    await expect(detail).toBeVisible();
    await expect(detail).toContainText(longIdentity);
    await expect(detail).toContainText(longPlan);
    for (const fullText of [longIdentity, longPlan]) {
      await expectReadWholeInCard(
        detail.getByText(fullText, { exact: true }),
        card,
      );
    }
    await expectNoSidewaysScrollAndWholeText(page, phoneWholeTextCut);
    const hide = card.getByRole("button", { name: "Hide detail" });
    for (const size of [
      { width: 844, height: 390 },
      { width: 768, height: 1024 },
      { width: 390, height: 844 },
    ]) {
      await page.setViewportSize(size);
      await expect(detail).toBeVisible();
      await expect(hide).toHaveAttribute("aria-expanded", "true");
      await expectNoSidewaysScrollAndWholeText(page, phoneWholeTextCut);
    }
    await hide.scrollIntoViewIfNeeded();
    await tapWhereShown(hide);
    await expect(detail).toHaveCount(0);
    await expect(card).toBeFocused();
    await tapColumnIndicator(page, "Recently done");
    await expect(
      recentlyDone.getByRole("article", { name: executed.title, exact: true }),
    ).toBeVisible();
    await expectNoSidewaysScrollAndWholeText(page, phoneWholeTextCut);
    await tapColumnIndicator(page, "Taken");
    await expectView(
      page,
      ["Taken"],
      ["Backlog 3 entries", "Recently done 2 entries"],
      phoneWholeTextCut,
    );
    await expectProjectChoice(page, "Open Dough");
  });

  test("an open session's disabled Start reason is readable without hover and does not start another session", async ({
    page,
    frontendServices,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    const title = "Queue trunk integration for agents on the same machine";
    frontendServices.answerMachine(
      makeMe.aMachineAnswer
        .observingOpen(
          makeMe.aLaunchRecord
            .executing({ identity: "SEED-008#same-machine-merge-queue", title })
            .inClaudeSession({
              sessionId: "aaaaaaaa-0000-4000-8000-000000000001",
            })
            .please(),
        )
        .please(),
    );
    putFrontendBacklog(frontendServices, { revision, backlog: longBacklog });
    const launches: string[] = [];
    page.on("request", (request) => {
      if (
        request.method() !== "GET" &&
        new URL(request.url()).pathname === agentLaunchEndpoint
      )
        launches.push(request.url());
    });
    // The reason is brought into view where the page lays it out once every
    // card's preparation is read: until then the cards above it, and its own
    // dependency facts, are still growing by what those reads answer.
    await page.goto("/");
    await expectSettledPage(page);
    const card = parts(page).backlog.getByRole("article", { name: title });
    await expectReadWholeInCard(
      card.getByText(openSessionStartReason, { exact: true }),
      card,
    );
    for (const name of ["Start execution", "Start refinement"]) {
      await expect(card.getByRole("button", { name })).toBeDisabled();
      await expect(
        card.getByRole("button", { name }),
      ).toHaveAccessibleDescription(new RegExp(openSessionStartReason));
    }
    await expectNoSidewaysScrollAndWholeText(page, compactProjectSelectCut);
    expect(launches).toEqual([]);
  });

  test("thin Column indicators show work where the developer is reading on phone and tablet", async ({
    page,
    frontendServices,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.emulateMedia({ reducedMotion: "reduce" });
    publishLargeBacklog(frontendServices);
    await page.goto("/");
    await expectSettledPage(page, {
      taken: ["Repair the installer's update report"],
      backlog: queuedTitles,
    });
    await wheelTo(page, 1000);
    await tapColumnIndicator(page, "Taken");
    await expectView(
      page,
      ["Taken"],
      [`Backlog ${queuedCount} entries`, "Recently done 0 entries"],
      compactProjectSelectCut,
    );
    await page.setViewportSize({ width: 1024, height: 768 });
    await expectView(
      page,
      ["Taken", "Recently done"],
      [`Backlog ${queuedCount} entries`],
    );
    await tapColumnIndicator(page, "Backlog");
    await expectView(page, ["Backlog", "Taken"], ["Recently done 0 entries"]);
    await page.setViewportSize({ width: 390, height: 844 });
    await expectView(
      page,
      ["Backlog"],
      ["Taken 1 entry"],
      compactProjectSelectCut,
    );
    await expectNoSidewaysScrollAndWholeText(page, compactProjectSelectCut);
  });
});
