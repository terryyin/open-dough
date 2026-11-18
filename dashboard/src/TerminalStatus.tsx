// Status lines the terminal panel shows above its screen: dictation, paste,
// submit-and-close confirmation, Mark as done progress, and attachment recovery.

import type { ReactNode } from "react";
import {
  markDoneUnresolved,
  notMarkedDone,
  type Marking,
} from "./pageSessions.ts";

export function TerminalStatus({
  dictationFeedback,
  pasteFeedback,
  submitAndCloseFeedback,
  marking,
  status,
  onAttachAgain,
}: {
  readonly dictationFeedback: ReactNode;
  readonly pasteFeedback: string | undefined;
  readonly submitAndCloseFeedback: string | undefined;
  readonly marking: Marking | undefined;
  readonly status:
    { readonly says: string; readonly action: string } | undefined;
  readonly onAttachAgain: () => void;
}) {
  return (
    <div role="status" className="terminal-status">
      {dictationFeedback}
      {pasteFeedback && <p>{pasteFeedback}</p>}
      {submitAndCloseFeedback && <p>{submitAndCloseFeedback}</p>}
      {marking === "marking" && <p className="quiet">Marking as done…</p>}
      {marking === "unresolved" && <p>{markDoneUnresolved}</p>}
      {marking === "not-marked" && <p>{notMarkedDone}</p>}
      {status && marking !== "marking" && (
        <>
          <p>{status.says}</p>
          <button
            type="button"
            className="frame-button"
            onClick={onAttachAgain}
          >
            {status.action}
          </button>
        </>
      )}
    </div>
  );
}
