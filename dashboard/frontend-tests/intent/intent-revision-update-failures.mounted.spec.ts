// An offered revision whose update fails keeps the shown reading with the
// failure and Retry: at the locations and at the selected file
// (../../src/useIntentLocations.ts, ../../src/useIntentFileRead.ts), and when
// the latest settings cannot be read (../../src/IntentRevisionNotice.tsx);
// malformed latest settings replace the reading with their explanation
// (../../src/IntentLocationsUnavailable.tsx). Applying the latest:
// ./intent-revision-apply.mounted.spec.ts. Companion built-app cases:
// ./intent-revision-update-outcomes.spec.ts and
// ./intent-revision-update-boundaries.spec.ts.
import { expect, test, vi } from "vitest";
import { makeMe } from "../../../Distribution/tests/support/pageMakeMe.mjs";
import {
  at,
  featurePath,
  otherPath,
  publishedReadService,
} from "./intent-revision-read-service.mounted.ts";
import {
  click,
  intentReading,
  mountReading,
  openFeature,
  short,
  workAt,
} from "./intent-revision-reading.mounted.ts";

vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);

// The feature read at `shown` and offered at `latest`, whose Show latest waits
// on the held locations read at `latest`.
async function showLatestHeld(shown: string, latest: string) {
  const service = publishedReadService(
    new Map([
      [shown, at("Archive a job")],
      [latest, at("Purge a job")],
    ]),
  );
  const show = await mountReading(workAt(shown));
  const reading = intentReading();
  await openFeature(reading);
  await expect.poll(reading.shownSource).toContain("Scenario: Archive a job");
  await show(workAt(latest));
  const held = service.holdRead(`locations@${latest}`);
  await click(reading.showLatest);
  await expect.poll(service.held).toBe(1);
  return { service, reading, latest: held };
}

test("a failed update keeps the shown reading with its failure and Retry, which applies the update", async () => {
  const [a, c] = ["d7".repeat(20), "eb".repeat(20)];
  const { service, reading, latest } = await showLatestHeld(a, c);
  const { toggle, feature, shownSource } = reading;
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

test("an unreadable settings answer at the latest revision keeps the shown reading with Retry, which applies the update", async () => {
  const [a, c] = ["d8".repeat(20), "ef".repeat(20)];
  const { service, reading, latest } = await showLatestHeld(a, c);
  const { feature, shownSource } = reading;
  await latest.answerLocations(
    makeMe.anIntentLocationsAnswer.at(c).withUnreadableSettings().please(),
  );

  await expect
    .poll(reading.noticeText)
    .toContain(
      `Revision ${short(c)} could not be read: .planning/open-dough.json could not be read.`,
    );
  expect(reading.noticeText()).toContain(
    `New revision available — showing ${short(a)}`,
  );
  expect(reading.noticeButtons()).toEqual(["Retry"]);
  expect(shownSource()).toContain("Scenario: Archive a job");
  await expect.element(feature).toHaveAttribute("aria-pressed", "true");
  expect(reading.settingsProblem.elements()).toHaveLength(0);
  await reading.expectBrowserAt(a);

  await click(reading.retryUpdate);
  await expect.poll(shownSource).toContain("Scenario: Purge a job");
  await expect.element(reading.notice).not.toBeInTheDocument();
  await reading.expectBrowserAt(c);
  expect(service.reads).toEqual([
    `locations@${a}`,
    `${featurePath}@${a}`,
    `locations@${c}`,
    `locations@${c}`,
    `${featurePath}@${c}`,
  ]);
  expect(service.unexpected).toEqual([]);
});

test("an unusable settings file at the latest revision takes the reading's focus into its explanation", async () => {
  const [a, c] = ["d9".repeat(20), "ec".repeat(20)];
  const { service, reading, latest } = await showLatestHeld(a, c);
  await latest.answerLocations(
    makeMe.anIntentLocationsAnswer.at(c).withMalformedSettings().please(),
  );

  await expect.poll(reading.settingsPanelText).toContain("is not valid JSON");
  await expect.element(reading.settingsPanel).toHaveFocus();
  await reading.expectBrowserAt(c);
  expect(service.unexpected).toEqual([]);
});
