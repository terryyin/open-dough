// How every entry shows its session's state, by the one reading
// (`sessionShown`): the class that gives an entry needing the developer its
// heavier edge, the state's words, with an unread report's words in a line of
// their own, and its label, tone, and unread report's words, for an entry
// that marks its state by its own edge and its unread report by its own mark.
import type { ReactNode } from "react";
import type { LaunchWithState } from "./agentLaunch.ts";
import {
  sessionShown,
  unreadReportWording,
  type SessionTone,
} from "./sessionShown.ts";

export function shownSession(record: LaunchWithState): {
  readonly entryClass: string;
  readonly stateWords: ReactNode;
  readonly label: string;
  readonly tone: SessionTone;
  readonly unreadReportWords?: string;
} {
  const { label, note, needsAttention, tone, unreadReport } =
    sessionShown(record);
  const unreadReportWords =
    unreadReport === undefined ? undefined : unreadReportWording(unreadReport);
  return {
    label,
    tone,
    ...(unreadReportWords === undefined ? {} : { unreadReportWords }),
    entryClass: needsAttention
      ? "session-entry needs-attention"
      : "session-entry",
    stateWords: (
      <>
        <p className="session-state">
          {label}
          {note !== undefined && <span className="quiet">: {note}</span>}
        </p>
        {unreadReportWords !== undefined && (
          <p className="session-unread-report">{unreadReportWords}</p>
        )}
      </>
    ),
  };
}
