// The feedback maintenance check, for the local launch boundary
// (`./launchBoundary.ts`), which starts it with the boundary and stops it with
// the same cleanup, as it does the session alerts (`./sessionAlerts.ts`). It
// observes the authorization when it starts, and one loop
// (`./repeatingCheck.ts`) checks once the server listens and then every few
// minutes whether the feedback maintenance cycle is due
// (`../src/feedbackMaintenanceDue.ts`), and when it is, accepts one
// unattached launch through the one launch entry (`./agentLaunches.ts`): an
// ad hoc request in the default checkout of the configured project whose
// repository is Open Dough's, on the authorized host and model, with the
// cycle's invocation as its instruction and the due date it serves as its
// marker, reporting to this dashboard. Only a production project environment
// reads the watch list and launches, so development servers sharing this
// machine's setting start nothing; every server observes the authorization,
// so the sessions answer is the same whichever serves it.
//
// The authorization (`./feedbackMaintenance.ts`) and this machine's launch
// records and attempts are read first and cost no GitHub request. Only when
// they permit is the project's ref resolved through `gh` and its watch list
// read at that revision, remembered there (`./pinnedTexts.ts`); a failed read
// is kept with the published read diagnostics (`./readDiagnostics.ts`) and is
// not due. A launch attempt keeps its request with the marker before any side
// effect, so a restart, a later check, or a deleted record never launches the
// same due date again while the attempt is retained.
//
// The check keeps its last observation: whether the authorization was on, the
// review it last read and when, and a due date whose launch the launch gates
// held, with why. The machine's sessions answer composes it with the sessions
// as they stand then (`state`, `../src/feedbackMaintenanceState.ts`), asking
// GitHub nothing more.

import {
  isOpen,
  type RecordedLaunchRequest,
  type AgentLaunchRequest,
  type AttemptObservation,
  type LaunchWithState,
} from "../src/agentLaunch.ts";
import {
  dueDecision,
  localDate,
  type MaintenanceSession,
} from "../src/feedbackMaintenanceDue.ts";
import {
  feedbackMaintenanceState,
  heldReason,
  type FeedbackMaintenanceState,
  type MaintenanceObservation,
  type ObservedMaintenanceSession,
} from "../src/feedbackMaintenanceState.ts";
import { sessionKey } from "../src/sessionReference.ts";
import {
  feedbackWatchListPath,
  readFeedbackReview,
  type FeedbackReview,
} from "../src/feedbackReview.ts";
import {
  feedbackMaintenanceInstruction,
  feedbackMaintenanceRepository,
} from "../src/feedbackMaintenanceSetting.ts";
import type { PublishedSource } from "../src/publishedSource.ts";
import type { AgentLaunches } from "./agentLaunches.ts";
import { configuredLimit } from "./configuredLimit.ts";
import { readFeedbackMaintenance } from "./feedbackMaintenance.ts";
import { isNotFound } from "./ghFailure.ts";
import { resolveRevisionViaGh } from "./ghRevision.ts";
import { readableRecordsByProject } from "./launchRecordStore.ts";
import { withStates } from "./launchStates.ts";
import { machineFolder } from "./projectFolders.ts";
import { PinnedTexts } from "./pinnedTexts.ts";
import {
  projectEnvironment,
  publishedProjects,
} from "./projectConfiguration.ts";
import { withReadDiagnosticContext } from "./readDiagnostics.ts";
import { RetainedAnswers } from "./retainedAnswers.ts";
import { repeatUntilStopped } from "./repeatingCheck.ts";
import { RevisionMemo } from "./revisionMemo.ts";

// How soon a check waiting for the server's listening address looks again.
const originWaitMs = 250;

// How often the cycle's due date is observed. A test may shorten it through
// the environment.
function checkMs(): number {
  return configuredLimit("DOUGH_MAINTENANCE_CHECK_MS", 15 * 60_000);
}

type Launches = Pick<AgentLaunches, "accept" | "attempts">;

