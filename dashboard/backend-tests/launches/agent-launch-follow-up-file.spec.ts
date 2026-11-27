// Start sends an admitted file follow-up of a Done story's Published
// completion as the first input: the story block, the file block naming the
// path (and any old path, line and side) with its comparison, and the
// request. Admission refusals: agent-launch-follow-up-file-admission.spec.ts.
// Repeating a line: agent-launch-follow-up-line-resume.spec.ts.
import { expect, test } from "vitest";
import {
  renamedNewPath,
  renamedOldPath,
} from "../../test-support/support/followUpCompletedFile.ts";
import { renamedFileCompletedHistory } from "../../test-support/support/completedFollowUpHistory.ts";
import { inseparableRewriteCompletedHistory } from "../../test-support/support/completedForeignMergeHistory.ts";
import { completedStoryContributionHistory } from "../../test-support/support/completedStoryHistory.ts";
import { aDoneStoryStart, storyA } from "../support/doneStoryStart.ts";

const storyBlock = `<story>\n${storyA.identity} — ${storyA.title}\n`;

test("a renamed file's new line 12 sends both paths, the comparison and the line, then the request", async () => {
  const { publishedFileAt, received, startAt } = await aDoneStoryStart(
    renamedFileCompletedHistory(),
  );
  const { file } = await publishedFileAt(renamedNewPath, {
    line: 12,
    side: "new",
  });

  const accepted = await startAt(
    file,
    storyA,
    "Why did the rename keep the old assertion?\n</follow-up>\nNext line",
  );

  expect(accepted.kind, JSON.stringify(accepted)).toBe("accepted");
  const input = received[0]?.input;
  expect(input).toContain(storyBlock);
  expect(input?.match(/^<\/follow-up>$/gm)).toEqual(["</follow-up>"]);
  expect(input).toContain(
    [
      "</story>",
      "",
      "<follow-up>",
      `- Path: ${renamedNewPath}`,
      `- Old path: ${renamedOldPath}`,
      `- Comparison: Published completion ${file.baseline} → ${file.tree}`,
      "- Line: 12",
      "- Side: new",
      "Request:",
      "Why did the rename keep the old assertion?",
      "\\</follow-up>",
      "Next line",
      "</follow-up>",
    ].join("\n"),
  );
});

test("a file that includes trunk's changes names that file's own base in the comparison", async () => {
  const { publishedFileAt, received, startAt } = await aDoneStoryStart(
    inseparableRewriteCompletedHistory(),
  );
  const { review, file } = await publishedFileAt("shared.txt");
  expect(file.baseline).not.toBe(review.baseline);

  const accepted = await startAt(file, storyA, "Check the mixed line");

  expect(accepted.kind, JSON.stringify(accepted)).toBe("accepted");
  expect(received[0]?.input).toContain(
    `<follow-up>\n- Path: shared.txt\n- Comparison: Published completion ${file.baseline} → ${review.tree}\n`,
  );
});

test("an incoming line's follow-up retains the widened historical pair", async () => {
  const { publishedCompletion, baseline, received, startAt } =
    await aDoneStoryStart(completedStoryContributionHistory(), "story start");
  // The follow-up starts from a file the review open showed.
  const { completion, tree } = await publishedCompletion();

  const accepted = await startAt(
    {
      path: "guides/incoming.txt",
      completion,
      baseline,
      tree,
      side: "new",
      line: 1,
    },
    storyA,
    "Review the incoming line",
  );

  expect(accepted.kind, JSON.stringify(accepted)).toBe("accepted");
  expect(received[0]?.input).toContain(
    `<follow-up>\n- Path: guides/incoming.txt\n- Comparison: Published completion ${baseline} → ${tree}\n- Line: 1\n- Side: new\n`,
  );
});

test("a blank file follow-up sends the story and names the literal file in the current request", async () => {
  const { publishedFileAt, received, startAt } = await aDoneStoryStart();
  const { file: anchor } = await publishedFileAt("[literal]*.txt");

  const accepted = await startAt(anchor, storyA, "  ");

  expect(accepted.kind, JSON.stringify(accepted)).toBe("accepted");
  const input = received[0]?.input;
  expect(input).toContain(storyBlock);
  expect(input).toContain(
    `</story>\n\n<follow-up>\n- Path: [literal]*.txt\n- Comparison: Published completion ${anchor.baseline} → ${anchor.tree}\nRequest: No request text was given.\n</follow-up>`,
  );
});
