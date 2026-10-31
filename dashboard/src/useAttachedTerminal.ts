// Keeps one mounted terminal attachment across renders and follows theme changes.
import { useCallback, useEffect, useRef, type RefObject } from "react";
import type { TerminalWorkspaceUnavailable } from "./agentTerminal.ts";
import type { SessionOperation, SessionRequest } from "./pageSessions.ts";
import {
  attachTerminal,
  terminalUrl,
  type TerminalEnding,
} from "./attachedTerminal.ts";
import { useShownTerminalTheme } from "./savedTerminalTheme.ts";
import { terminalThemes } from "./terminalThemes.ts";

export type { TerminalEnding } from "./attachedTerminal.ts";

// Attaches a terminal in `element` to the session while it is mounted, anew
// for each `attempt`, reports once each attachment is ready, and
// reports how the attachment ended unless the panel ended it itself. The
// terminal takes the keyboard unless the request says otherwise, and shows the
// theme saved in System settings, following a change without re-attaching.
// Callbacks must keep their identity across renders; disposed attachments
// cannot report readiness, workspace refusal or an ending to a later attempt.
export function useAttachedTerminal(
  element: RefObject<HTMLDivElement | null>,
  session: SessionRequest,
  attempt: number,
  onAttached: SessionOperation<void>,
  onEnded: (ending: TerminalEnding) => void,
  onWorkspaceUnavailable: (
    request: SessionRequest,
    workspace: TerminalWorkspaceUnavailable,
  ) => void,
  onAttachRefusal: (explanation: string) => void,
) {
  const url = terminalUrl(session.record);
  const takesKeyboard = session.takesKeyboard !== false;
  const theme = terminalThemes[useShownTerminalTheme()].theme;
  // Keep theme updates out of attachment dependencies so they never reopen it.
  const latestTheme = useRef(theme);
  const live = useRef<ReturnType<typeof attachTerminal> | undefined>(undefined);
  const insertText = useCallback(
    (text: string) => live.current?.insert(text) ?? false,
    [],
  );
  useEffect(() => {
    latestTheme.current = theme;
    if (live.current) live.current.terminal.options.theme = theme;
  }, [theme]);
  useEffect(() => {
    const screen = element.current;
    if (screen === null) return;
    const attachment = attachTerminal(
      screen,
      url,
      session,
      latestTheme.current,
      takesKeyboard,
      onAttached,
      onEnded,
      onWorkspaceUnavailable,
      onAttachRefusal,
    );
    live.current = attachment;
    return () => {
      if (live.current === attachment) live.current = undefined;
      attachment.dispose();
    };
  }, [
    element,
    url,
    session,
    attempt,
    onAttached,
    onEnded,
    onWorkspaceUnavailable,
    onAttachRefusal,
    takesKeyboard,
  ]);
  return insertText;
}
