// A Wait for review isolated Start on its admitted story prepares the
// reporting the launch would hand its session
// (../../server/launchReportingPreparation.ts): the installed reporting command names
// a landing context bound to the story, workspace, branch, remote and target.
// The landing owner (../../server/launchLandingReporting.ts) refuses a
// submission that names another story, host, dashboard, remote or target
// without a pin or retained preparation, then prepares and records the
// story's own comparison. The handoff and capture through the installed
// publisher: ../../../e2e/launches/agent-launch-start-session-landing-context.spec.ts
// and ./declared-blank-launch-publication.spec.ts.
import path from "node:path";
import { beforeAll, expect, onTestFinished, test, vi } from "vitest";
import { LandingAuthorityBuilder } from "../../../Distribution/tests/support/launchLandingEvidenceTestData.mjs";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { materializeRepository } from "../../../Distribution/tests/support/repository-fixture.mjs";
import { settleAttempt } from "../../server/launchAttemptSettlement.ts";
import { keepAttempt, keptAttempts } from "../../server/launchAttemptStore.ts";
import { heldLandingPins } from "../../server/launchLandingGit.ts";
import { handleLanding } from "../../server/launchLandingReporting.ts";
import { attemptRun } from "../../server/launchRun.ts";
import { OwnedAttempts } from "../../server/ownedAttempts.ts";
import { mountProjectConfiguration } from "../../server/projectConfiguration.ts";
import { StartProgress } from "../../server/startProgress.ts";
import { unattachedInput } from "../../server/unattachedInput.ts";
import {
  commit,
  commonGitDir,
  git,
} from "../../test-support/support/launchLanding.ts";
import { startOrigin } from "../../test-support/support/startOrigin.ts";
import { worktree } from "../../test-support/support/startSessionLanding.ts";
import { keepStartedOrigin } from "../../test-support/support/startOriginPreparation.ts";
import { dashboardOrigin } from "../support/publisherDashboardOrigin.ts";

const source = makeMe.aPublishedSource.openDough.please();
const repository = makeMe.aRepository.please();
const text = "Tidy the README wording";

beforeAll(async () => {
  const initial = await startOrigin(repository, { host: "claude" });
  try {
    keepStartedOrigin("claude", repository, initial);
  } finally {
    initial.cleanup();
  }
});

test("a Wait for review Start hands its session a landing context bound to its story, workspace and target", async () => {
  const origin = await startOrigin(repository, { host: "claude" });
  vi.stubEnv("HOME", path.join(origin.machine, "home"));
  const unmount = mountProjectConfiguration("production");
  const accepted = makeMe.anAcceptedAttempt
    .adHocStart(
      { workspace: "isolated", landing: "review" },
      { instruction: text },
    )
    .reportingTo(dashboardOrigin)
    .please();
  const owned = new OwnedAttempts();
  const own = owned.own(accepted.request, accepted);
  let block: string | undefined;
  let input: string | undefined;
  onTestFinished(() => {
    unmount();
    vi.unstubAllEnvs();
    origin.cleanup();
  });
  await settleAttempt(owned, own, (current, notes) =>
    attemptRun(source, current, {
      notes,
      progress: new StartProgress(),
      doneMarks: { reported: () => undefined },
      native: () => ({
        launch: (...[, recording, , , established]) => {
          block = established?.handoff.formatted;
          input = unattachedInput(recording, block);
          return Promise.resolve({
            kind: "uncertain",
            reason: "unconfirmed",
            explanation: "Native confirmation is pending.",
          });
        },
      }),
    }),
  );
  const [attempt] = (await keptAttempts()) ?? [];
  const authority = attempt?.landingRepository;
  const identity =
    attempt?.publication.kind === "published"
      ? attempt.publication.identity
      : undefined;
  if (
    !attempt?.reporting ||
    authority === undefined ||
    identity === undefined ||
    input === undefined
  )
    throw new Error(
      `Expected the kept Start handoff: ${JSON.stringify(own.attempt)}`,
    );
  const prepared = attempt.reporting;
  const workspace = worktree(origin.project, "tidy-the-readme-wording");

  // The kept attempt holds the capture authority the context names.
  expect(authority).toEqual({
    repository: commonGitDir(workspace),
    workspace,
    branch: "claude/tidy-the-readme-wording",
    identity,
    remote: "origin",
    target: "refs/heads/main",
  });
  expect(prepared).toMatchObject({
    origin: dashboardOrigin,
    reference: attempt.id,
    landingContext: expect.any(String) as unknown,
  });
  const [established, reporting, story, developer] = input.split("\n\n");
  expect(established).toBe(block);
  expect(block).toMatch(/^Established session/u);
  expect(reporting).toContain(prepared.command);
  expect(reporting).toContain(
    `--landing-context '${prepared.landingContext ?? ""}'`,
  );
  expect([story, developer]).toEqual([`Taken story: ${identity}`, text]);
});

