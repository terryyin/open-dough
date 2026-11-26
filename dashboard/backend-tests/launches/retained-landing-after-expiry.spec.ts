// Landing capture follows a launch into its retained record after startup
// expiry. The installed publisher's retry is in ./declared-blank-launch-publication.spec.ts.
import { readFileSync } from "node:fs";
import path from "node:path";
import { afterEach, beforeAll, expect, onTestFinished, test, vi } from "vitest";
import { LandingAuthorityBuilder } from "../../../Distribution/tests/support/launchLandingEvidenceTestData.mjs";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { materializeRepository } from "../../../Distribution/tests/support/repository-fixture.mjs";
import { launchRetentionDays } from "../../src/launchRecord.ts";
import { settleAttempt } from "../../server/launchAttemptSettlement.ts";
import {
  keptAttempts,
  replaceAttempts,
} from "../../server/launchAttemptStore.ts";
import { heldLandingPins } from "../../server/launchLandingGit.ts";
import {
  handleLanding,
  machineLandingStores,
} from "../../server/launchLandingReporting.ts";
import { replaceRecords } from "../../server/launchRecordDocument.ts";
import { deleteRecord, keptSession } from "../../server/launchRecordStore.ts";
import { attemptRun } from "../../server/launchRun.ts";
import { machineDashboardPath } from "../../server/machineHome.ts";
import { OwnedAttempts } from "../../server/ownedAttempts.ts";
import { mountProjectConfiguration } from "../../server/projectConfiguration.ts";
import { StartProgress } from "../../server/startProgress.ts";
import {
  commit,
  commonGitDir,
  git,
} from "../../test-support/support/launchLanding.ts";
import { startOrigin } from "../../test-support/support/startOrigin.ts";
import { keepStartedOrigin } from "../../test-support/support/startOriginPreparation.ts";
import { dashboardOrigin } from "../support/publisherDashboardOrigin.ts";

const source = makeMe.aPublishedSource.openDough.please();
const repository = makeMe.aRepository.please();
const day = 86_400_000;
const expired = (launchRetentionDays + 1) * day;
const originMain = (workspace: string) =>
  git(workspace, "ls-remote", "origin", "refs/heads/main").slice(0, 40);

beforeAll(async () => {
  const initial = await startOrigin(repository);
  try {
    keepStartedOrigin("claude", repository, initial);
  } finally {
    initial.cleanup();
  }
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllEnvs();
});

test("a bound launch's retained record records and replays the comparison prepared before its attempt expired", async () => {
  const origin = await startOrigin(repository);
  onTestFinished(() => {
    origin.cleanup();
  });
  vi.stubEnv("HOME", path.join(origin.machine, "home"));
  const unmount = mountProjectConfiguration("production");
  const acceptedAttempt = makeMe.anAcceptedAttempt
    .adHocStart(
      { workspace: "isolated", landing: "auto-land" },
      { instruction: "Session" },
    )
    .reportingTo(dashboardOrigin)
    .please();
  const host = makeMe.aHostSession
    .claude({ sessionId: "retained-session" })
    .named("Session")
    .please();
  const owned = new OwnedAttempts();
  const own = owned.own(acceptedAttempt.request, acceptedAttempt);
  try {
    await settleAttempt(owned, own, (current, notes) =>
      attemptRun(source, current, {
        notes,
        progress: new StartProgress(),
        doneMarks: { reported: () => undefined },
        native: () => ({
          launch: () =>
            Promise.resolve({
              kind: "launched",
              session: host,
              sessionState: makeMe.aSessionState.loaded("working").please(),
            }),
        }),
      }),
    );
  } finally {
    unmount();
  }
  const { attempt } = own;
  if (
    attempt.outcome?.kind !== "launched" ||
    attempt.settledAt === undefined ||
    attempt.publication.kind !== "published" ||
    attempt.publication.identity === undefined ||
    attempt.landingRepository === undefined
  )
    throw new Error(
      `Expected a settled reporting launch: ${JSON.stringify(own.attempt)}`,
    );
  const { workspace } = attempt.landingRepository;
  const base = originMain(workspace);
  const revision = commit(workspace, "retained.txt");
  const landing = makeMe.aLandingSubmission
    .forLaunch({
      reference: attempt.id,
      identity: attempt.publication.identity,
    })
    .comparing({ base, revision })
    .please();
  const settled = new Date(attempt.settledAt);
  const kept = () => keptSession(source.id, host);
  const reporting = (await kept())?.landingReporting;
  const authority = reporting?.authority;
  expect(reporting).toMatchObject({
    authority: attempt.landingRepository,
    settledAt: settled.toISOString(),
  });

  vi.useFakeTimers({ toFake: ["Date"] });
  vi.setSystemTime(settled.getTime() + day);
  const prepared = await handleLanding(landing, dashboardOrigin, "prepare");
  expect(prepared).toMatchObject({ state: "prepared", base, revision });
  const pinned = `refs/open-dough/one-shot/${attempt.id}/${landing.delivery}`;
  const pins = [
    { ref: `${pinned}/base`, objectId: base },
    { ref: `${pinned}/revision`, objectId: revision },
  ];
  expect(await heldLandingPins(authority?.repository ?? "")).toEqual(pins);

  vi.setSystemTime(settled.getTime() + expired);
  await replaceAttempts((stored) => stored);
  expect((await keptAttempts())?.map(({ id }) => id)).not.toContain(attempt.id);
  const attemptsFile = machineDashboardPath("launch-attempts.json");
  const attemptsBefore = readFileSync(attemptsFile, "utf8");

  git(workspace, "push", "--quiet", "origin", "HEAD:refs/heads/main");
  const recorded = await handleLanding(landing, dashboardOrigin, "record");
  expect(recorded).toEqual({ ...prepared, state: "recorded" });
  const accepted = (await kept())?.landing;
  expect(accepted).toEqual({
    ...authority,
    workspace: undefined,
    branch: undefined,
    reference: attempt.id,
    delivery: landing.delivery,
    base,
    revision,
    receipt: prepared.receipt,
    receivedAt: prepared.receivedAt,
  });
  expect((await kept())?.landingReporting?.preparations).toEqual([accepted]);

  expect(await handleLanding(landing, dashboardOrigin, "record")).toEqual(
    recorded,
  );
  expect(originMain(workspace)).toBe(revision);
  expect(await heldLandingPins(authority?.repository ?? "")).toEqual(pins);
  expect(readFileSync(attemptsFile, "utf8")).toBe(attemptsBefore);
});

