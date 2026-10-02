// The local launch boundary, mounted by Vite in dev and preview
// (`./localBoundaryPlugin.ts`) beside the authenticated read boundary. A same-origin
// POST to `/__agent-launch/accept` asks to launch an agent on one work item
// (`./agentLaunches.ts`) and answers once the launch's owner accepted it,
// the launch going on whatever happens to the caller; a same-origin POST to
// `/__agent-launch/continue` asks to continue one kept attempt that needs
// reconciliation, answered the same way; a same-origin GET of
// `/__agent-launch/changed?attempt=` answers once that accepted attempt
// changed, or after a bounded wait. A same-origin GET of the session result
// endpoint reads one kept session's final report through its host, bounded
// and abandoned when the caller leaves. A same-origin GET answers the machine's
// sessions: every catalog project's launch records, each naming its project,
// with each session's current state, and the launch attempts accepted with
// their receipts and outcomes, and whether those kept could be read. A
// same-origin POST to
// `/__agent-launch/done` marks one session it recorded done
// (`./doneMarks.ts`). A same-origin POST to `/__agent-launch/delete` deletes
// the record of one session it recorded while its host's observation still
// leaves that session's state unknown. A same-origin WebSocket upgrade to
// `/__agent-terminal?source=&host=&session=` attaches to one session this boundary
// recorded for that project (`./agentTerminals.ts`). Which requests are
// admitted is decided in `./agentLaunchAdmission.ts`. While it runs it also
// watches the machine's sessions and raises a macOS notification when one
// starts needing the developer (`./sessionAlerts.ts`), and the sessions answer
// says whether it can; it also names the starts kept without a session and
// the starts running with their phases. Everything else
// -- another site, an unknown project, a workflow or host this boundary does
// not launch, malformed text, another method, a session it did not record --
// is refused before any host process starts, and a session its host confirms
// unavailable is refused before native terminal attachment.

import { withResponseSignal } from "./responseSignal.ts";
import { launchHostOptionsEndpoint } from "../src/launchHostOptions.ts";
import type { IncomingMessage, ServerResponse } from "node:http";
import type { Connect, HttpServer, Plugin } from "vite";
import {
  agentAcceptEndpoint,
  agentChangedEndpoint,
  agentContinueEndpoint,
  agentLaunchEndpoint,
  type LaunchWithState,
  recordDeletable,
} from "../src/agentLaunch.ts";
import {
  agentDeleteEndpoint,
  type DeleteRecordAnswer,
} from "../src/deleteRecord.ts";
import { agentDoneEndpoint } from "../src/doneMark.ts";
import {
  admitted,
  admittedAttach,
  type Admitted,
} from "./agentLaunchAdmission.ts";
import { AgentLaunches } from "./agentLaunches.ts";
import { AgentTerminals } from "./agentTerminals.ts";
import { markSessionDone } from "./doneMarks.ts";
import { deleteRecord } from "./launchRecordStore.ts";
import { localBoundaryPlugin } from "./localBoundaryPlugin.ts";
import { RefusedRequest } from "./localOrigin.ts";
import { SessionAlerts } from "./sessionAlerts.ts";
import { sessionResultEndpoint } from "../src/sessionResult.ts";
import { hostOperations, launchHost } from "./launchHosts.ts";
import {
  respondToLaunch,
  type AgentLaunchAnswer,
} from "./agentLaunchResponse.ts";

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

async function answer(
  req: IncomingMessage,
  url: URL,
  res: ServerResponse,
  launches: AgentLaunches,
  terminals: AgentTerminals,
  alerts: SessionAlerts,
): Promise<AgentLaunchAnswer> {
  try {
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
                  "Codex model choices could not be read. Retry, or use the Codex setting.",
              },
            };
          }
        });
      }
      case "result":
        return await withResponseSignal(res, async (signal) => {
          const host = launchHost(request.record.session.host);
          if (host?.readResult === undefined)
            throw new RefusedRequest(
              400,
              "This host cannot read a final report.",
            );
          return {
            status: 200,
            body: await host.readResult(request.record.session, signal),
          };
        });
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
          body: await launches.accept(request.source, request.request),
        };
      case "continue":
        return {
          status: 200,
          body: await launches.continueAttempt(request.source, request.attempt),
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

function installAgentLaunchMiddleware(
  middlewares: Connect.Server,
  httpServer: HttpServer | null,
): () => void {
  const launches = new AgentLaunches();
  const alerts = new SessionAlerts(launches);
  const terminals = new AgentTerminals(httpServer, (req, url) =>
    admittedAttach(req, url, launches),
  );
  middlewares.use((req, res, next) => {
    const url = new URL(req.url ?? "", "http://placeholder");
    if (
      url.pathname !== launchHostOptionsEndpoint &&
      url.pathname !== sessionResultEndpoint &&
      url.pathname !== agentLaunchEndpoint &&
      url.pathname !== agentAcceptEndpoint &&
      url.pathname !== agentChangedEndpoint &&
      url.pathname !== agentContinueEndpoint &&
      url.pathname !== agentDoneEndpoint &&
      url.pathname !== agentDeleteEndpoint
    ) {
      next();
      return;
    }
    void answer(req, url, res, launches, terminals, alerts).then((outcome) => {
      respondToLaunch(res, outcome);
    }, next);
  });
  return () => {
    alerts.close();
    terminals.close();
    launches.close();
  };
}

export function agentLaunchPlugin(): Plugin {
  return localBoundaryPlugin(
    "dough-agent-launch",
    installAgentLaunchMiddleware,
  );
}
