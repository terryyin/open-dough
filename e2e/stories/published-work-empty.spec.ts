import { makeMe } from "../../Distribution/tests/support/makeMe.mjs";
import { expect, test } from "../../dashboard/test-support/dashboardTest.ts";
import {
  expectPublishedRevision,
  openDirection,
  parts,
} from "../../dashboard/test-support/dashboardPage.ts";
import { describedBacklog } from "../../dashboard/test-support/describedRevisions.ts";
import { openUntilRead } from "../../dashboard/test-support/pageRequestNotes.ts";
import {
  commitAnswer,
  publishOrigin,
  rawFileAnswer,
} from "../../dashboard/test-support/publishedOrigin.ts";

test("published Board accepts successfully empty groups and no recorded direction", async ({
  page,
}) => {
  const revision = "4f2a9c1e7b3d5a6089c0d1e2f3a4b5c6d7e8f901";
  const { board, backlog, taken, direction } = parts(page);

  await test.step("Given the published backlog contains no stories or direction", () =>
    publishOrigin(page, {
      ref: commitAnswer(revision),
      backlog: {
        revision,
        answer: rawFileAnswer(describedBacklog(makeMe.aRepository.please())),
      },
    }));
  await test.step("When I open the dashboard and read the published work", () =>
    openUntilRead(page));
  await test.step("Then the Taken column is empty", async () => {
    await expect(taken).toContainText("No Taken entries are recorded.");
    await expect(taken).toContainText("0 entries");
  });
  await test.step("And the Backlog column is empty", async () => {
    await expect(backlog).toContainText("No Backlog entries are recorded.");
    await expect(backlog).toContainText("0 entries");
    await expect(board.getByRole("article")).toHaveCount(0);
  });
  await test.step("When I open the published direction", () =>
    openDirection(page));
  await test.step("Then the current revision has no recorded direction or read failure", async () => {
    await expect(direction).toContainText(
      "No near-future direction is recorded.",
    );
    await expectPublishedRevision(page, revision);
    await expect(page.getByRole("alert")).toHaveCount(0);
  });
});
