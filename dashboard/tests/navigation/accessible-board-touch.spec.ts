import { expect, test } from "../dashboardTest.ts";
import {
  longBacklog,
  longIdentity,
  longPlan,
  longTitle,
  publishLargeBacklog,
  queuedCount,
  queuedTitles,
  revision,
} from "../accessibleBoard.ts";
import {
  chooseProject,
  expectProjectChoice,
  expectSettledPage,
  parts,
} from "../dashboardPage.ts";
import { columnPagingControl, expectView, wheelTo } from "../boardPage.ts";
import { expectReadWholeInCard } from "../boardReading.ts";
import {
  commitAnswer,
  publishMovingOrigin,
  publishOrigin,
  rawFileAnswer,
} from "../publishedOrigin.ts";
import { describedBacklog } from "../describedRevisions.ts";
import { makeMe } from "../../../tests/support/makeMe.mjs";
import {
  compactProjectSelectCut,
  expectNoSidewaysScrollAndWholeText,
  tapWhereShown,
} from "../pageLayout.ts";
import { openUntilRead } from "../pageRequestNotes.ts";
import { doneRecordFiles, executed } from "../recentlyDoneRecords.ts";
import { keepLaunchRecords } from "../support/launchStore.ts";
import { openSessionStartReason } from "../../src/agentLaunch.ts";

const phoneWholeTextCut = [".owner-mark", ...compactProjectSelectCut] as const;

test.describe("touch reading", () => {
  test.use({ hasTouch: true });

  test("project and column navigation keep a long story readable and its detail selected through rotation", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.emulateMedia({ reducedMotion: "reduce" });
    const origin = await publishMovingOrigin(page);
    origin.push(revision, longBacklog, doneRecordFiles(Date.now()));
    await publishOrigin(
      page,
      {
        ref: commitAnswer("d7".repeat(20)),
        backlog: {
          revision: "d7".repeat(20),
          answer: rawFileAnswer(describedBacklog(makeMe.aRepository.please())),
        },
      },
      "nerds-odd-e/doughnut",
    );
    await openUntilRead(page);
    const { taken, recentlyDone } = parts(page);
    await chooseProject(page, "Doughnut");
    await expect(parts(page).backlog).toContainText(
      "No Backlog entries are recorded.",
    );
    await chooseProject(page, "Open Dough");
    await expect(parts(page).backlog.getByRole("article")).toHaveCount(3);
    await tapWhereShown(columnPagingControl(page, "Taken"));
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
    await tapWhereShown(columnPagingControl(page, "Recently done"));
    await expect(
      recentlyDone.getByRole("article", { name: executed.title, exact: true }),
    ).toBeVisible();
    await expectNoSidewaysScrollAndWholeText(page, phoneWholeTextCut);
    await tapWhereShown(columnPagingControl(page, "Taken"));
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
    dashboard,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    const title = "Queue trunk integration for agents on the same machine";
    keepLaunchRecords(dashboard, [
      makeMe.aLaunchRecord
        .executing({ identity: "SEED-008#same-machine-merge-queue", title })
        .inClaudeSession({ sessionId: "aaaaaaaa-0000-4000-8000-000000000001" })
        .launchedAt(new Date().toISOString())
        .please(),
    ]);
    await publishOrigin(page, {
      ref: commitAnswer(revision),
      backlog: { revision, answer: rawFileAnswer(longBacklog) },
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
    expect(dashboard.claudeLaunchCalls()).toEqual([]);
  });

  test("comfortable Column paging controls show work where the developer is reading on phone and tablet", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.emulateMedia({ reducedMotion: "reduce" });
    await publishLargeBacklog(page);
    await openUntilRead(page);
    await expectSettledPage(page, {
      taken: ["Repair the installer's update report"],
      backlog: queuedTitles,
    });
    await wheelTo(page, 1000);
    await tapWhereShown(columnPagingControl(page, "Taken"));
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
    await tapWhereShown(columnPagingControl(page, "Backlog"));
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
