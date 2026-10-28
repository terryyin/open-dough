// Passive final report: changing selection cancels the previous identity's read.
// Mark as done asks first, below the header, as the terminal's does.
import { useEffect, useRef, useState } from "react";
import {
  launchSubject,
  recordedWorkspace,
  type LaunchWithState,
} from "./agentLaunch.ts";
import { InPlaceQuestion, useAskInPlace } from "./AskInPlace.tsx";
import {
  finalReportEndpoint,
  finalReportSchema,
  type FinalReportRead,
} from "./finalReportContract.ts";
import { marksRecordDone } from "./sessionCapabilities.ts";
import {
  productClosureEvidencePresent,
  workspaceLimitation,
} from "./sessionAccess.ts";
import { sessionDoneMeaning } from "./sessionShown.ts";
import {
  sidePanelCloseShortcutLabel,
  useSidePanelCloseShortcut,
} from "./SidePanelControls.tsx";
import {
  doneAnswers,
  markDoneUnresolved,
  notMarkedDone,
  useDoneMark,
  usePageSessions,
  type MarkSessionDone,
  type SessionRequest,
} from "./pageSessions.ts";
import { PanelDivider } from "./PanelDivider.tsx";
import "./frame-controls.css";
import "./side-panel.css";
import "./final-report.css";

export function FinalReport({
  session,
  current,
  onClose,
  onMarkDone,
}: {
  readonly session: SessionRequest;
  // The session as the page reads it now, which Mark as done decides by.
  readonly current: LaunchWithState;
  readonly onClose: () => void;
  readonly onMarkDone: MarkSessionDone;
}) {
  const { record } = session;
  const { hostOperations } = usePageSessions();
  const [finalReport, setFinalReport] = useState<FinalReportRead | undefined>();
  const [attempt, setAttempt] = useState(0);
  const report = useRef<HTMLDivElement>(null);
  const { asksFirst, marking, mark } = useDoneMark(current, hostOperations);
  const asking = useAskInPlace(asksFirst, () => mark(onMarkDone(session)));
  useSidePanelCloseShortcut(onClose);
  useEffect(() => {
    const controller = new AbortController();
    let current = true;
    setFinalReport(undefined);
    const query = new URLSearchParams({
      source: record.request.source,
      host: record.session.host,
      session: record.session.sessionId,
    });
    void fetch(`${finalReportEndpoint}?${query}`, {
      signal: controller.signal,
      cache: "no-store",
    })
      .then(async (response) => {
        if (!response.ok) throw new Error("Final report read refused");
        return finalReportSchema.parse(await response.json());
      })
      .then((answer) => {
        if (current) setFinalReport(answer);
      })
      .catch(() => {
        if (current)
          setFinalReport({
            kind: "unavailable",
            explanation:
              "The final report could not be read. The saved conversation is unchanged.",
          });
      });
    return () => {
      current = false;
      controller.abort();
    };
  }, [
    record.request.source,
    record.session.host,
    record.session.sessionId,
    attempt,
  ]);
  useEffect(() => {
    report.current?.focus();
  }, []);
  const { title, name } = launchSubject(record.request);
  return (
    <section className="side-panel final-report" aria-label="Final report">
      <PanelDivider />
      <div className="final-report-scroll">
        <header className="side-panel-header">
          <div className="side-panel-names">
            <h2>{title}</h2>
            <p>
              {name} session <code>{record.session.sessionId}</code>
            </p>
          </div>
          <div className="side-panel-actions">
            {marksRecordDone(hostOperations, record) &&
              record.doneAt === undefined && (
                <button
                  ref={asking.control}
                  type="button"
                  className="frame-button"
                  disabled={marking === "marking" || asking.shown}
                  onClick={(event) => {
                    asking.press(event.currentTarget);
                  }}
                >
                  Mark as done
                </button>
              )}
            <button
              type="button"
              className="frame-button"
              onClick={onClose}
              title={`Close (${sidePanelCloseShortcutLabel})`}
            >
              Close
            </button>
          </div>
        </header>
        {asking.shown && (
          <InPlaceQuestion
            asking={asking}
            {...doneAnswers}
            placed="side-panel-question"
          />
        )}
        <div ref={report} className="final-report-body" tabIndex={-1}>
          <p>
            Read-only final report. Reading it does not continue or mark the
            session done.
          </p>
          <p>{sessionDoneMeaning}</p>
          {finalReport?.productClosureEvidence === true && (
            <p>{productClosureEvidencePresent}</p>
          )}
          <p>{workspaceLimitation(record)}</p>
          <p>
            Saved workspace <code>{recordedWorkspace(record)}</code>
          </p>
          <div role="status">
            {marking === "marking" && <p>Marking as done…</p>}
            {marking === "unresolved" && <p>{markDoneUnresolved}</p>}
            {marking === "not-marked" && <p>{notMarkedDone}</p>}
            {finalReport === undefined && <p>Reading final report…</p>}
            {finalReport?.kind === "unavailable" && (
              <>
                <p>{finalReport.explanation}</p>
                <button
                  type="button"
                  onClick={() => {
                    setFinalReport(undefined);
                    setAttempt((previous) => previous + 1);
                  }}
                >
                  Retry report
                </button>
              </>
            )}
          </div>
          {finalReport?.kind === "available" && (
            <pre className="final-report-text">{finalReport.text}</pre>
          )}
        </div>
      </div>
    </section>
  );
}
