import { expect, test } from "./dashboardTest";
import { expectWholeSnapshot, parts } from "./dashboardPage";
import { rateLimitedAnswer, type MovingOrigin } from "./publishedOrigin";
import {
  backlogB,
  dashboardStory,
  openAtA,
  revisionA,
  revisionB,
  revisionC,
  titlesOfA,
  titlesOfB,
} from "./refreshJourney";

// Each makes the next refresh from A fail, and returns the repair after which
// `main` names B with B's valid backlog.
const failedRefreshes: {
  because: string;
  fail: (origin: MovingOrigin) => () => void;
  problem: string;
}[] = [
  {
    because: "GitHub limits the rate",
    fail: (origin) => {
      origin.push(revisionB, backlogB);
      return origin.answerWith("main", rateLimitedAnswer());
    },
    problem:
      "GitHub limited the rate of the local GitHub CLI's requests (HTTP 403) while reading main of terryyin/open-dough. Wait before pressing Retry.",
  },
  {
    because: "the newly published backlog records the same work twice",
    fail: (origin) => {
      origin.push(revisionC, backlogB.replace(/^(- .*)$/m, "$1\n$1"));
      return () => {
        origin.push(revisionB, backlogB);
      };
    },
    problem: "The backlog already lists the same work twice",
  },
];

for (const { because, fail, problem: problemText } of failedRefreshes) {
  test(`read failure and retry keeps snapshot A apart from a refresh that failed because ${because}, then Retry publishes B whole`, async ({
    page,
  }) => {
    const retrievedA = new Date("2026-09-20T08:30:00.000Z");
    const failedAt = new Date("2026-09-20T09:10:00.000Z");
    const retrievedB = new Date("2026-09-20T09:45:00.000Z");
    await page.clock.setFixedTime(retrievedA);
    const origin = await openAtA(page);
    const { stages, refresh, retry, problem } = parts(page);
    const snapshotA = {
      revision: revisionA,
      titles: titlesOfA,
      retrievedAt: retrievedA,
    };
    await expectWholeSnapshot(page, snapshotA, [revisionB, revisionC]);
    const repair = fail(origin);
    await page.clock.setFixedTime(failedAt);
    await refresh.focus();
    await page.keyboard.press("Enter");

    await test.step("the failed attempt is told apart from the earlier snapshot, without taking focus", async () => {
      await expect(problem).toContainText("Published work could not be read");
      await expect(problem).toContainText(problemText);
      await expect(problem).toContainText(
        "What is shown is the earlier snapshot, retrieved at",
      );
      await expect(problem.locator("time").nth(0)).toHaveAttribute(
        "datetime",
        failedAt.toISOString(),
      );
      await expect(problem.locator("time").nth(1)).toHaveAttribute(
        "datetime",
        retrievedA.toISOString(),
      );
      await expect(retry).toHaveAccessibleName("Retry");
      await expect(page.getByRole("button")).toHaveCount(6);
      await expect(parts(page).preparationHelp).toHaveCount(1);
      await expect(
        page.getByRole("button", { name: "Inspect story" }),
      ).toHaveText([
        "Inspect story",
        "Inspect story",
        "Inspect story",
        "Inspect story",
      ]);
      await expect(retry).toBeFocused();
      await expect(parts(page).reading).toHaveCount(0);
    });

    await test.step("A stays whole: membership, order, pinned link, revision, and its own retrieval time", async () => {
      await expectWholeSnapshot(page, snapshotA, [revisionB, revisionC]);
      await expect(stages.getByRole("region")).toHaveCount(2);
      await expect(stages.getByRole("article")).toHaveCount(4);
      await expect(
        stages
          .getByRole("article", { name: dashboardStory })
          .getByRole("link", { name: /^Canonical record/ }),
      ).toHaveAttribute(
        "href",
        `https://github.com/terryyin/open-dough/blob/${revisionA}/.planning/seeds/SEED-021-progress.md#see-published-work`,
      );
    });

    await test.step("Retry publishes B whole and withdraws the failure", async () => {
      repair();
      await page.clock.setFixedTime(retrievedB);
      await page.keyboard.press("Enter");
      await expectWholeSnapshot(
        page,
        { revision: revisionB, titles: titlesOfB, retrievedAt: retrievedB },
        [revisionA, revisionC],
      );
      await expect(
        stages
          .getByRole("article", { name: dashboardStory })
          .getByRole("link", { name: /^Slice plan/ }),
      ).toHaveAttribute(
        "href",
        `https://github.com/terryyin/open-dough/blob/${revisionB}/.planning/quick/061-published-story-dashboard/PLAN.md`,
      );
      await expect(problem).toHaveCount(0);
      await expect(refresh).toHaveAccessibleName("Refresh");
      await expect(page.getByRole("button")).toHaveCount(6);
      await expect(parts(page).preparationHelp).toHaveCount(1);
      await expect(
        page.getByRole("button", { name: "Inspect story" }),
      ).toHaveText([
        "Inspect story",
        "Inspect story",
        "Inspect story",
        "Inspect story",
      ]);
      await expect(refresh).toBeFocused();
    });
  });
}