test("the landing owner refuses another story, host, dashboard or target, then prepares and records the story's own comparison", async () => {
  const identity = "SEED-A#a";
  const branch = "claude/tidy-the-readme-wording";
  const checkout = await materializeRepository(
    makeMe.aRepository
      .withRevision("base")
      .withWorkspace(branch, { from: "base" })
      .please(),
  );
  onTestFinished(async () => {
    vi.unstubAllEnvs();
    await checkout.cleanup();
  });
  vi.stubEnv("HOME", path.join(checkout.fixture, "home"));
  const { execution: workspace } = checkout;
  if (workspace === undefined) throw new Error("Missing the launch worktree.");
  const landingRepository = commonGitDir(workspace);
  const originMain = () =>
    git(workspace, "ls-remote", "origin", "refs/heads/main").slice(0, 40);
  const base = originMain();
  const revision = commit(workspace, "later.txt");
  const landing = makeMe.aLandingSubmission
    .forLaunch({ identity })
    .comparing({ base, revision })
    .please();
  const pending = makeMe.anAcceptedAttempt
    .withId(landing.reference)
    .adHocStart(
      { workspace: "isolated", landing: "review" },
      { instruction: text },
    )
    .reportingTo(dashboardOrigin)
    .capturingLanding({
      reporting: {
        origin: dashboardOrigin,
        reference: landing.reference,
        command: "report",
      },
      landingRepository: new LandingAuthorityBuilder()
        .ofRepository(landingRepository)
        .inWorktree({ workspace, branch })
        .forStory(identity)
        .please(),
    })
    .please();
  await keepAttempt({
    ...pending,
    publication: { kind: "published", identity, revision: base },
  });
  const kept = async () =>
    (await keptAttempts())?.find((entry) => entry.id === pending.id);

  // The launch's own authority guards the story, remote and target; only its
  // own host reporting to this dashboard reaches that launch at all.
  const unauthorized =
    "This is not the established launch's authorized landing.";
  const unknown = "This dashboard accepted no such reporting launch.";
  for (const [refused, dashboard, status, message] of [
    [{ ...landing, identity: undefined }, dashboardOrigin, 409, unauthorized],
    [{ ...landing, identity: "SEED-1#a" }, dashboardOrigin, 409, unauthorized],
    [{ ...landing, remote: "foreign" }, dashboardOrigin, 409, unauthorized],
    [
      { ...landing, target: "refs/heads/foreign" },
      dashboardOrigin,
      409,
      unauthorized,
    ],
    [{ ...landing, host: "codex" }, dashboardOrigin, 404, unknown],
    [landing, "http://127.0.0.1:4999", 404, unknown],
  ] as const)
    await expect(
      handleLanding(refused, dashboard, "prepare"),
    ).rejects.toMatchObject({ status, message });
  expect(await kept()).not.toHaveProperty("landingPreparations");
  expect(await heldLandingPins(landingRepository)).toEqual([]);
  expect(originMain()).toBe(base);

  const preparedReceipt = await handleLanding(
    landing,
    dashboardOrigin,
    "prepare",
  );
  expect(preparedReceipt).toMatchObject({
    state: "prepared",
    identity,
    base,
    revision,
  });
  expect((await kept())?.landingPreparations).toMatchObject([
    { base, revision, reference: pending.id },
  ]);
  const pinned = `refs/open-dough/one-shot/${pending.id}/${landing.delivery}`;
  expect(await heldLandingPins(landingRepository)).toEqual([
    { ref: `${pinned}/base`, objectId: base },
    { ref: `${pinned}/revision`, objectId: revision },
  ]);

  // Accepted on the origin before its native session's record exists: the
  // attempt keeps the accepted comparison until that record takes it.
  git(workspace, "push", "--quiet", "origin", "HEAD:refs/heads/main");
  expect(await handleLanding(landing, dashboardOrigin, "record")).toEqual({
    ...preparedReceipt,
    state: "pending-native-session",
  });
  expect((await kept())?.landing).toMatchObject({
    identity,
    base,
    revision,
    reference: pending.id,
    receipt: preparedReceipt.receipt,
  });
});
