// The local launch boundary, mounted by Vite in dev and preview
// (`./localBoundaryPlugin.ts`) beside the authenticated read boundary. A same-origin
// POST to `/__agent-launch` asks to launch an agent on one work item
// (`./agentLaunches.ts`); a same-origin GET answers the machine's sessions:
// every catalog project's launch records, each naming its project, with each
// session's current state. A same-origin POST to
// `/__agent-launch/done` marks one session it recorded done
// (`./doneMarks.ts`). A same-origin POST to `/__agent-launch/delete` deletes
// the record of one session it recorded while Claude Code's listing still
// leaves that session's state unknown. A same-origin WebSocket upgrade to
// `/__agent-terminal?source=&session=` attaches to one session this boundary
// recorded for that project (`./agentTerminals.ts`). Which requests are
// admitted is decided in `./agentLaunchAdmission.ts`. While it runs it also
// watches the machine's sessions and raises a macOS notification when one
// starts needing the developer (`./sessionAlerts.ts`), and the sessions answer
// says whether it can; it also names the starts kept without a session and
// the starts running with their phases. Everything else
// -- another site, an unknown project, a workflow or host this boundary does
// not launch, malformed text, another method, a session it did not record --
// is refused before any host process starts, and a session Claude Code no
// longer lists is refused before any `claude attach`.

import type { IncomingMessage, ServerResponse } from "node:http";
import type { Connect, HttpServer, Plugin } from "vite";
import {
  agentLaunchEndpoint,
  type Alerts,
  type KeptStart,
  type LaunchResult,
  type RunningStart,
  type LaunchWithState,
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

type Answer =
  | { readonly status: number; readonly body: LaunchResult }
  | {
      readonly status: number;
      readonly body: {
        records: readonly LaunchWithState[];
        alerts: Alerts;
        establishing: readonly string[];
        keptStarts: readonly KeptStart[];
        starts: readonly RunningStart[];
      };
    }
  | { readonly status: number; readonly body: { record: LaunchWithState } }
  | { readonly status: number; readonly body: DeleteRecordAnswer }
  | { readonly status: number; readonly body: { error: string } };

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
// boundary's own reading of its state is still unknown. Nothing is stopped,
// renamed, or marked; a record file that cannot be written is answered with
// why, the record kept.
async function deleted(
  { source, record }: Extract<Admitted, { readonly kind: "delete" }>,
  launches: AgentLaunches,
): Promise<DeleteRecordAnswer> {
  const joined = await launches.stateOf(source, record);
  if (joined.sessionState.kind !== "unknown") {
    return { kind: "state-known", record: joined };
  }
  try {
    await deleteRecord(source.id, record.session.sessionId);
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
  launches: AgentLaunches,
  terminals: AgentTerminals,
  alerts: SessionAlerts,
): Promise<Answer> {
  try {
    const request = await admitted(req, url, launches);
    switch (request.kind) {
      case "sessions":
        return {
          status: 200,
          body: {
            records: await launches.machineSessions(),
            alerts: alerts.availability(),
            establishing: await launches.establishingProjects(),
            keptStarts: await launches.keptStarts(),
            starts: launches.runningStarts(),
          },
        };
      case "launch":
        return {
          status: 200,
          body: await launches.launch(request.source, request.request),
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

function respond(res: ServerResponse, { status, body }: Answer): void {
  if (res.writableEnded || res.destroyed) {
    return;
  }
  res.writeHead(status, {
    "Cache-Control": "no-store",
    "Content-Type": "application/json",
  });
  res.end(JSON.stringify(body));
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
      url.pathname !== agentLaunchEndpoint &&
      url.pathname !== agentDoneEndpoint &&
      url.pathname !== agentDeleteEndpoint
    ) {
      next();
      return;
    }
    void answer(req, url, launches, terminals, alerts).then((outcome) => {
      respond(res, outcome);
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
