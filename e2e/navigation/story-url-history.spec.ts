// The published origin refuses the first story read. The built dashboard owns
// Retry, reload and the history entries for the story and ordinary Board.
import { remoteBranchHead } from "../../dashboard/server/gitTargetFetch.ts";
import { expect, test } from "../../dashboard/test-support/dashboardTest.ts";
import { doughnutRepository } from "../../dashboard/test-support/doughnutProject.ts";
import {
  notificationOrigins,
  notifiedIdentity,
  notifiedTitle,
  otherTitle,
} from "../../dashboard/test-support/notificationStoryJourney.ts";
import {
  httpErrorAnswer,
  pathsRead,
} from "../../dashboard/test-support/publishedOrigin.ts";
import { defaultRepository } from "../../dashboard/test-support/publishedOriginBasics.ts";
import { gitHubRepositoryUrl } from "../../dashboard/test-support/support/fixtureOriginRoute.ts";
import { storyHistoryPage } from "./story-url-history-page.ts";

test.use({
  viewport: { width: 1440, height: 1100 },
});

test("Retry, reload and Back restore a story URL while Forward keeps the ordinary project choice", async ({
  page,
  dashboard,
  afterGitHubStops,
}) => {
  const { other, target, restore } =
    await test.step("Given Doughnut's published work is temporarily unavailable", async () => {
      const origins = await notificationOrigins(
        page,
        afterGitHubStops,
        "Taken",
      );
      return {
        ...origins,
        restore: origins.target.answerWith("main", httpErrorAnswer(503)),
      };
    });
  await test.step("Then the two published Boards have distinct Git routes", async () => {
    const routedTrunk = (repository: string) =>
      remoteBranchHead(gitHubRepositoryUrl(repository), "refs/heads/main", {
        cwd: dashboard.home,
        env: { HOME: dashboard.home },
        maxBuffer: 4096,
      });
    expect(await routedTrunk(doughnutRepository)).toBe(target.revisions.target);
    expect(await routedTrunk(defaultRepository)).toBe(other.revisions.other);
  });
  const story = await test.step("When I open the story URL", () =>
    storyHistoryPage(page).open("doughnut", notifiedIdentity));
  await test.step("Then the destination reports a failed read", () =>
    story.showsFailedRead());
  await test.step(
    "Given Doughnut's published work is available again",
    restore,
  );
  const retried = await test.step("When I retry the destination", () =>
    story.retry());
  await test.step("Then Doughnut's story takes focus and cues its arrival", async () => {
    await retried.showsCuedDestination(
      "Doughnut",
      notifiedTitle,
      notifiedIdentity,
    );
    expect(pathsRead(target)).toContain(
      `PRODUCT-BACKLOG.md?ref=${target.revisions.target}`,
    );
  });
  const reloaded = await test.step("When I reload", () => retried.reload());
  await test.step("Then Doughnut's story is still the destination", () =>
    reloaded.showsDestination("Doughnut", notifiedTitle, notifiedIdentity));
  const chosen = await test.step("When I choose Open Dough", () =>
    reloaded.choose("Open Dough"));
  await test.step("Then I see Open Dough's Board at an ordinary project URL", async () => {
    await chosen.showsBoard("Open Dough", otherTitle);
    expect(pathsRead(other)).toContain(
      `PRODUCT-BACKLOG.md?ref=${other.revisions.other}`,
    );
  });
  const back = await test.step("When I go Back", () => chosen.back());
  await test.step("Then Doughnut's story takes focus and cues its return", () =>
    back.showsCuedDestination("Doughnut", notifiedTitle, notifiedIdentity));
  const forward = await test.step("When I go Forward", () => back.forward());
  await test.step("Then Open Dough's ordinary Board returns", () =>
    forward.showsBoard("Open Dough", otherTitle));
});
