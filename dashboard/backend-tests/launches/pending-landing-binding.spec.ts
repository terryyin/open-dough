// A prepared comparison can be accepted before native identity. handleLanding
// reserves it; bindRecord imports that pair and the accumulated reporting.
// Completion and other launches stay independent, including an older replay.
import path from "node:path";
import { expect, onTestFinished, test, vi } from "vitest";
import { LandingAuthorityBuilder } from "../../../Distribution/tests/support/launchLandingEvidenceTestData.mjs";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { materializeRepository } from "../../../Distribution/tests/support/repository-fixture.mjs";
import { deliverCompletion } from "../../server/completionDelivery.ts";
import { keepAttempt, keptAttempts } from "../../server/launchAttemptStore.ts";
import { handleLanding } from "../../server/launchLandingReporting.ts";
import { bindRecord } from "../../server/launchRecordBinding.ts";
import { keptRecords } from "../../server/launchRecordStore.ts";
import { completionSchema } from "../../src/completionReport.ts";
import {
  commit,
  commonGitDir,
  git,
} from "../../test-support/support/launchLanding.ts";
import { dashboardOrigin } from "../support/publisherDashboardOrigin.ts";

const source = makeMe.aPublishedSource.openDough.please();
const settledAt = "2026-11-28T01:02:00.000Z";
const earlyMessage = "Landing accepted; publication finish duties remain.";
const laterMessage =
  "Publication finish duties settled; retain the review reminder.";

test("a landing accepted before native binding imports that pair and keeps completion independent of its receipt", async () => {
  const identity = "SEED-413#pending";
  const branch = "claude/pending-landing";
  const checkout = await materializeRepository(
    makeMe.aRepository
      .withRevision("base")
      .withWorkspace(branch, { from: "base" })
      .please(),
  );
  onTestFinished(async () => {
    vi.useRealTimers();
    vi.unstubAllEnvs();
    await checkout.cleanup();
  });
  vi.stubEnv("HOME", path.join(checkout.fixture, "home"));
  const { execution: workspace } = checkout;
  if (workspace === undefined) throw new Error("Missing the launch worktree.");
  const repository = commonGitDir(workspace);
  const base = git(workspace, "ls-remote", "origin", "refs/heads/main").slice(
    0,
    40,
  );
  const revision = commit(workspace, "before-native-binding.txt");
  const landing = makeMe.aLandingSubmission
    .forLaunch({ identity })
    .comparing({ base, revision })
    .please();
  const authority = new LandingAuthorityBuilder()
    .ofRepository(repository)
    .inWorktree({ workspace, branch })
    .forStory(identity)
    .please();
  const reporting = {
    origin: dashboardOrigin,
    reference: landing.reference,
    command: "report",
  };
  const pending = makeMe.anAcceptedAttempt
    .withId(landing.reference)
    .adHocStart(
      { workspace: "isolated", landing: "review" },
      { instruction: "Land before the session" },
    )
    .reportingTo(dashboardOrigin)
    .capturingLanding({ reporting, landingRepository: authority })
    .please();
  await keepAttempt({
    ...pending,
    publication: { kind: "published", identity, revision: base },
  });
  const other = makeMe.aLaunchRecord
    .adHoc({ title: "Other launch", instruction: "Leave this launch alone" })
    .inClaudeSession({ sessionId: "other-session" })
    .please();
  await bindRecord(source.id, other);
  const [untouched] = await keptRecords(source.id);
  if (untouched === undefined) throw new Error("Missing the other launch.");
  const records = () => keptRecords(source.id);
  const attempt = async () =>
    (await keptAttempts())?.find((entry) => entry.id === pending.id);
  const boundLaunch = async () =>
    (await records()).find(
      (entry) => entry.request.reporting?.reference === pending.id,
    );

  vi.useFakeTimers({ toFake: ["Date"] });
  vi.setSystemTime(new Date("2026-11-28T01:00:00.000Z"));
  const prepared = await handleLanding(landing, dashboardOrigin, "prepare");
  git(workspace, "push", "--quiet", "origin", "HEAD:refs/heads/main");
  const pendingReceipt = await handleLanding(
    landing,
    dashboardOrigin,
    "record",
  );
  expect(pendingReceipt).toEqual({
    ...prepared,
    state: "pending-native-session",
  });
  const reserved = (await attempt())?.landing;
  expect(reserved).toMatchObject({
    reference: pending.id,
    base,
    revision,
    receipt: prepared.receipt,
  });
  expect(await records()).toEqual([untouched]);
  expect(await handleLanding(landing, dashboardOrigin, "record")).toEqual(
    pendingReceipt,
  );
  expect(await records()).toEqual([untouched]);

  const held = await attempt();
  if (held?.landing === undefined || held.landingPreparations === undefined)
    throw new Error("No reserved landing");
  await keepAttempt({ ...held, settledAt });
  const completion = (outcome: "unfinished" | "completed", message: string) =>
    deliverCompletion(
      makeMe.aCompletionSubmission
        .reportingFor({ host: "claude", reference: pending.id })
        .withOutcome(outcome)
        .saying(message)
        .please(),
      dashboardOrigin,
      { reported: () => undefined },
    );
  const early = await completion("unfinished", earlyMessage);
  expect(early).toMatchObject({
    state: "pending-native-session",
    outcome: "unfinished",
    message: earlyMessage,
  });
  expect(await handleLanding(landing, dashboardOrigin, "record")).toEqual(
    pendingReceipt,
  );
  expect(await records()).toEqual([untouched]);

  const native = makeMe.aLaunchRecord
    .adHoc({
      title: "Pending landing",
      instruction: "Land before the session",
      storyIdentity: identity,
    })
    .inIsolatedWorkspace({
      workspace,
      branch,
      startingRevision: base,
      repository,
    })
    .inClaudeSession({ sessionId: "pending-session" })
    .reportingThrough(reporting)
    .please();
  await bindRecord(source.id, native);
  const bound = await boundLaunch();
  expect(bound?.landing).toEqual(held.landing);
  expect(bound?.landingReporting).toEqual({
    origin: dashboardOrigin,
    authority,
    preparations: held.landingPreparations,
    settledAt,
  });
  expect(bound?.completion).toEqual(completionSchema.parse(early));
  expect(bound?.doneAt).toBeUndefined();
  expect(
    (await records()).find(
      (entry) => entry.session.sessionId === "other-session",
    ),
  ).toEqual(untouched);

  const recorded = await handleLanding(landing, dashboardOrigin, "record");
  expect(recorded).toEqual({ ...pendingReceipt, state: "recorded" });
  const newer = await completion("completed", laterMessage);
  expect(await handleLanding(landing, dashboardOrigin, "record")).toEqual(
    recorded,
  );
  const finished = await boundLaunch();
  expect(finished?.landing?.receipt).toBe(recorded.receipt);
  expect(finished?.completion).toMatchObject({
    receipt: newer.receipt,
    outcome: "completed",
    message: laterMessage,
  });

  await bindRecord(source.id, {
    ...native,
    landing: undefined,
    landingReporting: undefined,
  });
  const afterReplay = await records();
  expect(
    afterReplay.find((entry) => entry.session.sessionId === "other-session"),
  ).toEqual(untouched);
  const kept = afterReplay.find(
    (entry) => entry.request.reporting?.reference === pending.id,
  );
  expect(kept?.landing).toEqual(held.landing);
  expect(kept?.completion?.receipt).toBe(newer.receipt);
  expect(kept?.completion?.message).toBe(laterMessage);
  expect(await handleLanding(landing, dashboardOrigin, "record")).toEqual(
    recorded,
  );
});
