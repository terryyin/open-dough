// Intent applies an offered published revision to an open reading: newer
// revisions wait behind one polite notice, and Show latest reads only the
// latest, keeping the old reading until it answers
// (../../src/IntentRevisionNotice.tsx, ../../src/pageIntentReading.tsx).
// Failed, unreadable and malformed-settings updates:
// ./intent-revision-update-failures.mounted.spec.ts.
// Companion built-app case: ./intent-revision-notice.spec.ts.
import { expect, test } from "vitest";
import {
  at,
  featurePath,
  otherFeature,
  otherPath,
  publishedReadService,
} from "./intent-revision-read-service.mounted.ts";
import {
  click,
  intentReading,
  mountReading,
  openFeature,
  scrollReadingHalfway,
  short,
  workAt,
} from "./intent-revision-reading.mounted.ts";

test("newer revisions wait behind one notice, and Show latest keeps the reading while the latest is read", async () => {
  const [a, b, c] = ["d4".repeat(20), "e7".repeat(20), "e8".repeat(20)];
  const service = publishedReadService(
    new Map([
      [a, at("Archive a job")],
      [b, at("Restore a job")],
      [c, at("Purge a job")],
    ]),
  );
  const show = await mountReading(workAt(a));
  const reading = intentReading();
  const { toggle, feature, shownSource, notice } = reading;
  await openFeature(reading);
  await expect.poll(shownSource).toContain("Scenario: Archive a job");
  const { pane, scrolled } = await scrollReadingHalfway();
  // The expanded group, the selected feature and the pane's scroll stay.
  const expectReadingKept = async () => {
    await expect.element(toggle).toHaveAttribute("aria-expanded", "true");
    await expect.element(feature).toHaveAttribute("aria-pressed", "true");
    expect(pane.scrollTop).toBe(scrolled);
  };
  const focused = () => document.activeElement?.textContent ?? "";
  const focusedBefore = focused();
  await reading.expectBrowserAt(a);
  expect(service.reads).toEqual([`locations@${a}`, `${featurePath}@${a}`]);

  show(workAt(b));
  show(workAt(c));
  await expect.element(notice).toBeInTheDocument();
  expect(notice.elements()).toHaveLength(1);
  await expect.element(notice).toHaveAttribute("aria-live", "polite");
  await expect
    .poll(reading.noticeText)
    .toContain(`New revision available — showing ${short(a)}`);
  expect(reading.noticeButtons()).toEqual(["Show latest"]);
  await reading.expectBrowserAt(a);
  expect(focused()).toBe(focusedBefore);
  await expect.poll(shownSource).toContain("Scenario: Archive a job");
  await expectReadingKept();
  expect(service.reads).toHaveLength(2);

  const latest = service.holdRead(`locations@${c}`);
  await click(reading.showLatest);
  await expect.poll(service.held).toBe(1);
  await expect.poll(reading.noticeText).toContain("Updating…");
  await reading.expectBrowserAt(a);
  await expect.poll(shownSource).toContain("Scenario: Archive a job");
  await expect.element(feature).toHaveAttribute("aria-pressed", "true");

  latest.release();
  await expect.poll(shownSource).toContain("Scenario: Purge a job");
  await expect.element(notice).not.toBeInTheDocument();
  await reading.expectBrowserAt(c);
  await expectReadingKept();
  await expect.element(feature).toHaveFocus();
  expect(service.reads.slice(2)).toEqual([
    `locations@${c}`,
    `${featurePath}@${c}`,
  ]);
  expect(service.unexpected).toEqual([]);
});

test("a selected feature the latest revision deleted is explained, with nothing else selected", async () => {
  const [a, c] = ["d6".repeat(20), "e9".repeat(20)];
  const service = publishedReadService(
    new Map([
      [a, at("Archive a job")],
      [c, { [otherPath]: otherFeature }],
    ]),
  );
  const show = await mountReading(workAt(a));
  const reading = intentReading();
  await openFeature(reading);
  await expect.poll(reading.shownSource).toContain("Scenario: Archive a job");
  show(workAt(c));

  await click(reading.showLatest);
  await expect
    .poll(() => reading.purpose.query()?.textContent)
    .toContain(`${featurePath} is not in revision ${short(c)}`);
  await expect.element(reading.otherFile).toBeVisible();
  expect(reading.pressedFiles()).toHaveLength(0);
  expect(reading.sources.elements()).toHaveLength(0);
  const pane = reading.readingPane();
  expect(pane).not.toBeNull();
  await expect.poll(() => document.activeElement).toBe(pane);
  await reading.expectBrowserAt(c);
  expect(service.reads).toEqual([
    `locations@${a}`,
    `${featurePath}@${a}`,
    `locations@${c}`,
  ]);
  expect(service.unexpected).toEqual([]);
});
