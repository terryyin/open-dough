// The feedback maintenance check (../../server/feedbackMaintenanceCheck.ts)
// on a fixed local date, with Open Dough's production project, this machine's
// authorization in a private HOME, a typed review read and a recording
// admission. A held admission is retried and shows why on the row; a due date
// is admitted once, nothing more starts while its session runs, and the date
// stays served after the session ends and its record is deleted. Off, not
// yet due, no due block, an unread review, or a developer's open session with
// the invocation admit nothing. On Codex, the admitted request's first input
// (../../server/hosts/codex/input.ts) carries the skill item. The
// admission's Taken story before native dispatch is
// ./feedback-maintenance-admission.spec.ts; the attention report's single
// notification is ../sessions/session-alerts-unread-report.spec.ts; Open
// Dough's default effort at the host is agent-launch-model-boundary.spec.ts;
// the due row and native launch are
// ../../../e2e/launches/feedback-maintenance-launch.spec.ts and
// feedback-maintenance-launch-held.spec.ts.
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, beforeEach, expect, test, vi } from "vitest";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import {
  FeedbackMaintenanceCheck,
  type ReviewRead,
} from "../../server/feedbackMaintenanceCheck.ts";
import { recordedRequest } from "../../server/hostLaunch.ts";
import { codexInput } from "../../server/hosts/codex/input.ts";
import { mountProjectConfiguration } from "../../server/projectConfiguration.ts";
import type {
  Acceptance,
  AgentLaunchRequest,
  AttemptObservation,
} from "../../src/agentLaunch.ts";
import { readFeedbackReview } from "../../src/feedbackReview.ts";
import {
  authorizeFeedbackMaintenance,
  dueWatchList,
} from "../../test-support/support/feedbackMaintenanceDue.ts";

type Launches = ConstructorParameters<typeof FeedbackMaintenanceCheck>[0];

const today = new Date(2026, 10, 26, 9);
const due = "2026-11-25";
const origin = "http://127.0.0.1:49177";
const held = "origin main base CI is pending";

let home: string;
let unmount: () => void;
let check: FeedbackMaintenanceCheck | undefined;
let admitted: AgentLaunchRequest[];
let attempts: AttemptObservation[];
let observations: number;
let answer: "accepted" | "held";

// Admits the request as a running attempt, or holds it before anything starts.
const launches: Launches = {
  accept(...[, request]): Promise<Acceptance> {
    admitted.push(request);
    if (answer === "held")
      return Promise.resolve({
        kind: "failed",
        reason: "unavailable",
        explanation: held,
      });
    const attempt = makeMe.anAttemptObservation
      .of(
        makeMe.anAcceptedAttempt
          .requesting(request)
          .acceptedAt(new Date().toISOString())
          .please(),
      )
      .owned(true)
      .running(true)
      .please();
    attempts.push(attempt);
    return Promise.resolve({ kind: "accepted", attempt });
  },
  attempts() {
    observations += 1;
    return Promise.resolve({ attempts, readable: true });
  },
};

let watchList: string | undefined;
const reads = vi.fn<ReviewRead>(() =>
  Promise.resolve(
    watchList === undefined
      ? { kind: "unread" }
      : readFeedbackReview(watchList),
  ),
);

beforeEach(() => {
  vi.useFakeTimers({ toFake: ["Date"] });
  vi.setSystemTime(today);
  home = mkdtempSync(path.join(tmpdir(), "feedback-due-"));
  vi.stubEnv("HOME", home);
  vi.stubEnv("DOUGH_MAINTENANCE_CHECK_MS", "5");
  unmount = mountProjectConfiguration("production");
  admitted = [];
  attempts = [];
  observations = 0;
  answer = "accepted";
  watchList = dueWatchList(due);
  reads.mockClear();
});

afterEach(() => {
  check?.close();
  check = undefined;
  unmount();
  vi.unstubAllEnvs();
  vi.useRealTimers();
  rmSync(home, { recursive: true, force: true });
});

