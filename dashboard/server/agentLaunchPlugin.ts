// The local launch boundary, mounted by Vite in dev and preview
// (`./localBoundaryPlugin.ts`) beside the authenticated read boundary. A same-origin
// POST to `/__agent-launch/accept` asks to launch an agent on one work item
// (`./agentLaunches.ts`) and answers once the launch's owner accepted it,
// the launch going on whatever happens to the caller; a same-origin POST to
// `/__agent-launch/continue` asks to continue one kept attempt that needs
// reconciliation, answered the same way; a same-origin POST to
// `/__agent-launch/reconciled` notes that a settled attempt reconciled with
// published state, or answers why not; a same-origin POST to
// `/__agent-launch/verify` settles a story attempt whose launch is uncertain
// from its host's own session listing, or answers why it stays unresolved; a
// same-origin GET of `/__agent-launch/changed?attempt=` answers once that accepted attempt
// changed, or after a bounded wait. A same-origin GET of the session result
// endpoint reads one kept session's final report through its host, bounded
// and abandoned when the caller leaves. A same-origin GET answers the machine's
// sessions: every catalog project's launch records, each naming its project,
// with each session's current state, and the launch attempts accepted with
// their receipts and outcomes, and whether those kept could be read. A
// same-origin GET of `/__agent-launch/cursor-sessions` reads whether the
// Cursor runner is running and which sessions it holds, and starts nothing.
// A same-origin POST to
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

import type { Connect, HttpServer, Plugin } from "vite";
import { admittedAttach, launchBoundaryPaths } from "./agentLaunchAdmission.ts";
import { AgentLaunches } from "./agentLaunches.ts";
import { AgentTerminals } from "./agentTerminals.ts";
import { respondToLaunch } from "./agentLaunchResponse.ts";
import {
  closeCursorHolds,
  ensureCursorRunner,
} from "./hosts/cursor/runnerClient.ts";
import { answer } from "./launchBoundaryAnswer.ts";
import { localBoundaryPlugin } from "./localBoundaryPlugin.ts";
import { SessionAlerts } from "./sessionAlerts.ts";

async function installAgentLaunchMiddleware(
  middlewares: Connect.Server,
  httpServer: HttpServer | null,
): Promise<() => void> {
  const launches = new AgentLaunches();
  const alerts = new SessionAlerts(launches);
  const terminals = new AgentTerminals(httpServer, (req, url) =>
    admittedAttach(req, url, launches),
  );
  // The runner outlives this server. Start it when it is not already
  // accepting, and wait so a launch does not time out on that startup.
  await ensureCursorRunner();
  middlewares.use((req, res, next) => {
    const url = new URL(req.url ?? "", "http://placeholder");
    if (!launchBoundaryPaths.has(url.pathname)) {
      next();
      return;
    }
    void answer(req, url, res, launches, terminals, alerts).then((outcome) => {
      respondToLaunch(res, outcome);
    }, next);
  });
  return () => {
    closeCursorHolds();
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
