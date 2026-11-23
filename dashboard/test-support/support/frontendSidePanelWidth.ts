// A retained Default main session's review for the file sidebar width journey.

import type { Page } from "@playwright/test";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { sessionReviewChanges } from "../recentlyDoneColumn.ts";
import { reviewChangesAfter } from "../reviewChangesPage.ts";
import { wideWindow } from "../sidePanelWidthPage.ts";
import { openFrontendBoardReview } from "./frontendRecentlyDoneBoardReview.ts";
import type { FrontendServiceState } from "./frontendServiceState.ts";
import {
  frontendFileDiff,
  frontendReviewIds,
  frontendSessionCommitsReview,
  installFrontendStoryReview,
} from "./frontendStoryReview.ts";

export async function openSessionReviewForWidth(
  page: Page,
  services: FrontendServiceState,
) {
  const title = "Default main session";
  const file = "session.txt";
  const { baseline: base, tree: revision } = frontendReviewIds;
  const record = makeMe.aLaunchRecord
    .adHoc({ title })
    .keptSessionCommits({
      repository: "/tmp/default-main/.git",
      runs: [{ base, revision }],
    })
    .markedDone()
    .please();
  const answers = await installFrontendStoryReview(
    page,
    frontendSessionCommitsReview(record, [
      { kind: "added", path: file, lines: { added: 1, removed: 0 } },
    ]),
  );

  await page.setViewportSize(wideWindow);
  const { recent } = await openFrontendBoardReview(page, services, {
    doneSessions: [record],
  });
  answers.answerFile(frontendFileDiff(file, ["session work"]), file);
  const opened = await reviewChangesAfter(
    page,
    sessionReviewChanges(recent, title),
  );
  await opened.diffs.expectShows(`Added ${file}`, "+session work");
  return opened;
}
