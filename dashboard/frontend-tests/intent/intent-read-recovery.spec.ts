// Failed Intent locations recover on the page's shared transient and rate-limit
// schedule, wait while hidden, share transient waits with published detail
// without letting healed detail clear Intent's wait, and keep malformed
// settings visible until manual Retry (../../src/intentReadRecovery.tsx,
// ../../src/limitRecovery.ts, ../../src/transientRecovery.ts).
// Companion to ../../../e2e/intent/intent-read-boundary-recovery.spec.ts.
import { expect, test, vi } from "vitest";
import { makeMe } from "../../../Distribution/tests/support/pageMakeMe.mjs";
import type { IntentLocations } from "../../src/authenticatedIntentRead.ts";
import type { readRepositoryFileAt } from "../../src/authenticatedRead.ts";
import type { IntentReadSource } from "../../src/intentReadSource.ts";
import type { PublishedWork } from "../../src/publishedWork.ts";
import { ReadProblem } from "../../src/readProblem.ts";
import { intentBrowser } from "./intent-browser-page.ts";
import {
  mountIntentRecovery,
  onRecoveryClock,
  publishedDetailPath,
  publishedReadStatus,
  setDocumentVisibility,
} from "./intent-read-recovery-page.tsx";
import { intentSettingsExplanation } from "./intent-settings-explanation-page.ts";

const configuredLocations = makeMe.anIntentLocationsAnswer
  .locating(
    makeMe.anIntentLocation
      .at("scripts")
      .ofKind("javascript", ["**/*.test.mjs"])
      .selecting("scripts/example.test.mjs")
      .please(),
  )
  .please();

const unreachable = () =>
  new ReadProblem(
    "The local authenticated read could not be reached",
    undefined,
    "transient",
  );

function controlledLocations(work: PublishedWork) {
  let current = (): Promise<IntentLocations> => Promise.reject(unreachable());
  let count = 0;
  const readSource: IntentReadSource = {
    readLocations(source, revision) {
      expect([source.id, revision]).toEqual([work.source.id, work.revision]);
      count += 1;
      return current();
    },
    readFile: (...[, path]) =>
      Promise.reject(new Error(`Unexpected file read for ${path}`)),
    readCandidates: () => Promise.resolve({ status: "absent" }),
  };
  return {
    readSource,
    reads: () => count,
    answerWith(next: () => Promise<IntentLocations>) {
      current = next;
    },
    pass() {
      current = () => Promise.resolve(configuredLocations);
    },
  };
}

test("unreachable Intent locations recover after 15, 30, 60 and 60 seconds", async () => {
  onRecoveryClock();
  const work = makeMe.aPublishedWork.ofPygardon.at("d1".repeat(20)).please();
  const locations = controlledLocations(work);
  await mountIntentRecovery(locations.readSource, work);
  const explanation = intentSettingsExplanation();
  const browser = intentBrowser();
  await explanation.reads("The local authenticated read could not be reached");
  await explanation.offersRetry();
  await publishedReadStatus().showsNoUnansweredDetail();
  expect(locations.reads()).toBe(1);

  await vi.advanceTimersByTimeAsync(14_999);
  expect(locations.reads()).toBe(1);
  await vi.advanceTimersByTimeAsync(251);
  await expect.poll(() => locations.reads()).toBe(2);
  await explanation.reads("could not be reached");

  for (const [wait, before] of [
    [30_000, 2],
    [60_000, 3],
    [60_000, 4],
  ] as const) {
    await vi.advanceTimersByTimeAsync(wait - 1_000);
    expect(locations.reads()).toBe(before);
    if (before === 4) locations.pass();
    await vi.advanceTimersByTimeAsync(1_250);
    await expect.poll(() => locations.reads()).toBe(before + 1);
    if (before < 4) await explanation.reads("could not be reached");
  }

  await browser.showsLocation("scripts");
  await browser.isAt(work.revision);
  await explanation.isAbsent();
  await vi.advanceTimersByTimeAsync(61_000);
  expect(locations.reads()).toBe(5);
});

