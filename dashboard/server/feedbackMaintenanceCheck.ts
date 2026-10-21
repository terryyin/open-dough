// The feedback maintenance check, for the local launch boundary
// (`./launchBoundary.ts`), which starts it with the boundary and stops it with
// the same cleanup, as it does the session alerts (`./sessionAlerts.ts`). One
// loop (`./repeatingCheck.ts`) observes once the server listens and then every
// few minutes whether the feedback maintenance cycle is due
// (`../src/feedbackMaintenanceDue.ts`), and when it is, accepts one
// unattached launch through the one launch entry (`./agentLaunches.ts`): an
// ad hoc request in the default checkout of the configured project whose
// repository is Open Dough's, on the authorized host and model, with the
// cycle's invocation as its instruction and the due date it serves as its
// marker, reporting to this dashboard. Only a production project environment
// checks, so development servers sharing this machine's setting start
// nothing.
//
// The authorization (`./feedbackMaintenance.ts`) and this machine's launch
// records and attempts are read first and cost no GitHub request. Only when
// they permit is the project's ref resolved through `gh` and its watch list
// read at that revision, remembered there (`./pinnedTexts.ts`); a failed read
// is kept with the published read diagnostics (`./readDiagnostics.ts`) and is
// not due. A launch attempt keeps its request with the marker before any side
// effect, so a restart, a later check, or a deleted record never launches the
// same due date again while the attempt is retained.

import {
  isOpen,
  type RecordedLaunchRequest,
  type AgentLaunchRequest,
} from "../src/agentLaunch.ts";
import {
  dueDecision,
  localDate,
  type MaintenanceSession,
} from "../src/feedbackMaintenanceDue.ts";
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

// A feedback-maintenance session: one the check started, which serves its
// due date, or one a developer started by hand with the same invocation.
function maintenanceOf(
  request: AgentLaunchRequest | RecordedLaunchRequest,
  open: boolean,
): MaintenanceSession[] {
  if (request.workflow !== "ad-hoc") return [];
  if (request.maintenance !== undefined)
    return [{ due: request.maintenance.due, open }];
  return request.instruction?.trim() ===
    feedbackMaintenanceInstruction(request.host)
    ? [{ open }]
    : [];
}

// This machine's feedback-maintenance sessions in the project, from its kept
// records and attempts, or undefined when either cannot be read. An attempt
// still starting is open; a deleted record's attempt still serves its date.
async function maintenanceSessions(
  source: PublishedSource,
  launches: Launches,
): Promise<readonly MaintenanceSession[] | undefined> {
  const [records, { attempts, readable }] = await Promise.all([
    readableRecordsByProject(),
    launches.attempts(),
  ]);
  if (records === undefined || !readable) return undefined;
  return [
    ...(records.get(source.id) ?? []).flatMap((record) =>
      maintenanceOf(record.request, isOpen(record)),
    ),
    ...attempts
      .filter((attempt) => attempt.request.source === source.id)
      .flatMap((attempt) =>
        maintenanceOf(attempt.request, attempt.outcome === undefined),
      ),
  ];
}

export class FeedbackMaintenanceCheck {
  private readonly stopped = new AbortController();
  private readonly pinned = new PinnedTexts(
    new RevisionMemo(new RetainedAnswers()),
  );

  constructor(
    private readonly launches: Launches,
    private readonly origin: () => string | undefined,
  ) {
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

  private async check(signal: AbortSignal): Promise<void> {
    if (projectEnvironment() !== "production") return;
    const source = publishedProjects().find(
      (each) => each.repository === feedbackMaintenanceRepository,
    );
    if (source === undefined) return;
    let setting;
    try {
      setting = readFeedbackMaintenance();
    } catch {
      // A setting that cannot be read authorizes nothing.
      return;
    }
    const sessions = await maintenanceSessions(source, this.launches);
    if (sessions === undefined) return;
    const today = localDate(new Date());
    const inputs = { authorized: setting.enabled, sessions, today };
    if (dueDecision(inputs).kind !== "read") return;
    const review = await this.review(source, signal);
    if (signal.aborted) return;
    const decision = dueDecision({ ...inputs, review });
    // The setting may have been turned off while GitHub was asked.
    const now = readFeedbackMaintenance();
    if (decision.kind !== "launch" || !now.enabled) return;
    const { host, model, effort } = now.choice;
    await this.launches.accept(
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
  }

  // Ends the loop and any read it waits on.
  close(): void {
    this.stopped.abort();
  }
}
