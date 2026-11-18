// Command+Enter while terminal input is focused: take the chord, and when the
// attachment accepts input and the session is ready for a follow-up, offer one
// ordinary Enter, ask a prompt machine-sessions reread, and Close once activity
// becomes working or waiting. Disconnect, end, or the confirmation bound without
// that change keeps the panel and names confirmation unavailable.

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type RefObject,
} from "react";
import type { LaunchWithState } from "./agentLaunch.ts";
import { useCommandShortcut } from "./pageShortcuts.ts";
import {
  activityOf,
  confirmationUnavailable,
  leftReady,
  readyForPrompt,
  submitAndCloseConfirmMs,
  submitAndCloseEnter,
  terminalInputFocused,
} from "./submitAndCloseTerminal.ts";

const submitShortcut = { key: "Enter" } as const;

export function useSubmitAndCloseTerminal({
  screen,
  current,
  insertText,
  acceptsInput,
  rereadSessions,
  onClose,
  attachmentLost,
}: {
  readonly screen: RefObject<HTMLElement | null>;
  readonly current: LaunchWithState;
  readonly insertText: (text: string) => boolean;
  readonly acceptsInput: () => boolean;
  readonly rereadSessions: () => void;
  readonly onClose: () => void;
  readonly attachmentLost: boolean;
}): { readonly feedback: string | undefined } {
  const [feedback, setFeedback] = useState<string>();
  const [waiting, setWaiting] = useState(false);
  const waitingRef = useRef(false);
  waitingRef.current = waiting;

  const submitAndClose = useCallback(() => {
    setFeedback(undefined);
    if (!acceptsInput() || !readyForPrompt(activityOf(current))) {
      return;
    }
    if (!insertText(submitAndCloseEnter)) {
      return;
    }
    waitingRef.current = true;
    setWaiting(true);
    rereadSessions();
  }, [acceptsInput, current, insertText, rereadSessions]);

  useCommandShortcut(submitShortcut, submitAndClose, () =>
    terminalInputFocused(screen.current),
  );

  useEffect(() => {
    if (!waiting) return;
    if (leftReady(activityOf(current))) {
      waitingRef.current = false;
      setWaiting(false);
      onClose();
    }
  }, [current, onClose, waiting]);

  useEffect(() => {
    if (!waiting) return;
    const timer = window.setTimeout(() => {
      if (!waitingRef.current) return;
      waitingRef.current = false;
      setWaiting(false);
      setFeedback(confirmationUnavailable);
    }, submitAndCloseConfirmMs);
    return () => {
      window.clearTimeout(timer);
    };
  }, [waiting]);

  useEffect(() => {
    if (!waiting || !attachmentLost) return;
    waitingRef.current = false;
    setWaiting(false);
    setFeedback(confirmationUnavailable);
  }, [attachmentLost, waiting]);

  return { feedback };
}
