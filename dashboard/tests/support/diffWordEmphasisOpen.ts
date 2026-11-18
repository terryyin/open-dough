// Opens a story-review file diff for word-emphasis journeys: a plain path
// with no grammar tokens, or the shared `limit.ts` diff read through its lines.

import { expect } from "./frontendApp.ts";
import { frontendReviewSnapshot } from "./frontendStoryReview.ts";
import { openFrontendStoryReview } from "./frontendStoryReviewOpen.ts";
import { fileDiff, fileRow } from "./reviewTreeRows.ts";
import { limitDiff, limitText } from "./diffWordEmphasisFixtures.ts";
import { storyReviewDiff } from "./reviewDiffSyntax.ts";

type ReviewPage = Parameters<typeof openFrontendStoryReview>[0];
type FrontendServices = Parameters<typeof openFrontendStoryReview>[1];

export async function openPlainWordEmphasisDiff(
  page: ReviewPage,
  frontendServices: FrontendServices,
  path: string,
  diff: ReturnType<typeof limitDiff>,
  text: typeof limitText,
  lines: { added: number; removed: number },
) {
  const { review } = await openFrontendStoryReview(
    page,
    frontendServices,
    frontendReviewSnapshot({
      files: [{ kind: "modified" as const, path, lines }],
    }),
    (answers) => {
      answers.answerFile(diff, path);
      answers.answerFileText(text, path);
    },
  );
  await fileRow(review, `Modified ${path}`).click();
  const diffPane = storyReviewDiff(fileDiff(review, `Modified ${path}`));
  await expect(diffPane.codeTokens()).toHaveCount(0);
  return diffPane;
}

export async function openLimitTsWordEmphasisDiff(
  page: ReviewPage,
  frontendServices: FrontendServices,
) {
  const path = "limit.ts";
  const { review } = await openFrontendStoryReview(
    page,
    frontendServices,
    frontendReviewSnapshot({
      files: [
        { kind: "modified" as const, path, lines: { added: 1, removed: 1 } },
      ],
    }),
    (answers) => {
      answers.answerFile(limitDiff(path), path);
      answers.answerFileText(limitText, path);
    },
  );
  await fileRow(review, `Modified ${path}`).click();
  return storyReviewDiff(fileDiff(review, `Modified ${path}`));
}
