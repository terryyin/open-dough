// The page's one native session terminal: output, input and size follow its
// mounted attachment, which reports readiness and keeps startup interactive.
// The header names its session and agent, and offers dictation, Done where
// supported, maximize/restore and Close. Closing or replacing the view detaches
// without ending the session; plain Escape still goes to the native terminal.
// Disconnected or ended attachments can reopen the same session. The saved
// terminal theme applies to this content and its Side panel border.
// Done asks first when completion is unknown, closes the view after success,
// and leaves the terminal visible with recovery guidance when marking fails.

import {
  useCallback,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type RefObject,
} from "react";
import { CircleCheck } from "lucide-react";
import { marksRecordDone } from "./sessionCapabilities.ts";
import { SidePanelControls } from "./SidePanelControls.tsx";
import { SidePanelTitle } from "./SidePanelTitle.tsx";
import "@xterm/xterm/css/xterm.css";
import { PanelDivider } from "./PanelDivider.tsx";
import "./agent-launch.css";
import "./frame-controls.css";
import "./side-panel.css";
import "./agent-terminal.css";
import { IconButton } from "./Icon.tsx";
import { launchSubject, type LaunchWithState } from "./agentLaunch.ts";
import { InPlaceQuestion, useAskInPlace } from "./AskInPlace.tsx";
import { AgentPortrait } from "./AgentPortrait.tsx";
import { usePortraitPreview } from "./terminalPortraitPreview.ts";
import { keepHeight } from "./measuredHeight.ts";
import { assignedAgent } from "./launchRecord.ts";
import { agentNameOf } from "../../src/skills/dough-product-backlog/scripts/product-backlog-agent-profile.mjs";
import {
  useAttachedTerminal,
  type TerminalEnding,
} from "./useAttachedTerminal.ts";
import {
  doneAnswers,
  markDoneUnresolved,
  notMarkedDone,
  useDoneMark,
  usePageSessions,
  type MarkSessionDone,
  type SessionOperation,
  type SessionRequest,
} from "./pageSessions.ts";
import type { TerminalWorkspaceUnavailable } from "./agentTerminal.ts";
import { useShownTerminalTheme } from "./savedTerminalTheme.ts";
import { terminalPalette } from "./terminalThemes.ts";
import { useTerminalDictation } from "./useTerminalDictation.tsx";

// Keeps `--terminal-rows-height` on the identity at the height of its title
// and session rows, however they wrap, so the agent portrait beside them
// stays proportionate to both, with its stylesheet's compact cap.
function useRowsHeight(
  identity: RefObject<HTMLDivElement | null>,
  rows: RefObject<HTMLDivElement | null>,
) {
  useLayoutEffect(() => {
    const target = identity.current;
    const measured = rows.current;
    if (!target || !measured) return;
    return keepHeight(measured, target, "--terminal-rows-height").stop;
  }, [identity, rows]);
}

const endings = {
  disconnected: { says: "Disconnected from the session", action: "Reconnect" },
  ended: { says: "The terminal ended", action: "Open again" },
  failed: { says: "The session could not be attached", action: "Reconnect" },
} as const;