const startChecking = () => {
  check = new FeedbackMaintenanceCheck(launches, () => origin, reads);
};

// Waits until the check has observed the sessions `times` more times.
async function afterFurtherChecks(times = 3) {
  const seen = observations;
  await expect.poll(() => observations).toBeGreaterThan(seen + times);
}

test("a due date is admitted once at the chosen host with the default effort, held launches retry, and the date stays served after its session ends and is deleted", async () => {
  authorizeFeedbackMaintenance(home, { host: "claude" });
  answer = "held";
  startChecking();
  await expect.poll(() => admitted.length).toBeGreaterThan(1);
  expect(attempts).toEqual([]);
  expect(check?.state([], [])?.row).toMatchObject({ due, reason: held });

  answer = "accepted";
  await expect.poll(() => attempts).toHaveLength(1);
  const accepted = admitted.at(-1);
  expect(accepted).toEqual({
    source: "open-dough",
    workflow: "ad-hoc",
    host: "claude",
    instruction: "/maintain-feedback-cycle",
    maintenance: { due },
  });
  const tried = admitted.length;
  const read = reads.mock.calls.length;

  // While the session runs, no further read or launch.
  await afterFurtherChecks();
  expect(admitted).toHaveLength(tried);
  expect(reads).toHaveBeenCalledTimes(read);

  // Ended, its record deleted: its attempt still serves the date.
  const [started] = attempts;
  if (started === undefined) throw new Error("No admitted attempt.");
  attempts = [
    makeMe.anAttemptObservation
      .of(
        makeMe.anAcceptedAttempt
          .requesting(started.request)
          .acceptedAt(started.acceptedAt)
          .launched({ host: "claude", sessionId: "maintenance-1" })
          .please(),
      )
      .owned(true)
      .running(false)
      .please(),
  ];
  await afterFurtherChecks();
  expect(reads.mock.calls.length).toBeGreaterThan(read);
  expect(admitted).toHaveLength(tried);
});

test("on Codex the first input invokes $maintain-feedback-cycle and names its skill item", async () => {
  authorizeFeedbackMaintenance(home, { host: "codex", effort: "high" });
  startChecking();
  await expect.poll(() => attempts).toHaveLength(1);
  const [request] = admitted;
  if (request === undefined) throw new Error("No admitted request.");
  expect(request).toMatchObject({ host: "codex", effort: "high" });
  const workspace = path.join(home, "open-dough");
  const [text, skill, ...extra] = codexInput(
    recordedRequest(request, today),
    workspace,
  );
  expect(text?.text?.split("\n\n")[0]).toBe("$maintain-feedback-cycle");
  expect(skill).toEqual({
    type: "skill",
    name: "maintain-feedback-cycle",
    path: path.join(
      workspace,
      ".agents",
      "skills",
      "maintain-feedback-cycle",
      "SKILL.md",
    ),
  });
  expect(extra).toEqual([]);
});

test("off, not yet due, no due block, an unread review, or a developer's open session with the invocation admits nothing", async () => {
  attempts = [
    makeMe.anAttemptObservation
      .of(
        makeMe.anAcceptedAttempt
          .requesting(
            makeMe.aLaunchRequest
              .adHoc({ instruction: "/maintain-feedback-cycle" })
              .please(),
          )
          .acceptedAt(today.toISOString())
          .please(),
      )
      .owned(true)
      .running(true)
      .please(),
  ];
  startChecking();
  await afterFurtherChecks();
  authorizeFeedbackMaintenance(home, { host: "claude" });
  await afterFurtherChecks();
  expect(reads).not.toHaveBeenCalled();

  attempts = [];
  for (const review of [
    dueWatchList("2026-11-27"),
    "# Near-term watch list\n\nNo block yet.\n",
    undefined,
  ]) {
    watchList = review;
    const read = reads.mock.calls.length;
    await afterFurtherChecks();
    expect(reads.mock.calls.length).toBeGreaterThan(read);
  }
  expect(admitted).toEqual([]);
});
