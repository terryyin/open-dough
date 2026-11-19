// Intent applies an offered published revision to an open reading: newer
// revisions wait behind one polite notice, and Show latest reads only the
// latest, keeping the old reading until it answers
// (../../src/IntentRevisionNotice.tsx, ../../src/pageIntentReading.tsx).
// A failed update keeps the reading and offers Retry, at the locations and at
// the selected file (../../src/useIntentLocations.ts,
// ../../src/useIntentFileRead.ts). Companion built-app cases:
// ./intent-revision-notice.spec.ts, ./intent-revision-update-outcomes.spec.ts.
import { expect, test, vi } from "vitest";
import {
  featurePath,
  longFeature,
  otherFeature,
  otherPath,
  publishedReadService,
  type Snapshot,
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

vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);

// A revision publishing the long feature, at its first scenario, and the other.
const at = (scenario: string): Snapshot => ({
  [featurePath]: longFeature(scenario),
  [otherPath]: otherFeature,
});

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

  await show(workAt(b));
  await show(workAt(c));
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

  await latest.release();
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
  await show(workAt(c));

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

test("a failed update keeps the shown reading with its failure and Retry, which applies the update", async () => {
  const [a, c] = ["d7".repeat(20), "eb".repeat(20)];
  const service = publishedReadService(
    new Map([
      [a, at("Archive a job")],
      [c, at("Purge a job")],
    ]),
  );
  const show = await mountReading(workAt(a));
  const reading = intentReading();
  const { toggle, feature, shownSource } = reading;
  await openFeature(reading);
  await expect.poll(shownSource).toContain("Scenario: Archive a job");
  await show(workAt(c));
  const latest = service.holdRead(`locations@${c}`);
  await click(reading.showLatest);
  await expect.poll(service.held).toBe(1);
  await reading.expectBrowserAt(a);
  await latest.fail();

  // The locations at the shown revision stay browsable, with the selection,
  // its text and the focus; the failure and Retry stand beside the notice.
  await expect
    .poll(reading.noticeText)
    .toContain(`New revision available — showing ${short(a)}`);
  expect(reading.noticeText()).toContain(
    `Revision ${short(c)} could not be read: The local authenticated read could not be reached`,
  );
  expect(reading.noticeText()).not.toContain("Updating…");
  expect(reading.noticeButtons()).toEqual(["Retry"]);
  await reading.expectBrowserAt(a);
  expect(shownSource()).toContain("Scenario: Archive a job");
  await expect.element(feature).toHaveAttribute("aria-pressed", "true");
  await expect.element(feature).toHaveFocus();
  await expect.element(toggle).toHaveAttribute("aria-expanded", "true");
  await click(reading.otherFile);
  await expect.poll(reading.otherSource).toContain("Report free space");
  await click(feature);
  await expect.poll(shownSource).toContain("Scenario: Archive a job");

  // The selected file's read at the latest revision fails too: its earlier
  // text stays under the failure, and its own Retry reads it.
  const latestText = service.holdRead(`${featurePath}@${c}`);
  await click(reading.retryUpdate);
  await expect.poll(service.held).toBe(2);
  await reading.expectBrowserAt(c);
  await expect.element(reading.notice).not.toBeInTheDocument();
  await expect.element(feature).toHaveFocus();
  await latestText.fail();
  await expect
    .poll(() => reading.readFailure.query()?.textContent)
    .toBe(
      `${featurePath} could not be read at revision ${short(c)}; showing ${short(a)}. Retry`,
    );
  expect(shownSource()).toContain("Scenario: Archive a job");
  await reading.expectBrowserAt(c);
  await click(reading.retryRead);
  await expect.poll(shownSource).toContain("Scenario: Purge a job");
  await expect.element(reading.readFailure).not.toBeInTheDocument();
  expect(service.reads.slice(2)).toEqual([
    `locations@${c}`,
    `${otherPath}@${a}`,
    `locations@${c}`,
    `${featurePath}@${c}`,
    `${featurePath}@${c}`,
  ]);
  expect(service.unexpected).toEqual([]);
});
