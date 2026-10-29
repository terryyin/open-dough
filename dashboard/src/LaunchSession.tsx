// A launch record's native session and its host's continuation capabilities.
// Every session entry (`./SessionEntry.tsx`) uses this presentation; embedded
// terminal access additionally requires the host capability and `attachOpens`.

import { sessionAccess, workspaceLimitation } from "./sessionAccess.ts";
import { type LaunchWithState } from "./agentLaunch.ts";
import { usePageSessions } from "./pageSessions.ts";
import { useFrameDescription } from "./protectedFrame.ts";
import { ArrowUpRight, FileText, Terminal } from "lucide-react";
import { Icon } from "./Icon.tsx";
import "./agent-launch.css";

export function LaunchSession({
  record,
}: {
  readonly record: LaunchWithState;
}) {
  const { openSession, hostOperations } = usePageSessions();
  const access = sessionAccess(record, hostOperations);
  const described = useFrameDescription();
  if (access === undefined) return null;
  return (
    <p className="launch-open session-primary-action">
      <button
        type="button"
        className="frame-button frame-button-primary"
        aria-describedby={described}
        onClick={(event) => {
          openSession({ record, control: event.currentTarget });
        }}
      >
        <Icon icon={access === "final-report" ? FileText : Terminal} />
        {access === "final-report" ? "Read final report" : "Open terminal"}
        <Icon icon={ArrowUpRight} />
      </button>
    </p>
  );
}

// Uncertainty and access/recovery limitations remain in the scan view; closing
// details must never hide an instruction the developer needs to act on.
export function LaunchSessionNotice({
  record,
}: {
  readonly record: LaunchWithState;
}) {
  const limitation = workspaceLimitation(record);
  const continuation =
    "continuation" in record.session ? record.session.continuation : undefined;
  const input = record.firstInput;
  const inputUncertain =
    continuation !== undefined &&
    input?.state !== "confirmed" &&
    !(input?.intent === "blank" && input.state === "not-requested");
  return (
    <>
      {inputUncertain && (
        <p className="launch-problem">
          {input?.intent === "blank"
            ? "Blank conversation persistence unconfirmed"
            : input?.state === "awaiting"
              ? "First input awaiting submission"
              : "First input acceptance uncertain"}
        </p>
      )}
      {inputUncertain && input?.explanation !== undefined && (
        <p className="quiet">{input.explanation}</p>
      )}
      {continuation !== undefined &&
        "notice" in continuation &&
        continuation.notice !== undefined && (
          <p className="quiet">{continuation.notice}</p>
        )}
      {limitation !== undefined && <p className="quiet">{limitation}</p>}
    </>
  );
}
