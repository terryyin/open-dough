// Passive final report: changing selection cancels the previous identity's read.
// Mark as done asks first, below the header, as the terminal's does.
import { useEffect, useRef, useState } from "react";
import { launchSubject, type LaunchWithState } from "./agentLaunch.ts";
import { InPlaceQuestion, useAskInPlace } from "./AskInPlace.tsx";
import {
  sessionResultEndpoint,
  sessionResultSchema,
  type SessionResult,
} from "./sessionResult.ts";
import { marksRecordDone } from "./sessionCapabilities.ts";
import { workspaceLimitation } from "./sessionAccess.ts";
import { closeShortcutLabel, usePanelCloseShortcut } from "./PanelControls.tsx";
import {
  doneAnswers,
  notMarkedDone,
  useDoneMark,
  usePageSessions,
  type MarkSessionDone,
  type SessionRequest,
} from "./pageSessions.ts";
import { SidePanelEdge } from "./SidePanelEdge.tsx";
import "./frame-controls.css";
import "./side-panel.css";
import "./session-result.css";

export function SessionResultPanel({
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
  const [result, setResult] = useState<SessionResult | undefined>();
  const [attempt, setAttempt] = useState(0);
  const report = useRef<HTMLDivElement>(null);
  const { asksFirst, marking, mark } = useDoneMark(current);
  const asking = useAskInPlace(asksFirst, () => mark(onMarkDone(session)));
  usePanelCloseShortcut(onClose);
  useEffect(() => {
    const controller = new AbortController();
    let current = true;
    setResult(undefined);
    const query = new URLSearchParams({
      source: record.request.source,
      host: record.session.host,
      session: record.session.sessionId,
    });
    void fetch(`${sessionResultEndpoint}?${query}`, {
      signal: controller.signal,
      cache: "no-store",
    })
      .then(async (response) => {
        if (!response.ok) throw new Error("Result read refused");
        return sessionResultSchema.parse(await response.json());
      })
      .then((answer) => {
        if (current) setResult(answer);
      })
      .catch(() => {
        if (current)
          setResult({
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
    <section
      className="side-panel session-result-panel"
      aria-label="Final report"
    >
      <SidePanelEdge />
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
            title={`Close (${closeShortcutLabel})`}
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
      <div ref={report} className="session-result-body" tabIndex={-1}>
        <p>
          Read-only final report. Reading it does not continue or mark the
          session done.
        </p>
        <p>{workspaceLimitation(record)}</p>
        <p>
          Saved workspace{" "}
          <code>
            {record.session.host === "codex"
              ? record.session.continuation?.workspace
              : undefined}
          </code>
        </p>
        <div role="status">
          {marking === "marking" && <p>Marking as done…</p>}
          {marking === "not-marked" && <p>{notMarkedDone}</p>}
          {result === undefined && <p>Reading final report…</p>}
          {result?.kind === "unavailable" && (
            <>
              <p>{result.explanation}</p>
              <button
                type="button"
                onClick={() => {
                  setResult(undefined);
                  setAttempt((previous) => previous + 1);
                }}
              >
                Retry report
              </button>
            </>
          )}
        </div>
        {result?.kind === "available" && (
          <pre className="session-final-report">{result.text}</pre>
        )}
      </div>
    </section>
  );
}
