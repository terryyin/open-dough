import { expect, test } from "../../dashboard/test-support/dashboardTest.ts";
import {
  openDirection,
  parts,
  shortRevision,
} from "../../dashboard/test-support/dashboardPage.ts";
import { describedBacklog } from "../../dashboard/test-support/describedRevisions.ts";
import { openUntilRead } from "../../dashboard/test-support/pageRequestNotes.ts";
import { publishCommittedBacklog } from "../../dashboard/test-support/publishedOrigin.ts";
import { makeMe } from "../../Distribution/tests/support/makeMe.mjs";

test("published Board accepts successfully empty groups and no recorded direction", async ({
  page,
}) => {
  const { revision } = publishCommittedBacklog(
    page,
    describedBacklog(makeMe.aRepository.please()),
  );

  await openUntilRead(page);

  const { board, backlog, taken, direction, readRevision } = parts(page);
  await expect(taken).toContainText("No Taken entries are recorded.");
  await expect(taken).toContainText("0 entries");
  await expect(backlog).toContainText("No Backlog entries are recorded.");
  await expect(backlog).toContainText("0 entries");
  await expect(board.getByRole("article")).toHaveCount(0);
  await openDirection(page);
  await expect(direction).toContainText(
    "No near-future direction is recorded.",
  );
  await expect(readRevision).toContainText(shortRevision(revision));
  await expect(page.getByRole("alert")).toHaveCount(0);
});
