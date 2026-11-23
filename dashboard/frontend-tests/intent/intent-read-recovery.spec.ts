// Failed Intent locations recover on the page's shared transient and rate-limit
// schedule, wait while hidden, share transient waits with published detail
// without letting healed detail clear Intent's wait
// (../../src/intentReadRecovery.tsx, ../../src/limitRecovery.ts,
// ../../src/transientRecovery.ts), and keep malformed settings visible on the
// page's Intent body until manual Retry (./intent-ci-page-mount.ts).
// Companion to ../../../e2e/intent/intent-read-boundary-recovery.spec.ts.
import { expect, test, vi } from "vitest";
import { makeMe } from "../../../Distribution/tests/support/pageMakeMe.mjs";
import type { IntentLocations } from "../../src/authenticatedIntentRead.ts";
import type { readRepositoryFileAt } from "../../src/authenticatedRead.ts";
import type { IntentReadSource } from "../../src/intentReadSource.ts";
import type { PublishedWork } from "../../src/publishedWork.ts";
import { unreadCiReads } from "../../test-support/component-mount/unreadPageReads.ts";
import { intentBrowser } from "./intent-browser-page.ts";
import { mountIntentCiPage } from "./intent-ci-page-mount.ts";
import {
  advanceToJustBefore,
  mountIntentRecovery,
  onRecoveryClock,
  publishedDetailPath,
  publishedReadStatus,
  setDocumentVisibility,
  workWithPublishedDetail,
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

function controlledLocations(work: PublishedWork) {
  let current = (): Promise<IntentLocations> =>
    Promise.reject(
      makeMe.anUnreachableAuthenticatedRead.at(work.revision).please(),
    );
  let count = 0;
  let lastReadAt = Number.NaN;
  const readSource: IntentReadSource = {
    readLocations(source, revision) {
      expect([source.id, revision]).toEqual([work.source.id, work.revision]);
      count += 1;
      lastReadAt = Date.now();
      return current();
    },
    readFile: (...[, path]) =>
      Promise.reject(new Error(`Unexpected file read for ${path}`)),
    readCandidates: () => Promise.resolve({ status: "absent" }),
  };
  return {
    readSource,
    reads: () => count,
    // The recovery clock time of the latest read, which a failed read
    // settles at.
    lastReadAt: () => lastReadAt,
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

  await advanceToJustBefore(locations.lastReadAt() + 15_000);
  expect(locations.reads()).toBe(1);
  await vi.advanceTimersByTimeAsync(251);
  await expect.poll(() => locations.reads()).toBe(2);
  await explanation.reads("could not be reached");

  for (const [wait, before] of [
    [30_000, 2],
    [60_000, 3],
    [60_000, 4],
  ] as const) {
    await advanceToJustBefore(locations.lastReadAt() + wait);
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
  const work = workWithPublishedDetail("d3".repeat(20));
  const locations = controlledLocations(work);
  let detailReads = 0;
  let firstDetailReadAt = Number.NaN;
  let detailHealthy = false;
  const detailRead: typeof readRepositoryFileAt = (source, path, revision) => {
    expect([source.id, path, revision]).toEqual([
      work.source.id,
      publishedDetailPath,
      work.revision,
    ]);
    detailReads += 1;
    if (detailReads === 1) firstDetailReadAt = Date.now();
    return detailHealthy
      ? Promise.resolve("# Queued seed\n")
      : Promise.reject(
          makeMe.anUnreachableAuthenticatedRead
            .reading(publishedDetailPath)
            .at(work.revision)
            .please(),
        );
  };

  await mountIntentRecovery(locations.readSource, work, detailRead);
  const status = publishedReadStatus();
  const explanation = intentSettingsExplanation();
  await status.showsUnansweredDetail();
  await explanation.reads("could not be reached");
  expect([detailReads, locations.reads()]).toEqual([1, 1]);

  detailHealthy = true;
  // The shared wait starts when the first of the two failed reads settles.
  await advanceToJustBefore(
    Math.min(firstDetailReadAt, locations.lastReadAt()) + 15_000,
  );
  expect([detailReads, locations.reads()]).toEqual([1, 1]);
  await vi.advanceTimersByTimeAsync(1_250);
  await expect.poll(() => [detailReads, locations.reads()]).toEqual([2, 2]);
  await status.showsNoUnansweredDetail();
  await explanation.reads("could not be reached");

  locations.pass();
  await advanceToJustBefore(locations.lastReadAt() + 30_000);
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

  await mountIntentCiPage({
    work,
    reads: { intent: locations.readSource, ci: unreadCiReads },
  });
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

  await advanceToJustBefore(noticedUntil);
  expect(locations.reads()).toBe(1);
  await vi.advanceTimersByTimeAsync(251);
  await expect.poll(() => locations.reads()).toBe(2);
  await intentBrowser().showsLocation("scripts");
  await explanation.isAbsent();
  await status.showsNoRateLimit();
});
