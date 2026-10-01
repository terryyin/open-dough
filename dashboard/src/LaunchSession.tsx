// A launch record's native session and its host's continuation capabilities.
// Every session entry (`./SessionEntry.tsx`) uses this presentation; embedded
// terminal access additionally requires the host capability and `attachOpens`.

import { embeddedTerminal, shellCommand } from "./sessionCapabilities.ts";
import { attachOpens, type LaunchWithState } from "./agentLaunch.ts";
import { usePageSessions } from "./pageSessions.ts";
import { useFrameDescription } from "./protectedFrame.ts";
import "./agent-launch.css";

export function LaunchSession({
  record,
}: {
  readonly record: LaunchWithState;
}) {
  const { openTerminal } = usePageSessions();
  const described = useFrameDescription();
  return (
    <>
      <p>
        Session <code>{record.session.sessionId}</code>
      </p>
      {record.session.continuation !== undefined && (
        <>
          <p>
            Workspace <code>{record.session.continuation.workspace}</code>
          </p>
          <p>
            Continue in Codex:{" "}
            <code>{shellCommand(record.session.continuation.args)}</code>
          </p>
          <p>
            {record.firstInput?.state === "confirmed"
              ? "First input accepted"
              : record.firstInput?.intent === "blank"
                ? record.firstInput.state === "not-requested"
                  ? "Opened without an instruction"
                  : "Blank conversation persistence unconfirmed"
                : record.firstInput?.state === "awaiting"
                  ? "First input awaiting submission"
                  : "First input acceptance uncertain"}
          </p>
          {record.session.continuation.notice !== undefined && (
            <p className="quiet">{record.session.continuation.notice}</p>
          )}
          {record.firstInput?.state !== "confirmed" &&
            record.firstInput?.explanation !== undefined && (
              <p className="quiet">{record.firstInput.explanation}</p>
            )}
        </>
      )}
      {embeddedTerminal(record.session.host) &&
        attachOpens(record.sessionState) && (
          <p className="launch-open">
            <button
              type="button"
              aria-describedby={described}
              onClick={(event) => {
                openTerminal({ record, control: event.currentTarget });
              }}
            >
              Open terminal
            </button>
          </p>
        )}
    </>
  );
}
