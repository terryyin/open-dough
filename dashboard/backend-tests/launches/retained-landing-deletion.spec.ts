// Deletion after attempt expiry keeps the tombstone when pin cleanup fails,
// then removes only that launch. Late capture stays refused.
import { mkdirSync, unlinkSync, writeFileSync } from "node:fs";
import path from "node:path";
import { afterEach, beforeAll, expect, test, vi } from "vitest";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import {
  launchRetentionDays,
  type LaunchRecord,
} from "../../src/launchRecord.ts";
import { handleLanding } from "../../server/launchLandingReporting.ts";
import { heldLandingPins } from "../../server/launchLandingGit.ts";
import {
  keepAttempt,
  keptAttempts,
  replaceAttempts,
} from "../../server/launchAttemptStore.ts";
import { bindRecord } from "../../server/launchRecordBinding.ts";
import { deleteRecord } from "../../server/launchRecordDeletion.ts";
import {
  keptRecords,
  keptSession,
  updateRecord,
} from "../../server/launchRecordStore.ts";
import { commit, git } from "../../test-support/support/launchLanding.ts";
import { dashboardOrigin } from "../support/publisherDashboardOrigin.ts";
import {
  prepareRetainedOrigin,
  settleRetainedLaunch,
  source,
  unrelatedId,
} from "./retainedLandingExpiryLaunch.ts";

const day = 86_400_000;
const expired = (launchRetentionDays + 1) * day;
const laterReference = "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb";
const deleted = "The reporting session was deleted.";
const absent = "This dashboard accepted no such reporting launch.";
const unreadable = "attempt evidence is unreadable or no longer retained";

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

test("deletion after attempt expiry keeps the tombstone when pin cleanup fails, then removes only that launch", async () => {
  const { workspace, attempt, host, landing, base, settled } =
    await settleRetainedLaunch();
  const authority = attempt.landingRepository;
  const identity = landing.identity;
  if (authority === undefined || identity === undefined)
    throw new Error("Expected the retained authority.");
  vi.useFakeTimers({ toFake: ["Date"] });
  vi.setSystemTime(settled.getTime() + day);
  const prepared = await handleLanding(landing, dashboardOrigin, "prepare");
  git(workspace, "push", "--quiet", "origin", "HEAD:refs/heads/main");
  const recorded = await handleLanding(landing, dashboardOrigin, "record");
  expect(recorded).toEqual({ ...prepared, state: "recorded" });

  const laterRevision = commit(workspace, "later.txt");
  const laterLanding = makeMe.aLandingSubmission
    .forLaunch({ reference: laterReference, identity })
    .comparing({ base, revision: laterRevision })
    .please();
  const reporting = {
    origin: dashboardOrigin,
    reference: laterReference,
    command: "report",
  };
  await keepAttempt({
    ...makeMe.anAcceptedAttempt
      .withId(laterReference)
      .adHocStart(
        { workspace: "isolated", landing: "auto-land" },
        { instruction: "Later launch" },
      )
      .reportingTo(dashboardOrigin)
      .capturingLanding({ reporting, landingRepository: authority })
      .please(),
    publication: { kind: "published", identity, revision: base },
    settledAt: settled.toISOString(),
  });
  await bindRecord(
    source.id,
    makeMe.aLaunchRecord
      .adHoc({
        title: "Later launch",
        instruction: "Leave this launch",
        storyIdentity: identity,
      })
      .inIsolatedWorkspace({
        workspace: authority.workspace,
        branch: authority.branch,
        startingRevision: base,
        repository: authority.repository,
      })
      .inClaudeSession({ sessionId: "later-session" })
      .reportingThrough(reporting)
      .please(),
  );
  await handleLanding(laterLanding, dashboardOrigin, "prepare");
  git(workspace, "push", "--quiet", "origin", "HEAD:refs/heads/main");
  const laterRecorded = await handleLanding(
    laterLanding,
    dashboardOrigin,
    "record",
  );

  vi.setSystemTime(settled.getTime() + expired);
  await replaceAttempts((stored) => stored);
  expect((await keptAttempts())?.map(({ id }) => id)).toEqual([unrelatedId]);

  const repository = authority.repository;
  const ownPins = { reference: landing.reference };
  const otherPins = { reference: laterReference };
  const pinsBefore = await heldLandingPins(repository, ownPins);
  const laterPins = await heldLandingPins(repository, otherPins);
  const revisionPin = pinsBefore.find(({ ref }) => ref.endsWith("/revision"));
  if (revisionPin === undefined) throw new Error("No retained revision pin.");
  const lock = path.join(repository, `${revisionPin.ref}.lock`);
  mkdirSync(path.dirname(lock), { recursive: true });
  writeFileSync(lock, "", { flag: "wx" });
  try {
    await expect(deleteRecord(source.id, host)).rejects.toThrow(
      "cannot lock ref",
    );
  } finally {
    unlinkSync(lock);
  }

  const tombstone = await keptSession(source.id, host);
  if (tombstone === undefined)
    throw new Error("Expected the deletion tombstone.");
  expect(tombstone.landingReporting?.deletedAt).toBeDefined();
  expect(tombstone.landing?.repository).toBe(repository);
  expect(tombstone.landing?.receipt).toBe(recorded.receipt);
  expect(await heldLandingPins(repository, ownPins)).toEqual(pinsBefore);
  await expect(
    handleLanding(landing, dashboardOrigin, "record"),
  ).rejects.toMatchObject({ status: 409, message: deleted });

  const stale = clearedLanding(tombstone);
  await updateRecord(source.id, stale);
  await expect(bindRecord(source.id, stale)).rejects.toThrow(unreadable);
  expect(
    (await keptSession(source.id, host))?.landingReporting?.deletedAt,
  ).toBe(tombstone.landingReporting?.deletedAt);
  await expect(
    handleLanding(landing, dashboardOrigin, "record"),
  ).rejects.toMatchObject({ status: 409, message: deleted });

  expect(await deleteRecord(source.id, host)).toBe(true);
  expect(await heldLandingPins(repository, ownPins)).toEqual([]);
  expect(await keptSession(source.id, host)).toBeUndefined();
  const remaining = await keptRecords(source.id);
  expect(remaining).toHaveLength(1);
  expect(remaining[0]?.landing?.receipt).toBe(laterRecorded.receipt);
  expect(remaining[0]?.session.sessionId).toBe("later-session");
  expect(await heldLandingPins(repository, otherPins)).toEqual(laterPins);
  await expect(
    handleLanding(landing, dashboardOrigin, "record"),
  ).rejects.toMatchObject({ status: 404, message: absent });
  expect(await updateRecord(source.id, stale)).toBe(false);
  await expect(bindRecord(source.id, stale)).rejects.toThrow(unreadable);
  expect(await keptRecords(source.id)).toEqual(remaining);
});
