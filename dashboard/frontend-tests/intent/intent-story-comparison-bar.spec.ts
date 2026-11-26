// A Done story's comparison bar and title row: the files toggle, the
// comparison choice, Include merged changes and the one-line summary share a
// row above the files; the summary's eye opens the details, which follow the
// chosen comparison; the follow-up icon beside Notes opens the composer on the
// comparison shown, and only a readable comparison offers it.
import { expect, test } from "vitest";
import { page, userEvent } from "vitest/browser";
import { makeMe } from "../../../Distribution/tests/support/pageMakeMe.mjs";
import { launchDialog } from "../launches/ad-hoc-launch-page.ts";
import {
  controlsFit,
  expectOneRow,
  fileLayout,
} from "./intent-file-layout-page.ts";
import { intentStoryCompare } from "./intent-story-compare-page.ts";
import {
  doneCompletion,
  doneIdentity,
  openDoneStoryComparison,
} from "./intent-story-compare-stories.ts";

const oid = (digit: string) => digit.repeat(40);
const landedRun = makeMe.aReviewRun
  .keyed("captured-landing")
  .launchedAt("2026-11-01T01:00:00Z")
  .comparing(oid("1"), oid("2"))
  .please();
const launched = new Date(landedRun.launchedAt ?? "").toLocaleString();

// The Done story's published completion, recorded by `agent` and able to
// include merged changes from oid("8"), offered beside a captured landed run.
const openWithLandedRun = ({ agent = "claude" } = {}) =>
  openDoneStoryComparison({
    review: (query) =>
      Promise.resolve(
        query.run === landedRun.key
          ? makeMe.aStoryReview
              .landed()
              .adding("landed.txt")
              .onRun(landedRun)
              .please()
          : {
              ...makeMe.aStoryReview
                .published(doneCompletion)
                .by(agent)
                .adding("branch.ts")
                .please({
                  from: oid("8"),
                  changes: makeMe.aStoryReview
                    .adding("branch.ts")
                    .adding("incoming.ts"),
                }),
              runs: [landedRun],
            },
      ),
  });

const followUp = page.getByRole("button", {
  name: "Follow up on comparison",
  exact: true,
});
const notes = page.getByRole("button", { name: "Notes", exact: true });

test("the comparison controls and summary share one row above the files, and Notes and the follow-up icon sit on the title row", async () => {
  await openWithLandedRun({ agent: "Kaoru-chan" });
  await page.viewport(1280, 800);
  const story = intentStoryCompare();
  const files = fileLayout();
  await expect.poll(story.summaryPortraitBeside).toBe("Kaoru-chan");
  const row = [
    files.toggle,
    story.choice("Published completion"),
    story.includeMerged,
    story.summary,
  ];
  const boxes = expectOneRow(...row);
  const heading = story.header.element().querySelector("h2");
  expect(boxes[0]?.top).toBeGreaterThanOrEqual(
    heading?.getBoundingClientRect().bottom ?? Infinity,
  );
  const barBottom = Math.max(...boxes.map((box) => box.bottom));
  expect(
    story.viewTab("CI comparison").element().getBoundingClientRect().top,
  ).toBeGreaterThanOrEqual(barBottom);
  expect(files.browser().top).toBeGreaterThanOrEqual(barBottom);
  expect(files.browser().top - barBottom).toBeLessThanOrEqual(32);

  await expect.element(followUp).toHaveTextContent("");
  expect(followUp.elements()).toHaveLength(1);
  const titleLine = heading?.parentElement;
  expect(notes.element().closest(".intent-story-title-line")).toBe(titleLine);
  expect(followUp.element().closest(".intent-story-title-line")).toBe(
    titleLine,
  );

  await page.viewport(375, 800);
  await controlsFit(...row, notes, followUp);
});

test("the details follow the chosen comparison, and the follow-up icon opens the shown pair by keyboard and regains focus on Cancel", async () => {
  await openWithLandedRun();
  const story = intentStoryCompare();
  await expect.poll(story.summaryText).toContain("Published completion");
  expect(story.summaryPortraitBeside()).toBeUndefined();
  expect(story.details.query()).toBeNull();
  await story.openDetails();
  for (const text of ["Completed", "Baseline", "Completion"])
    await expect.poll(story.detailsText).toContain(text);
  await expect.element(story.refreshButton).toBeVisible();

  await story.includeMerged.click();
  await expect.element(story.includeMerged).toBeChecked();
  notes.element().focus();
  await userEvent.keyboard("{Tab}");
  await expect.element(followUp).toHaveFocus();
  await userEvent.keyboard("{Enter}");
  const form = launchDialog();
  await expect
    .element(
      form.dialog.getByText(new RegExp(`^Follows up ${doneIdentity} — `)),
    )
    .toBeVisible();
  await expect
    .element(
      form.dialog.getByText(
        new RegExp(`^Comparison: Published completion ${oid("8")} → `),
      ),
    )
    .toBeVisible();
  form.cancel.element().focus();
  await userEvent.keyboard("{Enter}");
  await expect.element(form.dialog).not.toBeInTheDocument();
  await expect.element(followUp).toHaveFocus();

  await story.chooseRun(landedRun.key);
  await expect.poll(story.summaryText).toContain(launched);
  await expect
    .poll(story.detailsText)
    .toContain(`From ${oid("1")} to ${oid("2")}.`);
  await expect.element(story.details).toBeVisible();
  await expect.element(story.includeMerged).not.toBeInTheDocument();
  expect(story.summaryPortraitBeside()).toBeUndefined();
});

test("an unreadable comparison is summarized, explained in the details, and offers no follow-up", async () => {
  const explanation = "Published objects are unavailable.";
  await openDoneStoryComparison({
    review: () =>
      Promise.resolve(makeMe.aStoryReview.unavailable(explanation).please()),
  });
  const story = intentStoryCompare();
  await expect.poll(story.summaryText).toContain("No comparison is available.");
  await story.openDetails();
  await expect.poll(story.detailsText).toContain(explanation);
  await expect.element(followUp).not.toBeInTheDocument();
});
