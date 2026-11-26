// The real feedback maintenance check on a fixed local date, with private
// settings and records, a supplied review read and recording launch admission.
// Publication before native dispatch: ./feedback-maintenance-admission.spec.ts.
// Attention notification: ../sessions/session-alerts-unread-report.spec.ts.
// Host default effort: ./agent-launch-model-boundary.spec.ts;
// the due row and native launch are in e2e/launches/feedback-maintenance-launch*.
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, beforeEach, expect, test, vi } from "vitest";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { claudeHost } from "../../server/claudeHost.ts";
import { FeedbackMaintenanceCheck } from "../../server/feedbackMaintenanceCheck.ts";
import type { ReviewRead } from "../../server/feedbackMaintenanceReview.ts";
import { recordedRequest } from "../../server/hostLaunch.ts";
import { codexInput } from "../../server/hosts/codex/input.ts";
import { replaceRecords } from "../../server/launchRecordDocument.ts";
import {
  keptSession,
  setRecordDoneAt,
} from "../../server/launchRecordStore.ts";
import { mountProjectConfiguration } from "../../server/projectConfiguration.ts";
import type {
  Acceptance,
  AgentLaunchRequest,
  AttemptObservation,
  LaunchAttemptRecord,
} from "../../src/agentLaunch.ts";
import { readFeedbackReview } from "../../src/feedbackReview.ts";
import {
  authorizeFeedbackMaintenance,
  dueWatchList,
} from "../../test-support/support/feedbackMaintenanceDue.ts";

const today = new Date(2026, 10, 26, 9);
const now = today.toISOString();
const due = "2026-11-25";
const origin = "http://127.0.0.1:49177";
const held = "origin main base CI is pending";
const instruction = "/maintain-feedback-cycle";

let home: string;
let unmount: () => void;
let check: FeedbackMaintenanceCheck | undefined;
let admitted: AgentLaunchRequest[];
let attempts: AttemptObservation[];
let observations: number;
let answer: "accepted" | "held";

const ownedAttempt = (record: LaunchAttemptRecord) =>
  makeMe.anAttemptObservation.of(record).owned(true);

// Admits the request as a running attempt, or holds it before anything starts.
const launches: ConstructorParameters<typeof FeedbackMaintenanceCheck>[0] = {
  accept(...[, request]): Promise<Acceptance> {
    admitted.push(request);
    if (answer === "held")
      return Promise.resolve({
        kind: "failed",
        reason: "unavailable",
        explanation: held,
      });
    const accepted = makeMe.anAcceptedAttempt
      .requesting(request)
      .acceptedAt(now)
      .please();
    const attempt = ownedAttempt(accepted).running(true).please();
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
  vi.restoreAllMocks();
  vi.unstubAllEnvs();
  vi.useRealTimers();
  rmSync(home, { recursive: true, force: true });
});

const startChecking = () => {
  check = new FeedbackMaintenanceCheck(launches, () => origin, reads);
};

// Waits for several complete checks.
async function afterFurtherChecks() {
  const seen = observations;
  await expect.poll(() => observations).toBeGreaterThan(seen + 3);
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
  const ended = makeMe.anAcceptedAttempt
    .requesting(started.request)
    .acceptedAt(started.acceptedAt)
    .launched({ host: "claude", sessionId: "maintenance-1" })
    .please();
  attempts = [ownedAttempt(ended).running(false).please()];
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
  startChecking();
  await afterFurtherChecks();
  expect(reads).not.toHaveBeenCalled();
  expect(admitted).toEqual([]);

  const manual = makeMe.anAcceptedAttempt
    .adHoc({ instruction })
    .acceptedAt(now)
    .please();
  attempts = [ownedAttempt(manual).running(true).please()];
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

test("Done releases the developer's invocation and an unrelated open session does not count", async () => {
  const manual = makeMe.aLaunchRecord
    .adHoc({ title: "My feedback maintenance", instruction })
    .please();
  const unrelated = makeMe.aLaunchRecord
    .adHoc({ title: "Read the README", instruction: "Read the README" })
    .inClaudeSession({ sessionId: "unrelated" })
    .please();
  const working = makeMe.aSessionState.loaded("working").please();
  const observed = [manual, unrelated].map((record) => ({
    ...record,
    sessionState: working,
  }));
  vi.spyOn(claudeHost, "sessions").mockResolvedValue(observed);
  await replaceRecords(() => ({ "open-dough": [manual, unrelated] }));
  authorizeFeedbackMaintenance(home, { host: "claude" });
  startChecking();
  await afterFurtherChecks();
  expect(reads).not.toHaveBeenCalled();
  expect(admitted).toEqual([]);

  expect(
    await setRecordDoneAt("open-dough", manual.session, now),
  ).toMatchObject({ doneAt: now });
  await expect.poll(() => attempts).toHaveLength(1);
  await afterFurtherChecks();
  expect(admitted).toMatchObject([{ maintenance: { due } }]);
  const retained = await keptSession("open-dough", unrelated.session);
  expect(retained).toBeDefined();
  expect(retained?.doneAt).toBeUndefined();
  expect(
    check?.state([{ ...unrelated, sessionState: working }], [])?.row,
  ).toMatchObject({ kind: "not-started", due });
});
