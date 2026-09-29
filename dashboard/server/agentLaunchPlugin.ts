// The local launch boundary, mounted by Vite in dev and preview
// (`./localBoundaryPlugin.ts`) beside the authenticated read boundary. A same-origin
// POST to `/__agent-launch` asks to launch an agent on one work item
// (`./agentLaunches.ts`); a GET `?source=` answers that project's launch
// records with each session's current state. A same-origin POST to
// `/__agent-launch/done` marks one session it recorded done
// (`./doneMarks.ts`). A same-origin WebSocket upgrade to
// `/__agent-terminal?source=&session=` attaches to one session this boundary
// recorded for that project (`./agentTerminals.ts`). Which requests are
// admitted is decided in `./agentLaunchAdmission.ts`. Everything else
// -- another site, an unknown project, a workflow or host this boundary does
// not launch, malformed text, another method, a session it did not record --
// is refused before any host process starts, and a session Claude Code no
// longer lists is refused before any `claude attach`.

import type { IncomingMessage, ServerResponse } from "node:http";
import type { Connect, HttpServer, Plugin } from "vite";
import {
  agentLaunchEndpoint,
  type LaunchResult,
  type LaunchWithState,
} from "../src/agentLaunch.ts";
import { agentDoneEndpoint } from "../src/doneMark.ts";
import {
  admitted,
  admittedAttach,
  type Admitted,
} from "./agentLaunchAdmission.ts";
import { AgentLaunches } from "./agentLaunches.ts";
import { AgentTerminals } from "./agentTerminals.ts";
import { markSessionDone } from "./doneMarks.ts";
import { localBoundaryPlugin } from "./localBoundaryPlugin.ts";
import { RefusedRequest } from "./localOrigin.ts";

type Answer =
  | { readonly status: number; readonly body: LaunchResult }
  | {
      readonly status: number;
      readonly body: { records: readonly LaunchWithState[] };
    }
  | { readonly status: number; readonly body: { record: LaunchWithState } }
  | { readonly status: number; readonly body: { error: string } };

// A done mark on the admitted recorded session, with its current state.
async function markedDone(
  { source, record, folder }: Extract<Admitted, { readonly kind: "done" }>,
  launches: AgentLaunches,
  terminals: AgentTerminals,
): Promise<LaunchWithState> {
  const marked = await markSessionDone(source.id, record, folder, terminals);
  return launches.stateOf(source, marked);
}

async function answer(
  req: IncomingMessage,
  url: URL,
  launches: AgentLaunches,
  terminals: AgentTerminals,
): Promise<Answer> {
  try {
    const request = await admitted(req, url, launches);
    switch (request.kind) {
      case "records":
        return {
          status: 200,
          body: { records: await launches.recordsOf(request.source) },
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
  const terminals = new AgentTerminals(httpServer, (req, url) =>
    admittedAttach(req, url, launches),
  );
  middlewares.use((req, res, next) => {
    const url = new URL(req.url ?? "", "http://placeholder");
    if (
      url.pathname !== agentLaunchEndpoint &&
      url.pathname !== agentDoneEndpoint
    ) {
      next();
      return;
    }
    void answer(req, url, launches, terminals).then((outcome) => {
      respond(res, outcome);
    }, next);
  });
  return () => {
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
