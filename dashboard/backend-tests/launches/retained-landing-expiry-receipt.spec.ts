// An aged retained record keeps its original receipt. Recording after normal
// expiry stays in ./retained-landing-after-expiry.spec.ts.
import { readFileSync } from "node:fs";
import { afterEach, beforeAll, expect, test, vi } from "vitest";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import {
  launchRetentionDays,
  type LaunchRecord,
} from "../../src/launchRecord.ts";
import { deliverCompletion } from "../../server/completionDelivery.ts";
import type { LandingSubmission } from "../../server/launchLandingAdmission.ts";
import { handleLanding } from "../../server/launchLandingReporting.ts";
import { bindRecord } from "../../server/launchRecordBinding.ts";
import {
  keptAttempts,
  replaceAttempts,
} from "../../server/launchAttemptStore.ts";
import {
  keptRecords,
  keptSession,
  replaceKeptSession,
  setRecordDoneAt,
  updateRecord,
} from "../../server/launchRecordStore.ts";
import { machineDashboardPath } from "../../server/machineHome.ts";
import { git, refs } from "../../test-support/support/launchLanding.ts";
import { dashboardOrigin } from "../support/publisherDashboardOrigin.ts";
import {
  prepareRetainedOrigin,
  settleRetainedLaunch,
  source,
  unrelatedId,
} from "./retainedLandingExpiryLaunch.ts";

const day = 86_400_000;
const expired = (launchRetentionDays + 1) * day;
const absent = "This dashboard accepted no such reporting launch.";
const unauthorized = "This is not the established launch's authorized landing.";
const attemptsPath = () => machineDashboardPath("launch-attempts.json");
const recordsPath = () => machineDashboardPath("agent-launches.json");

const recordRefused = (
  report: LandingSubmission,
  status: number,
  message: string,
) =>
  expect(
    handleLanding(report, dashboardOrigin, "record"),
  ).rejects.toMatchObject({ status, message });

const clearedLanding = (record: LaunchRecord): LaunchRecord =>
  Object.fromEntries(
    Object.entries(record).filter(
      ([key]) => key !== "landing" && key !== "landingReporting",
    ),
  ) as LaunchRecord;

beforeAll(prepareRetainedOrigin);

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllEnvs();
});

test("the original receipt survives a stale write and a native replacement, while an expired record stays read-only and is not recreated", async () => {
  const { workspace, attempt, host, landing, base, settled } =
    await settleRetainedLaunch();
  vi.useFakeTimers({ toFake: ["Date"] });
  vi.setSystemTime(settled.getTime() + day);
  const prepared = await handleLanding(landing, dashboardOrigin, "prepare");
  const completion = await deliverCompletion(
    makeMe.aCompletionSubmission
      .reportingFor({ host: "claude", reference: attempt.id })
      .withOutcome("unfinished")
      .saying("Finish duties remain.")
      .please(),
    dashboardOrigin,
    { reported: () => undefined },
  );
  vi.setSystemTime(settled.getTime() + expired);
  await replaceAttempts((stored) => stored);
  expect((await keptAttempts())?.map(({ id }) => id)).toEqual([unrelatedId]);
  git(workspace, "push", "--quiet", "origin", "HEAD:refs/heads/main");
  const recorded = await handleLanding(landing, dashboardOrigin, "record");
  expect(recorded).toEqual({ ...prepared, state: "recorded" });
  const captured = await keptSession(source.id, host);
  if (captured?.landing === undefined)
    throw new Error("Expected the retained landing.");
  expect(captured.landing.receipt).toBe(recorded.receipt);
  expect(captured.completion?.receipt).toBe(completion.receipt);
  await updateRecord(source.id, clearedLanding(captured));
  const afterStale = await keptSession(source.id, host);
  expect(afterStale?.landing).toEqual(captured.landing);
  expect(afterStale?.landingReporting).toEqual(captured.landingReporting);
  expect(afterStale?.completion).toEqual(captured.completion);
  if (afterStale === undefined)
    throw new Error("Expected the stale write to keep the record.");
  const session = {
    ...afterStale.session,
    sessionId: "replacement-conversation",
  };
  await replaceKeptSession(source.id, afterStale.session, {
    ...clearedLanding(afterStale),
    session,
  });
  const replaced = await keptSession(source.id, session);
  expect(replaced?.landing).toEqual(captured.landing);
  expect(replaced?.landingReporting).toEqual(captured.landingReporting);
  expect(await handleLanding(landing, dashboardOrigin, "record")).toEqual(
    recorded,
  );
  await expect(
    bindRecord(source.id, { ...clearedLanding(afterStale), session }),
  ).rejects.toThrow("attempt evidence is unreadable or no longer retained");
  if (replaced?.request.workflow !== "ad-hoc")
    throw new Error("Expected the ad hoc record.");
  await recordRefused({ ...landing, source: "other-project" }, 404, absent);
  expect(await keptSession(source.id, session)).toEqual(replaced);
  await updateRecord(source.id, {
    ...replaced,
    request: { ...replaced.request, storyIdentity: "SEED-413#other" },
  });
  await recordRefused(landing, 409, unauthorized);
  await updateRecord(source.id, replaced);
  const storyIdentity =
    replaced.request.storyIdentity ?? landing.identity ?? "SEED-413#expiry";
  await updateRecord(source.id, {
    ...replaced,
    request: {
      source: source.id,
      identity: storyIdentity,
      title: replaced.request.title,
      workflow: "execution",
      host: replaced.request.host,
      ...(replaced.request.reporting === undefined
        ? {}
        : { reporting: replaced.request.reporting }),
    },
  });
  await recordRefused(landing, 409, unauthorized);
  await updateRecord(source.id, replaced);
  expect(await keptSession(source.id, session)).toEqual(replaced);
  await setRecordDoneAt(
    source.id,
    session,
    new Date(Date.now() + 31 * day).toISOString(),
  );
  const recordsBefore = readFileSync(recordsPath(), "utf8");
  const attemptsBefore = readFileSync(attemptsPath(), "utf8");
  const refsBefore = refs(workspace);
  vi.setSystemTime(Date.now() + 62 * day);
  await recordRefused(landing, 404, absent);
  expect(readFileSync(recordsPath(), "utf8")).toBe(recordsBefore);
  expect(readFileSync(attemptsPath(), "utf8")).toBe(attemptsBefore);
  expect(refs(workspace)).toBe(refsBefore);
  await updateRecord(source.id, replaced);
  expect(await keptRecords(source.id)).toEqual([]);
  await recordRefused(landing, 404, absent);
  expect(await keptRecords(source.id)).toEqual([]);
  expect((await keptAttempts())?.map(({ id }) => id)).toEqual([unrelatedId]);
  expect(git(workspace, "cat-file", "-t", base)).toBe("commit");
});