// Whether a request is a feedback-maintenance session's, with the due date it
// serves: one the check started, which serves its due date, or one a
// developer started by hand with the same invocation, which serves none.
function maintenanceDue(
  request: AgentLaunchRequest | RecordedLaunchRequest,
): { readonly due?: string } | undefined {
  if (request.workflow !== "ad-hoc") return undefined;
  if (request.maintenance !== undefined)
    return { due: request.maintenance.due };
  return request.instruction?.trim() ===
    feedbackMaintenanceInstruction(request.host)
    ? {}
    : undefined;
}

// The project's feedback-maintenance sessions, from records joined with their
// session's state and the attempts whose session has no record (still
// starting, deleted, or never launched). This is the one reading of whether
// such a session is running (starting, or open and not found unavailable),
// done, or ended: the due check takes only a running one as open, and the
// machine's sessions answer says the same (`state`).
function observedSessions(
  source: string,
  records: readonly LaunchWithState[],
  attempts: readonly AttemptObservation[],
): ObservedMaintenanceSession[] {
  const kept = records.filter((record) => record.request.source === source);
  const recorded = new Set(kept.map((record) => sessionKey(record.session)));
  return [
    ...kept.flatMap((record) => {
      const serving = maintenanceDue(record.request);
      if (serving === undefined) return [];
      return [
        {
          ...serving,
          at: record.launchedAt,
          progress:
            record.doneAt !== undefined
              ? ("done" as const)
              : record.sessionState.kind === "unavailable"
                ? ("ended" as const)
                : ("running" as const),
        },
      ];
    }),
    ...attempts.flatMap((attempt) => {
      const serving = maintenanceDue(attempt.request);
      const { outcome } = attempt;
      if (
        serving === undefined ||
        attempt.request.source !== source ||
        (outcome?.kind === "launched" &&
          recorded.has(sessionKey(outcome.session)))
      )
        return [];
      return [
        {
          ...serving,
          at: attempt.acceptedAt,
          progress:
            outcome === undefined ? ("running" as const) : ("ended" as const),
        },
      ];
    }),
  ];
}

// This machine's feedback-maintenance sessions in the project, from its kept
// records, their sessions' states and its attempts, or undefined when records
// or attempts cannot be read. Only a running session is open: one that ended
// unavailable without a done mark no longer holds the check from reading, and
// still serves its due date, as a deleted record's attempt does.
async function maintenanceSessions(
  source: PublishedSource,
  launches: Launches,
): Promise<readonly MaintenanceSession[] | undefined> {
  const [records, { attempts, readable }] = await Promise.all([
    readableRecordsByProject(),
    launches.attempts(),
  ]);
  if (records === undefined || !readable) return undefined;
  const kept = (records.get(source.id) ?? []).filter(
    (record) => maintenanceDue(record.request) !== undefined,
  );
  // Only open records need their host's observation.
  const open = await withStates(machineFolder(), kept.filter(isOpen));
  const done = kept
    .filter((record) => !isOpen(record))
    .map((record) => ({
      ...record,
      sessionState: { kind: "unknown" as const },
    }));
  return observedSessions(source.id, [...open, ...done], attempts);
}

export class FeedbackMaintenanceCheck {
  private readonly stopped = new AbortController();
  private readonly pinned = new PinnedTexts(
    new RevisionMemo(new RetainedAnswers()),
  );
  // The last observation, for the project it was taken in; none while no
  // configured project is Open Dough's.
  private observation:
    (MaintenanceObservation & { readonly source: string }) | undefined;

  constructor(
    private readonly launches: Launches,
    private readonly origin: () => string | undefined,
  ) {
    // The sessions answer says where maintenance stands from the server's
    // first answer, before the first check once it listens.
    try {
      this.observe();
    } catch {
      // Observed again at the first check.
    }
    void this.run();
  }

  private async run(): Promise<void> {
    const { signal } = this.stopped;
    await repeatUntilStopped(signal, checkMs, async () => {
      if (this.origin() === undefined) return originWaitMs;
      await this.check(signal);
      return undefined;
    });
  }

