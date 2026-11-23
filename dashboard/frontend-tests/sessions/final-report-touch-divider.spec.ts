import { expect, test } from "vitest";
import { userEvent } from "vitest/browser";
import { withFramePreference } from "../../test-support/component-mount/framePreferences.ts";
import { useTouchScreen } from "../navigation/board-touch-page.ts";
import { mountUnfinishedReport } from "./final-report-mount.ts";
import {
  divider,
  dividerHit,
  expectNoPrivateSessionId,
  expectReportText,
  openReport,
  panel,
  readByTouch,
  reportScroll,
  reportText,
  widenReport,
} from "./final-report-page.ts";

async function resizeReportAfterReading(
  width: number,
  height: number,
  lines: number,
) {
  withFramePreference("open-dough.sidePanel.width", null);
  await useTouchScreen();
  const text = `${Array.from(new Array<undefined>(lines).keys(), (index) => `Read native report line ${index}.`).join("\n")}\nReport ending.`;
  await mountUnfinishedReport({ width, height }, text);
  await openReport();
  await expect.element(divider).toBeVisible();
  await expectReportText(text);

  const readDivider = () => {
    const { x, y, width, height } = divider.element().getBoundingClientRect();
    return { x, y, width, height };
  };
  const before = readDivider();
  const externalHit = dividerHit(0.25);
  expect(dividerHit(0.75)).toBe(true);
  await readByTouch(reportText(text), "Report ending.");
  expect(readDivider()).toEqual(before);
  expect(reportScroll().scrollTop).toBeGreaterThan(0);
  expect(dividerHit(0.25)).toBe(externalHit);
  expect(dividerHit(0.75)).toBe(true);

  const panelWidth = () => panel.element().getBoundingClientRect().width;
  const original = panelWidth();
  await widenReport(20);
  await expect.poll(panelWidth).toBeCloseTo(original + 20, 0);
  (divider.element() as HTMLElement).focus();
  await expect.element(divider).toHaveFocus();
  await userEvent.keyboard("{ArrowRight}");
  await expect.poll(panelWidth).toBeCloseTo(original + 20 - 32, 0);
  expectNoPrivateSessionId();
  await expectReportText(text);
}

test("a landscape report keeps its divider reachable after touch reading", async () => {
  await resizeReportAfterReading(844, 390, 20);
});

test("a desktop report keeps its divider reachable after touch reading", async () => {
  await resizeReportAfterReading(1440, 900, 40);
});
