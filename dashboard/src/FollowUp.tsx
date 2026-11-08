// Follow up on a standalone Done session in Recently done whose earlier
// conversation can no longer be continued (`offersFollowUp`): the project's
// Start session dialog, naming the session and listing the context the
// server will send with the request (`./followUpContext.ts`). The source
// session stays as it is: only a new ad hoc session is started.

import type { MachineSessions } from "./agentLaunches.ts";
import type { LaunchWithState } from "./agentLaunch.ts";
import { sessionContext } from "./followUpContext.ts";
import type { FollowUpSource } from "./followUpRequest.ts";
import { usePageSessions } from "./pageSessions.ts";
import { offersFollowUp } from "./sessionAccess.ts";
import { StartSession } from "./StartSession.tsx";

export function SessionFollowUp({
  record,
  project,
  sourceId,
  launches,
}: {
  readonly record: LaunchWithState;
  // The project's name.
  readonly project: string;
  readonly sourceId: string;
  readonly launches: MachineSessions;
}) {
  const { hostOperations } = usePageSessions();
  if (!offersFollowUp([record], hostOperations)) return null;
  const source: FollowUpSource = {
    session: { host: record.session.host, sessionId: record.session.sessionId },
  };
  const context = sessionContext(record);
  return (
    <StartSession
      project={project}
      sourceId={sourceId}
      launches={launches}
      followUp={{ source, name: context.label, sessions: [context] }}
    />
  );
}
