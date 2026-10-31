// Answers one admitted request on the local launch boundary.
import type { IncomingMessage, ServerResponse } from "node:http";
import { type LaunchWithState, recordDeletable } from "../src/agentLaunch.ts";
import type { DeleteRecordAnswer } from "../src/deleteRecord.ts";
import { admitted, type Admitted } from "./agentLaunchAdmission.ts";
import { AgentLaunches } from "./agentLaunches.ts";
import { type AgentLaunchAnswer } from "./agentLaunchResponse.ts";
import {
  landingEndpoint,
  landingPrepareEndpoint,
  submitLanding,
} from "./launchLandingReporting.ts";
import { submitCompletion, completionEndpoint } from "./completionReporting.ts";
import type { NativeDoneMarks } from "./doneMarks.ts";
import { heldCursorSessions } from "./hosts/cursor/heldSessions.ts";
import { recoverCursorSession } from "./hosts/cursor/recover.ts";
import { notifyRecordRemoved } from "./launchRecordRemoval.ts";
import { deleteRecord, setRecordReportRead } from "./launchRecordStore.ts";
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
} from "./storyReviewSnapshot.ts";
import { markReviewedResponse } from "./storyReviewMarks.ts";
import { storyReviewRangeResponse } from "./storyReviewRange.ts";
import { withTerminalHandoff } from "./terminalHandoff.ts";
import {
  terminalHandoffAttach,
  terminalHandoffHeader,
} from "../src/agentTerminal.ts";
import { configuredLimit } from "./configuredLimit.ts";

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

async function deleted(
  { source, record }: Extract<Admitted, { readonly kind: "delete" }>,
  launches: AgentLaunches,
): Promise<DeleteRecordAnswer> {
  const joined = await launches.stateOf(source, record);
  if (!recordDeletable(joined)) {
    return { kind: "state-known", record: joined };
  }
  let wasDeleted: boolean;
  try {
    wasDeleted = await deleteRecord(source.id, record.session);
  } catch (error) {
    throw new RefusedRequest(
      500,
      `The session record could not be deleted: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
  // Only once the record is actually gone may its host retire the
  // session-local state that record alone remembered; a kept record
  // (a failed deletion above) keeps that state, so a session whose
  // record survives stays resumable exactly as before.
  if (wasDeleted) {
    try {
      await notifyRecordRemoved(record);
    } catch (error) {
      throw new RefusedRequest(
        500,
        `The session record was deleted, but its session-local state could not be removed: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }
  return { kind: "deleted" };
}

export async function answer(
  req: IncomingMessage,
  url: URL,
  res: ServerResponse,
  launches: AgentLaunches,
  doneMarks: NativeDoneMarks,
  sessions: MachineSessionObservation,
): Promise<AgentLaunchAnswer> {
  try {
    if (url.pathname === landingPrepareEndpoint)
      return { status: 200, body: await submitLanding(req, true) };
    if (url.pathname === landingEndpoint)
      return { status: 200, body: await submitLanding(req) };
    if (url.pathname === completionEndpoint)
      return { status: 200, body: await submitCompletion(req, doneMarks) };
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
        return await storyReviewResponse(request, res);
      case "story-review-file":
        return await storyReviewFileResponse(request, res);
      case "story-review-file-text":
        return await storyReviewFileTextResponse(request, res);
      case "story-review-range":
        return await storyReviewRangeResponse(request, res);
      case "story-review-mark":
        return await markReviewedResponse(request);
      case "cursor-sessions":
        return { status: 200, body: await heldCursorSessions() };
      case "sessions":
        return {
          status: 200,
          serialized: await sessions.answerFor(
            res,
            request.held,
            request.fresh,
          ),
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
