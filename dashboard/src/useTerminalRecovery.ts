// Attachment retries and recovery belong to the keyed terminal view. A carried
// refusal takes precedence over the generic ending; input offers read the
// current recovery action without changing the attachment's callback identity.
import { useCallback, useRef, useState } from "react";
import type { TerminalEnding } from "./useAttachedTerminal.ts";

const endings = {
  disconnected: { says: "Disconnected from the session", action: "Reconnect" },
  ended: { says: "The terminal ended", action: "Open again" },
  failed: { says: "The session could not be attached", action: "Reconnect" },
} as const;

export function useTerminalRecovery() {
  const [attempt, setAttempt] = useState(0);
  const [ending, setEnding] = useState<TerminalEnding>();
  const [refusal, setRefusal] = useState<string>();
  const onAttachRefusal = useCallback((explanation: string) => {
    setRefusal(explanation);
  }, []);
  const status =
    refusal !== undefined
      ? { says: refusal, action: "Reconnect" }
      : ending !== undefined
        ? endings[ending]
        : undefined;
  const shownAction = useRef<string>(undefined);
  shownAction.current = status?.action;
  const recovery = useCallback(() => shownAction.current, []);
  const attachAgain = () => {
    setEnding(undefined);
    setRefusal(undefined);
    setAttempt((previous) => previous + 1);
  };
  return { attempt, setEnding, onAttachRefusal, status, recovery, attachAgain };
}