test("Intent locations make no recovery request while hidden and ask once on reveal", async () => {
  onRecoveryClock();
  const work = makeMe.aPublishedWork.ofPygardon.at("d2".repeat(20)).please();
  const locations = controlledLocations(work);
  await mountIntentRecovery(locations.readSource, work);
  const explanation = intentSettingsExplanation();
  await explanation.reads("could not be reached");
  setDocumentVisibility("hidden");
  await vi.advanceTimersByTimeAsync(65_000);
  expect(locations.reads()).toBe(1);

  locations.pass();
  setDocumentVisibility("visible");
  await expect.poll(() => locations.reads()).toBe(2);
  await intentBrowser().showsLocation("scripts");
  await explanation.isAbsent();
  await vi.advanceTimersByTimeAsync(61_000);
  expect(locations.reads()).toBe(2);
});

test("published detail and Intent locations share a wait, and healing detail leaves Intent pending", async () => {
  onRecoveryClock();
  const work = makeMe.aPublishedWork.ofPygardon.at("d3".repeat(20)).please();
  const locations = controlledLocations(work);
  let detailReads = 0;
  let detailHealthy = false;
  const detailRead: typeof readRepositoryFileAt = (source, path, revision) => {
    expect([source.id, path, revision]).toEqual([
      work.source.id,
      publishedDetailPath,
      work.revision,
    ]);
    detailReads += 1;
    return detailHealthy
      ? Promise.resolve("# Queued seed\n")
      : Promise.reject(unreachable());
  };

  await mountIntentRecovery(locations.readSource, work, detailRead);
  const status = publishedReadStatus();
  const explanation = intentSettingsExplanation();
  await status.showsUnansweredDetail();
  await explanation.reads("could not be reached");
  expect([detailReads, locations.reads()]).toEqual([1, 1]);

  detailHealthy = true;
  await vi.advanceTimersByTimeAsync(14_000);
  expect([detailReads, locations.reads()]).toEqual([1, 1]);
  await vi.advanceTimersByTimeAsync(1_250);
  await expect.poll(() => [detailReads, locations.reads()]).toEqual([2, 2]);
  await status.showsNoUnansweredDetail();
  await explanation.reads("could not be reached");

  locations.pass();
  await vi.advanceTimersByTimeAsync(29_000);
  expect([detailReads, locations.reads()]).toEqual([2, 2]);
  await vi.advanceTimersByTimeAsync(1_250);
  await expect.poll(() => [detailReads, locations.reads()]).toEqual([2, 3]);
  await intentBrowser().showsLocation("scripts");
  await explanation.isAbsent();
});

test("malformed Intent settings stay visible until manual Retry", async () => {
  onRecoveryClock();
  const work = makeMe.aPublishedWork.ofPygardon.at("d4".repeat(20)).please();
  const locations = controlledLocations(work);
  const malformed = makeMe.anIntentLocationsAnswer
    .withMalformedSettings()
    .please();
  locations.answerWith(() => Promise.resolve(malformed));

  await mountIntentRecovery(locations.readSource, work);
  const explanation = intentSettingsExplanation();
  await explanation.reads(".planning/open-dough.json is not valid JSON");
  await vi.advanceTimersByTimeAsync(70_000);
  expect(locations.reads()).toBe(1);
  await explanation.reads(".planning/open-dough.json is not valid JSON");

  await explanation.retry();
  await expect.poll(() => locations.reads()).toBe(2);
  await explanation.reads(".planning/open-dough.json is not valid JSON");
});

test("rate-limited Intent locations reread when the standing limit ends", async () => {
  onRecoveryClock();
  const work = makeMe.aPublishedWork.ofPygardon.at("d5".repeat(20)).please();
  const locations = controlledLocations(work);
  const limited = makeMe.aRateLimitedIntentReply
    .saying("GitHub limited the rate")
    .resumingIn(15)
    .please();
  locations.answerWith(() => Promise.reject(limited));

  await mountIntentRecovery(locations.readSource, work);
  const explanation = intentSettingsExplanation();
  const status = publishedReadStatus();
  await explanation.reads("GitHub limited the rate");
  const noticedUntil = await status.noticedLimitUntil();
  expect(noticedUntil).toBe(limited.limited?.resumesAt.getTime());
  locations.pass();

  await vi.advanceTimersByTimeAsync(noticedUntil - Date.now() - 1);
  expect(locations.reads()).toBe(1);
  await vi.advanceTimersByTimeAsync(251);
  await expect.poll(() => locations.reads()).toBe(2);
  await intentBrowser().showsLocation("scripts");
  await explanation.isAbsent();
  await status.showsNoRateLimit();
});
