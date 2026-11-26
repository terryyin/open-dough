// An unattached launch's kept record owns its landing capture after its
// startup attempt expires (../../server/retainedLandingDecision.ts): it
// records and replays a comparison prepared while the settled attempt was
// kept, and refuses another story, a changed workspace or branch, and a
// deleted record. The installed publisher's reporting-only retry:
// ./declared-blank-launch-publication.spec.ts and
// ../../../e2e/launches/agent-launch-start-session-landing-context.spec.ts.
import { readFileSync } from "node:fs";
import path from "node:path";
import { afterEach, beforeAll, expect, test, vi } from "vitest";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { queuedReadyRepository } from "../../../Distribution/tests/support/queued-repository.mjs";
import { launchRetentionDays } from "../../src/launchRecord.ts";
import { recordedRequest } from "../../server/hostLaunch.ts";
import {
  keepAttempt,
  keptAttempts,
  replaceAttempts,
} from "../../server/launchAttemptStore.ts";
import { heldLandingPins } from "../../server/launchLandingGit.ts";
import {
  handleLanding,
  machineLandingStores,
} from "../../server/launchLandingReporting.ts";
import { launchRecord } from "../../server/launchRecord.ts";
import { bindRecord } from "../../server/launchRecordBinding.ts";
import { deleteRecord, keptSession } from "../../server/launchRecordStore.ts";
import { prepareAttemptReporting } from "../../server/launchReportingPreparation.ts";
import { started } from "../../server/launchStart.ts";
import { localFolder } from "../../server/localFolder.ts";
import { machineDashboardPath } from "../../server/machineHome.ts";
import { StartProgress } from "../../server/startProgress.ts";
import { startStore } from "../../server/startStore.ts";
import { commit, git } from "../../test-support/support/launchLanding.ts";
import {
  startOrigin,
  type StartOrigin,
} from "../../test-support/support/startOrigin.ts";
import { keepStartedOrigin } from "../../test-support/support/startOriginPreparation.ts";
import { dashboardOrigin } from "../support/publisherDashboardOrigin.ts";

const source = makeMe.aPublishedSource.openDough.please();
const repository = queuedReadyRepository().please();
const day = 86_400_000;
const expired = (launchRetentionDays + 1) * day;
const originMain = (workspace: string) =>
  git(workspace, "ls-remote", "origin", "refs/heads/main").slice(0, 40);

let origin: StartOrigin | undefined;

beforeAll(async () => {
  const initial = await startOrigin(repository, { host: "claude" });
  try {
    keepStartedOrigin("claude", repository, initial);
  } finally {
    initial.cleanup();
  }
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllEnvs();
  origin?.cleanup();
});