export function Terminal({
  session,
  current,
  onAttached,
  maximized,
  onMaximize,
  offerMaximize,
  onClose,
  onMarkDone,
  onWorkspaceUnavailable,
}: {
  // The request that opened the panel, which the panel asks its operations
  // with.
  readonly session: SessionRequest;
  // The session as the page reads it now, which Mark as done decides by.
  readonly current: LaunchWithState;
  // Told once each attachment first shows the session's output; it keeps its
  // identity across renders.
  readonly onAttached: SessionOperation<void>;
  // Whether the panel takes the page column's room, and how it asks to
  // change that.
  readonly maximized: boolean;
  readonly onMaximize: (maximized: boolean) => void;
  // False while covering: Maximize/Restore is not offered.
  readonly offerMaximize: boolean;
  readonly onClose: () => void;
  // Answers whether the session was marked done; the panel closes if it was.
  readonly onMarkDone: MarkSessionDone;
  readonly onWorkspaceUnavailable: (
    request: SessionRequest,
    workspace: TerminalWorkspaceUnavailable,
  ) => void;
}) {
  const { record } = session;
  const { hostOperations } = usePageSessions();
  const screen = useRef<HTMLDivElement>(null);
  const actions = useRef<HTMLDivElement>(null);
  const inputHelp = useId();
  const identity = useRef<HTMLDivElement>(null);
  const names = useRef<HTMLDivElement>(null);
  const [attempt, setAttempt] = useState(0);
  const [ending, setEnding] = useState<TerminalEnding | undefined>();
  const [refusal, setRefusal] = useState<string | undefined>();
  const onAttachRefusal = useCallback((explanation: string) => {
    setRefusal(explanation);
  }, []);
  // While marking, the attachment's ending the mark causes is not shown.
  const { asksFirst, marking, mark } = useDoneMark(current, hostOperations);
  const asking = useAskInPlace(asksFirst, () => mark(onMarkDone(session)));
  const insertText = useAttachedTerminal(
    screen,
    session,
    attempt,
    onAttached,
    setEnding,
    onWorkspaceUnavailable,
    onAttachRefusal,
  );
  const dictation = useTerminalDictation(insertText);
  useRowsHeight(identity, names);
  usePortraitPreview(identity);
  const attachAgain = () => {
    setEnding(undefined);
    setRefusal(undefined);
    setAttempt((previous) => previous + 1);
  };
  // A carried refusal replaces the attachment's generic ending, so the
  // panel shows at most one status with its attach-again action.
  const status =
    refusal !== undefined
      ? { says: refusal, action: "Reconnect" }
      : ending !== undefined
        ? endings[ending]
        : undefined;
  const { title, name } = launchSubject(record.request);
  const agent = assignedAgent(record.start ?? record.preparation);
  const agentName = agentNameOf(agent);
  const { background } = terminalPalette(useShownTerminalTheme());
  return (
    <section className="side-panel" aria-label="Terminal">
      <PanelDivider />
      <header className="side-panel-header">
        <div ref={identity} className="terminal-identity">
          {agentName !== undefined && (
            <AgentPortrait name={agentName} label={agent} />
          )}
          <div ref={names} className="side-panel-names">
            <SidePanelTitle title={title} />
            <p className="quiet">{name} session</p>
          </div>
        </div>
        <div
          ref={actions}
          className="side-panel-actions"
          role="group"
          aria-label="Session actions"
          tabIndex={-1}
          title="Alt+F10 focuses session actions from terminal input"
        >
          {dictation.control}
          {/* Unlike the entry (`offersMarkDone`), the panel offers the
              mark whenever the record can be marked, including a done
              record reopened here. */}
          {marksRecordDone(hostOperations, current) && (
            <IconButton
              ref={asking.control}
              label="Mark as done"
              icon={CircleCheck}
              disabled={marking === "marking" || asking.shown}
              onClick={(event) => {
                asking.press(event.currentTarget);
              }}
            />
          )}
          <SidePanelControls
            maximized={maximized}
            onMaximize={onMaximize}
            offerMaximize={offerMaximize}
            onClose={onClose}
          />
        </div>
      </header>
      {asking.shown && (
        <InPlaceQuestion
          asking={asking}
          {...doneAnswers}
          placed="side-panel-question"
        />
      )}
      <div role="status" className="terminal-status">
        {dictation.feedback}
        {marking === "marking" && <p className="quiet">Marking as done…</p>}
        {marking === "unresolved" && <p>{markDoneUnresolved}</p>}
        {marking === "not-marked" && <p>{notMarkedDone}</p>}
        {status && marking !== "marking" && (
          <>
            <p>{status.says}</p>
            <button
              type="button"
              className="frame-button"
              onClick={attachAgain}
            >
              {status.action}
            </button>
          </>
        )}
      </div>
      <p id={inputHelp} className="visually-hidden">
        Press Alt+F10 to focus session actions, then Tab to Dictate into
        terminal.
      </p>
      <div
        ref={screen}
        aria-describedby={inputHelp}
        onKeyDownCapture={(event) => {
          if (
            event.key === "F10" &&
            event.altKey &&
            !event.ctrlKey &&
            !event.metaKey &&
            !event.shiftKey
          ) {
            event.preventDefault();
            event.stopPropagation();
            if (!event.repeat) actions.current?.focus();
          }
        }}
        className="terminal-screen"
        style={{ "--terminal-background": background } as CSSProperties}
      />
    </section>
  );
}
