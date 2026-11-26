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
import { afterEach, beforeAll, expect, test, vi } from "vitest";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { queuedReadyRepository } from "../../../Distribution/tests/support/queued-repository.mjs";
import { recordedRequest } from "../../server/hostLaunch.ts";
import { keepAttempt, keptAttempts } from "../../server/launchAttemptStore.ts";
import { heldLandingPins } from "../../server/launchLandingGit.ts";
import { handleLanding } from "../../server/launchLandingReporting.ts";
import { prepareAttemptReporting } from "../../server/launchReportingPreparation.ts";
import { started } from "../../server/launchStart.ts";
import { localFolder } from "../../server/localFolder.ts";
import { StartProgress } from "../../server/startProgress.ts";
import { startStore } from "../../server/startStore.ts";
import { unattachedInput } from "../../server/unattachedInput.ts";
import { commit, git } from "../../test-support/support/launchLanding.ts";
import {
  startOrigin,
  type StartOrigin,
} from "../../test-support/support/startOrigin.ts";
import { keepStartedOrigin } from "../../test-support/support/startOriginPreparation.ts";
import { dashboardOrigin } from "../support/publisherDashboardOrigin.ts";

const source = makeMe.aPublishedSource.openDough.please();
const repository = queuedReadyRepository().please();
const began = new Date();
const text = "Tidy the README wording";

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
  vi.unstubAllEnvs();
  origin?.cleanup();
});

// The isolated review Start on its own machine, with the reporting its
// launch keeps before the session is dispatched.
async function reviewedStart() {
  origin = await startOrigin(repository, { host: "claude" });
  const home = path.join(origin.machine, "home");
  vi.stubEnv("HOME", home);
  const request = makeMe.aLaunchRequest
    .adHoc()
    .withInstruction(text)
    .withPolicy({ workspace: "isolated", landing: "review" })
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
  const attempt = { ...accepted, publication: start.publication };
  const reporting = await prepareAttemptReporting(
    attempt,
    start,
    start.workspace,
    undefined,
    undefined,
  );
  const prepared =
    reporting.kind === "prepared" ? reporting.prepared : undefined;
  if (prepared === undefined) throw new Error("Expected reporting.");
  await keepAttempt({ ...attempt, ...prepared });
  const identity = start.publication.identity;
  if (identity === undefined) throw new Error("Expected a Taken story.");
  const kept = (await keptAttempts())?.find((entry) => entry.id === attempt.id);
  const recorded = {
    ...recordedRequest(request, began),
    storyIdentity: start.publication.identity,
    reporting: prepared.reporting,
  };
  return {
    attempt,
    prepared,
    authority: kept?.landingRepository,
    identity,
    session: start.handoff.established.establishedSession,
    block: start.handoff.formatted,
    input: unattachedInput(recorded, start.handoff.formatted) ?? "",
  };
}

test("a Wait for review Start hands its session a landing context bound to its story, workspace and target", async () => {
  const { attempt, prepared, authority, identity, session, block, input } =
    await reviewedStart();

  // The kept attempt holds the capture authority the context names.
  expect(authority).toEqual({
    repository: git(
      session?.workspace ?? "",
      "rev-parse",
      "--path-format=absolute",
      "--git-common-dir",
    ),
    workspace: session?.workspace,
    branch: session?.branch,
    identity,
    remote: "origin",
    target: "refs/heads/main",
  });
  expect(prepared.reporting).toMatchObject({
    origin: dashboardOrigin,
    reference: attempt.id,
    landingContext: expect.any(String) as unknown,
  });
  const [established, reporting, story, developer] = input.split("\n\n");
  expect(established).toBe(block);
  expect(block).toMatch(/^Established session/u);
  expect(reporting).toContain(prepared.reporting.command);
  expect(reporting).toContain(
    `--landing-context '${prepared.reporting.landingContext ?? ""}'`,
  );
  expect([story, developer]).toEqual([`Taken story: ${identity}`, text]);
});

test("the landing owner refuses another story, host, dashboard or target, then prepares and records the story's own comparison", async () => {
  const { attempt, authority, identity, session } = await reviewedStart();
  const workspace = session?.workspace ?? "";
  const landingRepository = authority?.repository ?? "";
  const originMain = () =>
    git(workspace, "ls-remote", "origin", "refs/heads/main").slice(0, 40);
  const base = originMain();
  const revision = commit(workspace, "later.txt");
  const landing = makeMe.aLandingSubmission
    .forLaunch({ reference: attempt.id, identity })
    .comparing({ base, revision })
    .please();
  const kept = async () =>
    (await keptAttempts())?.find((entry) => entry.id === attempt.id);

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
    { base, revision, reference: attempt.id },
  ]);
  const pinned = `refs/open-dough/one-shot/${attempt.id}/${landing.delivery}`;
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
    reference: attempt.id,
    receipt: preparedReceipt.receipt,
  });
});
