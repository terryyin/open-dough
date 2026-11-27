// Answers one admitted request on the local launch boundary.
import type { IncomingMessage, ServerResponse } from "node:http";
import type { LaunchWithState } from "../src/agentLaunch.ts";
import { admitted, type Admitted } from "./agentLaunchAdmission.ts";
import { AgentLaunches } from "./agentLaunches.ts";
import { type AgentLaunchAnswer } from "./agentLaunchResponse.ts";
import {
  landingEndpoint,
  landingPrepareEndpoint,
} from "./launchLandingAdmission.ts";
import { submitLanding } from "./launchLandingReporting.ts";
import { submitCompletion, completionEndpoint } from "./completionReporting.ts";
import type { NativeDoneMarks } from "./doneMarks.ts";
import type { LandedCiCollection } from "./landedCiCollection.ts";
import { heldCursorSessions } from "./hosts/cursor/heldSessions.ts";
import { recoverCursorSession } from "./hosts/cursor/recover.ts";
import { deleted } from "./launchRecordDeletion.ts";
import { setRecordReportRead } from "./launchRecordStore.ts";
import { RefusedRequest } from "./localOrigin.ts";
import { launchHostOptionsResponse } from "./launchHostOptionsResponse.ts";
import { noSuchSession } from "./sessionAdmission.ts";
import type { MachineSessionObservation } from "./machineSessionObservation.ts";
import { finalReportResponse } from "./finalReportResponse.ts";
import { stopRecordedSession } from "./sessionStop.ts";
import {
  storyReviewFileResponse,
  storyReviewFileTextResponse,
  storyReviewResponse,
} from "./storyReview.ts";
import { withTerminalHandoff } from "./terminalHandoff.ts";
import {
  sessionAttachmentEndpoint,
  terminalHandoffAttach,
  terminalHandoffHeader,
} from "../src/agentTerminal.ts";
import { submitSessionAttachment } from "./sessionAttachments.ts";
import { configuredLimit } from "./configuredLimit.ts";
import { withResponseSignal } from "./responseSignal.ts";
import { readWaitLimitMs } from "../src/authenticatedReadRules.ts";
import { sessionBranchEntryEndpoint } from "../src/sessionBranchResult.ts";
import { submitSessionBranchEntry } from "./sessionBranchEntry.ts";
import type { ReviewInitialSync } from "./reviewInitialSync.ts";
import { storyReviewResultResponse } from "./storyReviewResultRead.ts";

// How long a wait for an attempt observation to change lasts. A test may
// shorten it through `DOUGH_CHANGE_WAIT_MS`; production stays at 30 seconds.
const changeWaitMs = () => configuredLimit("DOUGH_CHANGE_WAIT_MS", 30_000);

async function markedDone(
  { source, record, folder }: Extract<Admitted, { readonly kind: "done" }>,
  launches: AgentLaunches,
  doneMarks: NativeDoneMarks,
): Promise<LaunchWithState> {
  const marked = await doneMarks.markDone(source, record, folder, launches);
  return launches.stateOf(source, marked);
}

async function markedRead(
  { source, record }: Extract<Admitted, { readonly kind: "read" }>,
  launches: AgentLaunches,
): Promise<LaunchWithState> {
  const read = await setRecordReportRead(
    source.id,
    record.session,
    record.completion.receipt,
  );
  if (read === undefined) throw noSuchSession();
  return launches.stateOf(source, read);
}

export async function answer(
  req: IncomingMessage,
  url: URL,
  res: ServerResponse,
  launches: AgentLaunches,
  doneMarks: NativeDoneMarks,
  sessions: MachineSessionObservation,
  landedCi: Pick<LandedCiCollection, "nudge">,
  initialSync: ReviewInitialSync,
): Promise<AgentLaunchAnswer> {
  try {
    if (
      url.pathname === landingPrepareEndpoint ||
      url.pathname === landingEndpoint
    ) {
      return { status: 200, body: await submitLanding(req, landedCi) };
    }
    if (url.pathname === sessionAttachmentEndpoint) {
      return {
        status: 200,
        body: await submitSessionAttachment(req, url, res, launches),
      };
    }
    if (url.pathname === completionEndpoint)
      return { status: 200, body: await submitCompletion(req, doneMarks) };
    if (url.pathname === sessionBranchEntryEndpoint)
      return { status: 200, body: await submitSessionBranchEntry(req) };
    const request = await admitted(req, url, launches);
    switch (request.kind) {
      case "drain":
        await launches.drain();
        return { status: 200, body: { drained: true } };
      case "host-options":
        return await launchHostOptionsResponse(request, res);
      case "final-report":
        return await finalReportResponse(request, res);
      case "story-review":
        return await storyReviewResponse(request, res, initialSync);
      case "story-review-file":
        return await storyReviewFileResponse(request, res);
      case "story-review-file-text":
        return await storyReviewFileTextResponse(request, res);
      case "story-review-result":
        return await storyReviewResultResponse(request, res);
      case "cursor-sessions":
        return { status: 200, body: await heldCursorSessions() };
      case "sessions":
        // The viewer leaving ends its wait; the observation bounds it.
        return {
          status: 200,
          ...(await withResponseSignal(
            res,
            (signal) => sessions.answerFor(request, signal),
            readWaitLimitMs,
          )),
        };
      case "changed":
        return {
          status: 200,
          body: await launches.changed(
            request.attempt,
            changeWaitMs(),
            request.seen,
          ),
        };
      case "accept":
        return {
          status: 200,
          body: await withTerminalHandoff(
            req.headers[terminalHandoffHeader] === terminalHandoffAttach,
            () =>
              launches.accept(
                request.source,
                request.request,
                `http://${req.headers.host}`,
              ),
          ),
        };
      case "continue":
        return {
          status: 200,
          body: await launches.continueAttempt(request.source, request.attempt),
        };
      case "update-worktree":
        return {
          status: 200,
          body: await launches.updateWorktreeAndRetry(
            request.source,
            request.attempt,
          ),
        };
      case "reconciled":
        return {
          status: 200,
          body: await launches.reconcile(request.source, request.attempt),
        };
      case "verify":
        return {
          status: 200,
          body: await launches.verify(request.source, request.attempt),
        };
      case "done":
        return {
          status: 200,
          body: { record: await markedDone(request, launches, doneMarks) },
        };
      case "read":
        return {
          status: 200,
          body: { record: await markedRead(request, launches) },
        };
      case "delete":
        return { status: 200, body: await deleted(request, launches) };
      case "recover":
        return {
          status: 200,
          body: await recoverCursorSession(
            request.source,
            request.record,
            launches,
          ),
        };
      case "stop":
        return {
          status: 200,
          body: await stopRecordedSession(
            request.source,
            request.record,
            request.folder,
            launches,
          ),
        };
    }
  } catch (error) {
    if (error instanceof RefusedRequest) {
      return { status: error.status, body: { error: error.message } };
    }
    throw error;
  }
}
