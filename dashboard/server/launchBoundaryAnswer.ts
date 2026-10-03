// Answers one admitted request on the local launch boundary.
import type { IncomingMessage, ServerResponse } from "node:http";
import { type LaunchWithState, recordDeletable } from "../src/agentLaunch.ts";
import type { DeleteRecordAnswer } from "../src/deleteRecord.ts";
import { admitted, type Admitted } from "./agentLaunchAdmission.ts";
import { AgentLaunches } from "./agentLaunches.ts";
import { type AgentLaunchAnswer } from "./agentLaunchResponse.ts";
import { AgentTerminals } from "./agentTerminals.ts";
import { submitCompletion, completionEndpoint } from "./completionReporting.ts";
import { markSessionDone } from "./doneMarks.ts";
import { heldCursorSessions } from "./hosts/cursor/heldSessions.ts";
import { hostOperations } from "./launchHosts.ts";
import { deleteRecord } from "./launchRecordStore.ts";
import { RefusedRequest } from "./localOrigin.ts";
import { withResponseSignal } from "./responseSignal.ts";
import { SessionAlerts } from "./sessionAlerts.ts";
import { sessionResultResponse } from "./sessionResultResponse.ts";

// How long a wait for an accepted attempt's change is held before it is
// answered unchanged, for the page to ask again.
const changeWaitMs = 30_000;

// A done mark on the admitted recorded session, with its current state.
async function markedDone(
  { source, record, folder }: Extract<Admitted, { readonly kind: "done" }>,
  launches: AgentLaunches,
  terminals: AgentTerminals,
): Promise<LaunchWithState> {
  const marked = await markSessionDone(
    source,
    record,
    folder,
    launches,
    terminals,
  );
  return launches.stateOf(source, marked);
}

// A delete of the admitted recorded session's record, made only while the
// boundary's own reading of its state is unknown or unavailable. Nothing is stopped,
// renamed, or marked; a record file that cannot be written is answered with
// why, the record kept.
async function deleted(
  { source, record }: Extract<Admitted, { readonly kind: "delete" }>,
  launches: AgentLaunches,
): Promise<DeleteRecordAnswer> {
  const joined = await launches.stateOf(source, record);
  if (!recordDeletable(joined)) {
    return { kind: "state-known", record: joined };
  }
  try {
    await deleteRecord(source.id, record.session);
  } catch (error) {
    throw new RefusedRequest(
      500,
      `The session record could not be deleted: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
  return { kind: "deleted" };
}

export async function answer(
  req: IncomingMessage,
  url: URL,
  res: ServerResponse,
  launches: AgentLaunches,
  terminals: AgentTerminals,
  alerts: SessionAlerts,
): Promise<AgentLaunchAnswer> {
  try {
    if (url.pathname === completionEndpoint)
      return { status: 200, body: await submitCompletion(req) };
    const request = await admitted(req, url, launches);
    switch (request.kind) {
      case "host-options": {
        return await withResponseSignal(res, async (signal) => {
          try {
            if (request.host.options === undefined)
              throw new Error("Host startup choices unavailable.");
            return {
              status: 200,
              body: await request.host.options(signal, request.cwd),
            };
          } catch {
            return {
              status: 503,
              body: {
                error:
                  request.host.description.modelCatalog?.unreadable ??
                  `${request.host.name} model choices could not be read.`,
              },
            };
          }
        });
      }
      case "result":
        return await sessionResultResponse(request.record, res);
      case "cursor-sessions":
        return { status: 200, body: await heldCursorSessions() };
      case "sessions": {
        const { attempts, readable } = await launches.attempts();
        return {
          status: 200,
          body: {
            records: await launches.machineSessions(),
            attempts,
            attemptsReadable: readable,
            hostOperations: hostOperations(),
            creations: await launches.creations(),
            alerts: alerts.availability(),
            establishing: await launches.establishingProjects(),
            establishingPreparation: await launches.establishingPreparation(),
            keptStarts: await launches.keptStarts(),
            starts: launches.runningStarts(),
            definitions: await launches.offeredDefinitions(),
            establishingHosts: await launches.establishingHosts(),
            sessionPolicies: await launches.sessionPolicies(),
          },
        };
      }
      case "changed":
        return {
          status: 200,
          body: await launches.changed(request.attempt, changeWaitMs),
        };
      case "accept":
        return {
          status: 200,
          body: await launches.accept(
            request.source,
            request.request,
            `http://${req.headers.host}`,
          ),
        };
      case "continue":
        return {
          status: 200,
          body: await launches.continueAttempt(request.source, request.attempt),
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
          body: { record: await markedDone(request, launches, terminals) },
        };
      case "delete":
        return { status: 200, body: await deleted(request, launches) };
    }
  } catch (error) {
    if (error instanceof RefusedRequest) {
      return { status: error.status, body: { error: error.message } };
    }
    throw error;
  }
}
