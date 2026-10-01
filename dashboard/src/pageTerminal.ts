// The page's one terminal: the session its panel shows, if any, and whether
// the panel is maximized. Opening the session already shown keeps its request;
// opening another takes its place and keeps the panel as it was. Maximized
// lasts until the panel closes, so the next panel opens in the split.

import { useCallback, useState } from "react";
import { sessionKey } from "./sessionReference.ts";
import type { OpenTerminal, SessionRequest } from "./pageSessions.ts";

export function usePageTerminal() {
  const [terminal, setTerminal] = useState<SessionRequest | undefined>();
  const [maximized, setMaximized] = useState(false);
  const open = useCallback<OpenTerminal>((request) => {
    setTerminal((current) =>
      (current === undefined
        ? undefined
        : sessionKey(current.record.session)) ===
      sessionKey(request.record.session)
        ? current
        : request,
    );
  }, []);
  const close = useCallback(() => {
    setTerminal(undefined);
    setMaximized(false);
  }, []);
  return { terminal, maximized, maximize: setMaximized, open, close };
}