test("a retained record refuses another story, a changed workspace or branch, and its deletion, without recreating the record", async () => {
  const branch = "claude/session";
  const identity = "SEED-A#a";
  const began = new Date();
  const checkout = await materializeRepository(
    makeMe.aRepository
      .withRevision("base")
      .withWorkspace(branch, { from: "base" })
      .please(),
  );
  onTestFinished(checkout.cleanup);
  vi.stubEnv("HOME", path.join(checkout.fixture, "home"));
  const { execution: workspace } = checkout;
  if (workspace === undefined)
    throw new Error("Missing the retained worktree.");
  const base = checkout.revisions.base;
  const revision = commit(workspace, "retained.txt");
  const landing = makeMe.aLandingSubmission
    .forLaunch({ identity })
    .comparing({ base, revision })
    .please();
  const retainedLaunch = makeMe.aLaunchRecord
    .adHoc({ title: "Session", storyIdentity: identity })
    .inIsolatedWorkspace({ workspace, branch, startingRevision: base })
    .reportingThrough({
      origin: dashboardOrigin,
      command: "report",
      reference: landing.reference,
    })
    .withLandingReporting({
      origin: dashboardOrigin,
      authority: new LandingAuthorityBuilder()
        .ofRepository(commonGitDir(workspace))
        .inWorktree({ workspace, branch })
        .forStory(identity)
        .please(),
      preparations: [],
      settledAt: began.toISOString(),
    })
    .launchedAt(began.toISOString())
    .please();
  await replaceRecords(() => ({ [source.id]: [retainedLaunch] }));
  vi.useFakeTimers({ toFake: ["Date"] });
  vi.setSystemTime(began.getTime() + expired);
  const host = retainedLaunch.session;
  const record = await keptSession(source.id, host);
  if (record?.establishedSession === undefined)
    throw new Error("Expected the retained record.");
  const unauthorized =
    "This is not the established launch's authorized landing.";
  const retained = record.landingReporting;
  if (retained === undefined) throw new Error("Expected retained reporting.");
  const changed = (change: Partial<typeof record>) => ({
    ...machineLandingStores,
    keptRecords: () => Promise.resolve([{ ...record, ...change }]),
  });
  const established = record.establishedSession;
  const moved = (change: Partial<typeof established>) =>
    changed({ establishedSession: { ...established, ...change } });
  const withdrawn = changed({
    landingReporting: { ...retained, deletedAt: began.toISOString() },
  });
  for (const [report, stores, message] of [
    [{ ...landing, identity: "SEED-1#a" }, machineLandingStores, unauthorized],
    [landing, moved({ workspace: `${workspace}-other` }), unauthorized],
    [landing, moved({ branch: "other-branch" }), unauthorized],
    [landing, withdrawn, "The reporting session was deleted."],
  ] as const)
    await expect(
      handleLanding(report, dashboardOrigin, "prepare", stores),
    ).rejects.toMatchObject({ status: 409, message });
  expect(await keptSession(source.id, host)).toEqual(record);
  expect(await heldLandingPins(retained.authority.repository)).toEqual([]);

  expect(await deleteRecord(source.id, host)).toBe(true);
  await expect(
    handleLanding(landing, dashboardOrigin, "prepare"),
  ).rejects.toMatchObject({
    status: 404,
    message: "This dashboard accepted no such reporting launch.",
  });
  expect(await keptSession(source.id, host)).toBeUndefined();
});
