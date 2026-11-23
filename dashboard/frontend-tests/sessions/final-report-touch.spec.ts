import { expect, test } from "vitest";
import { userEvent } from "vitest/browser";
import { useTouchScreen } from "../navigation/board-touch-page.ts";
import {
  defaultReportText,
  mountUnfinishedReport,
  unfinishedReportTitle,
} from "./final-report-mount.ts";
import {
  close,
  expectReportSessionName,
  expectReportText,
  keep,
  mark,
  markAnyway,
  openReport,
  panel,
  pressReport,
  question,
  questionText,
  readByTouch,
  reportGeometry,
  reportOpener,
  reportText,
  showReportAt,
  touchReport,
} from "./final-report-page.ts";

const heading = panel.getByRole("heading", { name: unfinishedReportTitle });
function expectReadyForReview() {
  expect(
    document.querySelector(".page-column .session-state")?.textContent,
  ).toBe("Ready for review");
}

function expectReportIdentity() {
  expect(heading.element().textContent).toBe(unfinishedReportTitle);
  expectReportSessionName();
}

function expectTopBarsAligned() {
  const bars = [
    ...document.querySelectorAll(
      ".banner, .sessions-sidebar-title-row, .side-panel-header",
    ),
  ]
    .map((bar) => bar.getBoundingClientRect())
    .filter(({ height }) => height > 0);
  expect(bars).toHaveLength(2);
  expect(new Set(bars.map(({ top, bottom }) => `${top}:${bottom}`)).size).toBe(
    1,
  );
}

test("reads the question and touches each full choice through resize and rotation", async () => {
  await useTouchScreen();
  await mountUnfinishedReport({ width: 390, height: 844 });
  await openReport();
  await expect.element(heading).toHaveAccessibleName(unfinishedReportTitle);
  expectReportIdentity();

  await showReportAt(390, 320);
  const title = heading
    .getByRole("button", { name: unfinishedReportTitle })
    .element();
  expect(getComputedStyle(title).whiteSpace).toBe("nowrap");
  expect(title.scrollWidth).toBeGreaterThan(title.clientWidth);
  expectTopBarsAligned();
  expectReadyForReview();

  await touchReport(mark);
  await expect.element(keep).toHaveFocus();
  for (const [width, height] of [
    [390, 320],
    [390, 240],
    [390, 844],
    [844, 390],
    [390, 320],
  ] as const) {
    await showReportAt(width, height);
    expectReportIdentity();
    await readByTouch(questionText);
    await readByTouch(markAnyway);
    await readByTouch(keep);
    expectReadyForReview();
  }

  await touchReport(keep);
  await expect.element(question).not.toBeInTheDocument();
  await expect.element(mark).toHaveFocus();
  expectReadyForReview();
  await readByTouch(
    reportText(defaultReportText),
    "Landed on main at `a5df85d90a`.",
  );
  await readByTouch(
    reportText(defaultReportText),
    "<script>window.reportExecuted=true</script>",
  );
  expect("reportExecuted" in window).toBe(false);

  await touchReport(close);
  await expect.element(reportOpener).toHaveFocus();
  await userEvent.keyboard("{Enter}");
  await expectReportText(defaultReportText);
  await touchReport(mark);
  await readByTouch(questionText);
  await touchReport(markAnyway);
  await expect.element(panel).not.toBeInTheDocument();
});

async function restoreReportFocus(press: typeof pressReport) {
  await openReport();
  await expectReportText(defaultReportText);
  expect(reportGeometry(reportText(defaultReportText))).toMatchObject({
    visible: true,
    hit: true,
  });

  await press(mark);
  await expect.element(question).toBeVisible();
  for (const target of [questionText, markAnyway, keep]) {
    expect(reportGeometry(target)).toMatchObject({ visible: true, hit: true });
  }
  await press(keep);
  await expect.element(question).not.toBeInTheDocument();
  await expect.element(mark).toHaveFocus();
  await press(mark);
  await expect.element(keep).toHaveFocus();
  await userEvent.keyboard("{Escape}");
  await expect.element(question).not.toBeInTheDocument();
  await expect.element(mark).toHaveFocus();
  await userEvent.keyboard("{Meta>}{Shift>}{Escape}{/Shift}{/Meta}");
  await expect.element(panel).not.toBeInTheDocument();
  await expect.element(reportOpener).toHaveFocus();
}

test("a tablet keeps report reading, choices, Escape restoration and the panel shortcut", async () => {
  await useTouchScreen();
  await mountUnfinishedReport({ width: 768, height: 1024 });
  await restoreReportFocus(touchReport);
});

test("a desktop keeps report reading, choices, Escape restoration and the panel shortcut", async () => {
  await mountUnfinishedReport({ width: 1440, height: 900 });
  await restoreReportFocus(pressReport);
});
