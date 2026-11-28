// Attempt loss inside the startup lifetime refuses without rewriting the record.
// Recording after normal expiry stays in ./retained-landing-after-expiry.spec.ts.
import { existsSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { afterEach, beforeAll, expect, test, vi } from "vitest";
import type { LandingSubmission } from "../../server/launchLandingAdmission.ts";
import { handleLanding } from "../../server/launchLandingReporting.ts";
import {
  keptAttempts,
  replaceAttempts,
} from "../../server/launchAttemptStore.ts";
import { machineDashboardPath } from "../../server/machineHome.ts";
import { dashboardOrigin } from "../support/publisherDashboardOrigin.ts";
import {
  prepareRetainedOrigin,
  settleRetainedLaunch,
  source,
  unrelatedId,
} from "./retainedLandingExpiryLaunch.ts";

const absent = "This dashboard accepted no such reporting launch.";
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

beforeAll(prepareRetainedOrigin);

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllEnvs();
});

test("missing or unreadable attempt data, or only an unrelated attempt, inside the attempt lifetime leaves the record unchanged and refuses", async () => {
  const { landing } = await settleRetainedLaunch();
  const prepared = await handleLanding(landing, dashboardOrigin, "prepare");
  expect(prepared).toMatchObject({ state: "prepared" });
  const records = readFileSync(recordsPath(), "utf8");
  const attempts = attemptsPath();
  const attemptsBytes = readFileSync(attempts, "utf8");
  rmSync(attempts);
  await recordRefused(landing, 404, absent);
  expect(existsSync(attempts)).toBe(false);
  expect(readFileSync(recordsPath(), "utf8")).toBe(records);
  writeFileSync(attempts, "unreadable attempts\n");
  await recordRefused(landing, 404, absent);
  expect(readFileSync(attempts, "utf8")).toBe("unreadable attempts\n");
  expect(readFileSync(recordsPath(), "utf8")).toBe(records);
  writeFileSync(attempts, attemptsBytes);
  await replaceAttempts((stored) => ({
    ...stored,
    [source.id]: (stored[source.id] ?? []).filter(
      (entry) => entry.id === unrelatedId,
    ),
  }));
  const onlyUnrelated = readFileSync(attempts, "utf8");
  await recordRefused(landing, 404, absent);
  expect(readFileSync(attempts, "utf8")).toBe(onlyUnrelated);
  expect(readFileSync(recordsPath(), "utf8")).toBe(records);
  expect((await keptAttempts())?.map(({ id }) => id)).toEqual([unrelatedId]);
});