// An isolated auto-land Start whose native session was bound to its kept
// record before the attempt settled, with one commit to compare on origin main.
async function boundLaunch() {
  const began = new Date();
  origin = await startOrigin(repository, { host: "claude" });
  const home = path.join(origin.machine, "home");
  vi.stubEnv("HOME", home);
  const request = makeMe.aLaunchRequest
    .adHoc()
    .withInstruction("Session")
    .withPolicy({ workspace: "isolated", landing: "auto-land" })
    .please();
  const accepted = makeMe.anAcceptedAttempt
    .requesting(request)
    .acceptedAt(began.toISOString())
    .reportingTo(dashboardOrigin)
    .please();
  const start = await started(
    source,
    request,
    localFolder("~/git/open-dough", home),
    new StartProgress(),
    {
      store: (workflow) => startStore(workflow, home),
      env: { ...process.env, HOME: home },
    },
    accepted.id,
    undefined,
    undefined,
    began,
  );
  if (start.kind !== "session" || start.publication.kind !== "published")
    throw new Error(`Expected a published session: ${JSON.stringify(start)}`);
  const reporting = await prepareAttemptReporting(
    { ...accepted, publication: start.publication },
    start,
    start.workspace,
    undefined,
    undefined,
  );
  const prepared =
    reporting.kind === "prepared" ? reporting.prepared : undefined;
  if (prepared === undefined) throw new Error("Expected reporting.");
  const attempt = { ...accepted, publication: start.publication, ...prepared };
  await keepAttempt(attempt);
  const session = start.handoff.established.establishedSession;
  const identity = start.publication.identity;
  if (session === undefined || identity === undefined)
    throw new Error("Expected an established story session.");
  const host = {
    host: "claude" as const,
    sessionId: "retained-session",
    shortId: "retained",
    name: "Session",
  };
  const requested = recordedRequest(request, began);
  if (requested.workflow !== "ad-hoc") throw new Error("Expected ad hoc.");
  await bindRecord(
    source.id,
    launchRecord(
      { ...requested, storyIdentity: identity, reporting: prepared.reporting },
      host,
      { establishedSession: session },
      began.toISOString(),
    ),
  );
  await keepAttempt({
    ...attempt,
    outcome: {
      kind: "launched",
      session: { host: "claude", sessionId: host.sessionId },
    },
    settledAt: began.toISOString(),
  });
  const workspace = session.workspace;
  const base = originMain(workspace);
  const revision = commit(workspace, "retained.txt");
  const landing = makeMe.aLandingSubmission
    .forLaunch({ reference: attempt.id, identity })
    .comparing({ base, revision })
    .please();
  return { began, attempt, host, workspace, base, revision, landing };
}

test("a bound launch's retained record records and replays the comparison prepared before its attempt expired", async () => {
  const { began, attempt, host, workspace, base, revision, landing } =
    await boundLaunch();
  const kept = () => keptSession(source.id, host);
  // The record retains the attempt's authority and its settlement.
  const authority = (await kept())?.landingReporting?.authority;
  expect((await kept())?.landingReporting).toMatchObject({
    authority: attempt.landingRepository,
    settledAt: began.toISOString(),
  });

  // A day after settlement the attempt is still kept and owns the preparation.
  vi.useFakeTimers({ toFake: ["Date"] });
  vi.setSystemTime(began.getTime() + day);
  const prepared = await handleLanding(landing, dashboardOrigin, "prepare");
  expect(prepared).toMatchObject({ state: "prepared", base, revision });
  const pinned = `refs/open-dough/one-shot/${attempt.id}/${landing.delivery}`;
  const pins = [
    { ref: `${pinned}/base`, objectId: base },
    { ref: `${pinned}/revision`, objectId: revision },
  ];
  expect(await heldLandingPins(authority?.repository ?? "")).toEqual(pins);

  // Past retention the attempt is actually dropped; the record remains.
  vi.setSystemTime(began.getTime() + expired);
  await replaceAttempts((stored) => stored);
  expect((await keptAttempts())?.map(({ id }) => id)).not.toContain(attempt.id);
  const attemptsFile = machineDashboardPath("launch-attempts.json");
  const attemptsBefore = readFileSync(attemptsFile, "utf8");

  git(workspace, "push", "--quiet", "origin", "HEAD:refs/heads/main");
  const recorded = await handleLanding(landing, dashboardOrigin, "record");
  expect(recorded).toEqual({ ...prepared, state: "recorded" });
  // The accepted landing keeps the retained authority's repository binding.
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

  // An unacknowledged reply replays the same pair without republishing Git.
  expect(await handleLanding(landing, dashboardOrigin, "record")).toEqual(
    recorded,
  );
  expect(originMain(workspace)).toBe(revision);
  expect(await heldLandingPins(authority?.repository ?? "")).toEqual(pins);
  expect(readFileSync(attemptsFile, "utf8")).toBe(attemptsBefore);
});

test("a retained record refuses another story, a changed workspace or branch, and its deletion, without recreating the record", async () => {
  const { began, host, workspace, landing } = await boundLaunch();
  vi.useFakeTimers({ toFake: ["Date"] });
  vi.setSystemTime(began.getTime() + expired);
  await replaceAttempts((stored) => stored);
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
