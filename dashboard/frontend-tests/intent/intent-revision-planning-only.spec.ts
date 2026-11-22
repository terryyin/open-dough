// Accepting a newer revision still advances the browser when its files are
// unchanged and no file is selected.
import { expect, onTestFinished, test, vi } from "vitest";
import { page, userEvent } from "vitest/browser";
import { pygardonFeatures } from "../../../Distribution/tests/support/publishedFilesTestData.mjs";
import { intentBrowser } from "./intent-browser-page.ts";
import {
  featuresOpening,
  mountProjectIntent,
} from "./intent-revision-fixtures.ts";
import { intentRevisionNotice } from "./intent-revision-notice-page.ts";

test("a planning-only update advances the browser with no file selected and keeps the new reading on reopen", async () => {
  const [before, latest] = ["f1".repeat(20), "f0".repeat(20)];
  const publication = featuresOpening("Archive a job");
  let release!: () => void;
  const pending = new Promise<void>((resolve) => {
    release = resolve;
  });
  onTestFinished(release);
  const readLatest = vi.fn(async (signal: AbortSignal) => {
    await pending;
    signal.throwIfAborted();
    return publication.readLocations(signal);
  });
  const intent = await mountProjectIntent(before, {
    [before]: publication,
    [latest]: { ...publication, readLocations: readLatest },
  });
  const browser = intentBrowser();
  const file = await browser.open(pygardonFeatures.jobs);
  await file.shows("Scenario: Archive a job");
  const home = page.getByRole("tab", { name: "CI status", exact: true });
  await userEvent.click(home);
  await browser.showsNoSource();

  intent.offerRevision(latest);
  const notice = intentRevisionNotice();
  await notice.showLatest();
  await notice.reads("Updating…");
  await browser.isAt(before);
  await expect.element(home).toHaveAttribute("aria-selected", "true");
  release();

  await browser.isAt(latest);
  await notice.isGone();
  await browser.showsNoSource();
  const updated = await browser.open(pygardonFeatures.jobs);
  await updated.shows("Scenario: Archive a job");

  intent.closeReading(latest);
  await browser.isClosed();
  intent.offerRevision(latest);
  await browser.isAt(latest);
  await file.shows("Scenario: Archive a job");
  await file.isSelected();
  expect(readLatest).toHaveBeenCalledTimes(1);
});
