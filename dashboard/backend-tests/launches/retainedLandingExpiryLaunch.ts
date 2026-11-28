// Settles one retained launch for the expiry refusal specs. The specs call
// handleLanding themselves.
import path from "node:path";
import { onTestFinished, vi } from "vitest";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { settleAttempt } from "../../server/launchAttemptSettlement.ts";
import { keepAttempt } from "../../server/launchAttemptStore.ts";
import { attemptRun } from "../../server/launchRun.ts";
import { OwnedAttempts } from "../../server/ownedAttempts.ts";
import { mountProjectConfiguration } from "../../server/projectConfiguration.ts";
import { StartProgress } from "../../server/startProgress.ts";
import { commit, git } from "../../test-support/support/launchLanding.ts";
import { startOrigin } from "../../test-support/support/startOrigin.ts";
import { keepStartedOrigin } from "../../test-support/support/startOriginPreparation.ts";
import { dashboardOrigin } from "../support/publisherDashboardOrigin.ts";

export const source = makeMe.aPublishedSource.openDough.please();
export const unrelatedId = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";
const repository = makeMe.aRepository.please();

export const prepareRetainedOrigin = async () => {
  const initial = await startOrigin(repository);
  try {
    keepStartedOrigin("claude", repository, initial);
  } finally {
    initial.cleanup();
  }
};

export const settleRetainedLaunch = async () => {
  const origin = await startOrigin(repository);
  onTestFinished(() => {
    origin.cleanup();
  });
  vi.stubEnv("HOME", path.join(origin.machine, "home"));
  const accepted = makeMe.anAcceptedAttempt
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
  const own = owned.own(accepted.request, accepted);
  const unmount = mountProjectConfiguration("production");
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
  const published = attempt.publication;
  if (
    attempt.outcome?.kind !== "launched" ||
    attempt.settledAt === undefined ||
    published.kind !== "published" ||
    published.identity === undefined ||
    attempt.landingRepository === undefined
  )
    throw new Error("Expected a settled reporting launch.");
  const { workspace } = attempt.landingRepository;
  const base = git(workspace, "ls-remote", "origin", "refs/heads/main").slice(
    0,
    40,
  );
  const revision = commit(workspace, "retained.txt");
  await keepAttempt(
    makeMe.anAcceptedAttempt
      .withId(unrelatedId)
      .adHocStart(
        { workspace: "isolated", landing: "auto-land" },
        { instruction: "Unrelated" },
      )
      .reportingTo(dashboardOrigin)
      .please(),
  );
  const landing = makeMe.aLandingSubmission
    .forLaunch({ reference: attempt.id, identity: published.identity })
    .comparing({ base, revision })
    .please();
  return {
    workspace,
    attempt,
    host,
    landing,
    base,
    settled: new Date(attempt.settledAt),
  };
};