  // The watch list's review at the ref's current revision, `unread` when
  // either read failed.
  private async review(
    source: PublishedSource,
    signal: AbortSignal,
  ): Promise<FeedbackReview | { readonly kind: "unread" }> {
    let revision: string;
    try {
      ({ revision } = await withReadDiagnosticContext(
        { source: source.id, category: "ref" },
        () => resolveRevisionViaGh(source.repository, source.ref, signal),
      ));
    } catch {
      return { kind: "unread" };
    }
    try {
      return readFeedbackReview(
        await withReadDiagnosticContext(
          { source: source.id, category: "content", pin: revision },
          () =>
            this.pinned.namedRevisionText(
              source,
              revision,
              feedbackWatchListPath,
              signal,
            ),
        ),
      );
    } catch (error) {
      return isNotFound(error) ? { kind: "absent" } : { kind: "unread" };
    }
  }

  // Observes the authorization in the project the cycle runs in, keeping the
  // review last read, when it was read, and the launch last held there,
  // without asking GitHub; undefined, observing nothing, when no configured
  // project is Open Dough's.
  private observe() {
    const source = publishedProjects().find(
      (each) => each.repository === feedbackMaintenanceRepository,
    );
    if (source === undefined) {
      this.observation = undefined;
      return undefined;
    }
    let setting;
    try {
      setting = readFeedbackMaintenance();
    } catch {
      // A setting that cannot be read authorizes nothing.
    }
    const last =
      this.observation?.source === source.id ? this.observation : undefined;
    const observed = {
      source: source.id,
      authorized: setting?.enabled === true,
      review: last?.review,
      readAt: last?.readAt,
    };
    this.observation = { ...observed, held: last?.held };
    return { source, setting, observed, last };
  }

  private async check(signal: AbortSignal): Promise<void> {
    const observing = this.observe();
    if (observing === undefined) return;
    const { source, setting, observed, last } = observing;
    if (setting === undefined || projectEnvironment() !== "production") {
      this.release();
      return;
    }
    const sessions = await maintenanceSessions(source, this.launches);
    if (sessions === undefined) return;
    const today = localDate(new Date());
    const inputs = { authorized: setting.enabled, sessions, today };
    if (dueDecision(inputs).kind !== "read") {
      this.release();
      return;
    }
    const review = await this.review(source, signal);
    if (signal.aborted) return;
    const readAt = new Date().toISOString();
    this.observation = { ...observed, review, readAt, held: last?.held };
    const decision = dueDecision({ ...inputs, review });
    // The setting may have been turned off while GitHub was asked.
    const now = readFeedbackMaintenance();
    if (decision.kind !== "launch" || !now.enabled) {
      this.release();
      return;
    }
    const { host, model, effort } = now.choice;
    const acceptance = await this.launches.accept(
      source,
      {
        source: source.id,
        workflow: "ad-hoc",
        host,
        ...(model !== undefined && { model }),
        ...(effort !== undefined && { effort }),
        instruction: feedbackMaintenanceInstruction(host),
        maintenance: { due: decision.due },
      },
      this.origin(),
    );
    this.observation = {
      ...observed,
      review,
      readAt,
      held:
        acceptance.kind === "accepted"
          ? undefined
          : { due: decision.due, reason: heldReason(acceptance) },
    };
  }

  // Forgets a held launch once a check does not try to launch.
  private release(): void {
    if (this.observation !== undefined)
      this.observation = { ...this.observation, held: undefined };
  }

  // What the machine's sessions answer says of feedback maintenance: the
  // last observation with the sessions as they stand in that answer, or
  // nothing while no configured project is Open Dough's.
  state(
    records: readonly LaunchWithState[],
    attempts: readonly AttemptObservation[],
  ): FeedbackMaintenanceState | undefined {
    const observation = this.observation;
    if (observation === undefined) return undefined;
    return feedbackMaintenanceState(
      observation.source,
      observation,
      observedSessions(observation.source, records, attempts),
      localDate(new Date()),
    );
  }

  // Ends the loop and any read it waits on.
  close(): void {
    this.stopped.abort();
  }
}
