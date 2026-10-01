// One mutually exclusive session panel owns selection, maximization and focus return.
// Session operations retain their host-qualified identity across asynchronous answers.
import { useCallback, useLayoutEffect, useRef, useState } from "react";
import { launchSubject } from "./agentLaunch.ts";
import type { MachineSessions } from "./agentLaunches.ts";
import { sessionAccess, type SessionAccess } from "./sessionAccess.ts";
import { sessionKey } from "./sessionReference.ts";
import type { TerminalWorkspaceUnavailable } from "./agentTerminal.ts";
import {
  deletedEntryHome,
  type OpenSessionPanel,
  type PageSessions,
  type SessionRequest,
  type MarkSessionDone,
  type DeleteSessionRecord,
} from "./pageSessions.ts";

type Panel = { readonly kind: SessionAccess; readonly request: SessionRequest };
type KeyboardReturn = {
  readonly control: HTMLElement;
  readonly shows: SessionRequest | undefined;
  readonly home?: () => HTMLElement | null;
};

export function usePageSessionPanel({
  markDone,
  deleteRecord,
  hostOperations,
}: Pick<MachineSessions, "markDone" | "deleteRecord" | "hostOperations">) {
  const [panel, setPanel] = useState<Panel | undefined>();
  const [maximized, setMaximized] = useState(false);
  const shown = panel?.request;
  const latest = useRef<SessionRequest | undefined>(undefined);
  const [returning, setReturning] = useState<KeyboardReturn | undefined>();
  const [deleted, setDeleted] = useState<string | undefined>();
  useLayoutEffect(() => {
    latest.current = shown;
  }, [shown]);
  useLayoutEffect(() => {
    if (returning === undefined || latest.current !== returning.shows) return;
    const control = returning.control.isConnected
      ? returning.control
      : returning.home?.();
    control?.focus();
  }, [returning]);
  const openTerminal = useCallback<OpenSessionPanel>((request) => {
    setPanel((current) =>
      current?.kind === "terminal" &&
      sessionKey(current.request.record.session) ===
        sessionKey(request.record.session)
        ? current
        : { kind: "terminal", request },
    );
  }, []);
  const openResult = useCallback<OpenSessionPanel>((request) => {
    setMaximized(false);
    setPanel({ kind: "result", request });
  }, []);
  const unavailableWorkspace = useCallback(
    (request: SessionRequest, workspaceState: TerminalWorkspaceUnavailable) => {
      if (latest.current !== request) return;
      const record = { ...request.record, workspaceState };
      openResult({ ...request, record });
    },
    [openResult],
  );
  const close = (closed: SessionRequest) => {
    if (latest.current !== closed) return;
    setPanel(undefined);
    setMaximized(false);
    setReturning({ control: closed.control, shows: undefined });
  };
  const markSessionDone: MarkSessionDone = async ({ record }) => {
    if (!(await markDone(record))) return false;
    const open = latest.current;
    if (
      open !== undefined &&
      sessionKey(open.record.session) === sessionKey(record.session)
    )
      close(open);
    return true;
  };
  const deleteSessionRecord: DeleteSessionRecord = async ({
    record,
    control,
  }) => {
    const home = deletedEntryHome(
      control,
      launchSubject(record.request).identity,
    );
    const outcome = await deleteRecord(record);
    if (outcome.kind !== "deleted") return outcome;
    setDeleted("Session record deleted");
    const open = latest.current;
    const closes =
      (open === undefined ? undefined : sessionKey(open.record.session)) ===
      sessionKey(record.session);
    if (closes) {
      setPanel(undefined);
      setMaximized(false);
    }
    setReturning({ control, shows: closes ? undefined : open, home });
    return outcome;
  };
  const sessions: PageSessions = {
    hostOperations,
    openTerminal,
    openResult,
    openSession: (request) => {
      const access = sessionAccess(request.record, hostOperations);
      if (access !== undefined)
        (access === "result" ? openResult : openTerminal)(request);
    },
    shownSession:
      panel === undefined
        ? undefined
        : { kind: panel.kind, key: sessionKey(panel.request.record.session) },
    markDone: markSessionDone,
    deleteRecord: deleteSessionRecord,
  };
  return {
    shown,
    terminal: panel?.kind === "terminal" ? panel.request : undefined,
    result: panel?.kind === "result" ? panel.request : undefined,
    maximized,
    maximize: setMaximized,
    close,
    markSessionDone,
    deleted,
    sessions,
    openSession: sessions.openSession,
    unavailableWorkspace,
  };
}
