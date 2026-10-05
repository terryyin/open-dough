// The page's one side panel owns its selection, maximization and focus return.
// It shows one item: a session's terminal or final report, or a story's
// review. Opening different content replaces what it showed, detaching a
// terminal without ending its session, and returns to the normal split.
// Session operations retain their host-qualified identity across
// asynchronous answers; a review is not a session and has no session mark.
import { useCallback, useLayoutEffect, useRef, useState } from "react";
import {
  launchSubject,
  type LaunchRecord,
  type LaunchWithState,
} from "./agentLaunch.ts";
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
  type MarkSessionRead,
  type DeleteSessionRecord,
} from "./pageSessions.ts";
import {
  sameStory,
  type OpenStoryReview,
  type StoryReviewRequest,
} from "./pageReviews.ts";
import { workHome } from "./workFocus.ts";

// What the panel shows, and whether it takes the page column's room too.
// Maximization belongs to the shown content, so new content starts split.
type Panel = (
  | { readonly kind: SessionAccess; readonly request: SessionRequest }
  | { readonly kind: "review"; readonly request: StoryReviewRequest }
) & { readonly maximized?: boolean };
type Shown = Panel["request"];
type KeyboardReturn = {
  readonly control: HTMLElement;
  readonly shows: Shown | undefined;
  readonly home?: () => HTMLElement | null;
};

const shownSessionOf = (panel: Panel | undefined) =>
  panel === undefined || panel.kind === "review" ? undefined : panel.request;

// The session a panel shows as the page reads it now, from the machine's
// sessions of every project, since the panel keeps the record it was opened
// with; until the page has read it, the opened record, with its reading
// unknown if it was opened without one.
export function shownRecord(
  records: readonly LaunchWithState[] | undefined,
  { record }: SessionRequest,
): LaunchWithState {
  const opened: LaunchRecord & Partial<LaunchWithState> = record;
  return (
    records?.find(
      (known) => sessionKey(known.session) === sessionKey(record.session),
    ) ?? { ...record, sessionState: opened.sessionState ?? { kind: "unknown" } }
  );
}

export function usePageSidePanel({
  markDone,
  markRead,
  deleteRecord,
  hostOperations,
}: Pick<
  MachineSessions,
  "markDone" | "markRead" | "deleteRecord" | "hostOperations"
>) {
  const [panel, setPanel] = useState<Panel | undefined>();
  const shown = panel?.request;
  const latest = useRef<Panel | undefined>(undefined);
  const [returning, setReturning] = useState<KeyboardReturn | undefined>();
  useLayoutEffect(() => {
    latest.current = panel;
  }, [panel]);
  useLayoutEffect(() => {
    if (returning === undefined || latest.current?.request !== returning.shows)
      return;
    // A control the page no longer shows, as in a hidden sidebar, cannot
    // take the keyboard.
    const control =
      returning.control.getClientRects().length > 0
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
    setPanel({ kind: "result", request });
  }, []);
  // Asking again for the story's review already shown keeps that review, its
  // snapshot included, and takes the new request so the review takes the
  // keyboard; any other opening reads a fresh one.
  const openReview = useCallback<OpenStoryReview>((request) => {
    setPanel((current) =>
      current?.kind === "review" && sameStory(current.request, request)
        ? { ...current, request }
        : { kind: "review", request },
    );
  }, []);
  const maximize = useCallback((maximized: boolean) => {
    setPanel((current) => current && { ...current, maximized });
  }, []);
  const unavailableWorkspace = useCallback(
    (request: SessionRequest, workspaceState: TerminalWorkspaceUnavailable) => {
      if (latest.current?.request !== request) return;
      const record = { ...request.record, workspaceState };
      openResult({ ...request, record });
    },
    [openResult],
  );
  const close = (closed: Shown) => {
    if (latest.current?.request !== closed) return;
    setPanel(undefined);
    const identity =
      "record" in closed
        ? launchSubject(closed.record.request).identity
        : closed.identity;
    setReturning({
      control: closed.control,
      shows: undefined,
      home: () => workHome(identity),
    });
  };
  const markSessionDone: MarkSessionDone = async ({ record }) => {
    if (!(await markDone(record))) return false;
    const open = shownSessionOf(latest.current);
    if (
      open !== undefined &&
      sessionKey(open.record.session) === sessionKey(record.session)
    )
      close(open);
    return true;
  };
  const markSessionRead: MarkSessionRead = async ({ record }) => {
    const read = await markRead(record);
    if (read === undefined) return false;
    // A report panel showing the session shows it as marked read.
    setPanel((current) =>
      current?.kind === "result" &&
      sessionKey(current.request.record.session) === sessionKey(read.session)
        ? { ...current, request: { ...current.request, record: read } }
        : current,
    );
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
    const open = shownSessionOf(latest.current);
    const closes =
      (open === undefined ? undefined : sessionKey(open.record.session)) ===
      sessionKey(record.session);
    if (closes) setPanel(undefined);
    setReturning({
      control,
      shows: closes ? undefined : latest.current?.request,
      home,
    });
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
      panel === undefined || panel.kind === "review"
        ? undefined
        : { kind: panel.kind, key: sessionKey(panel.request.record.session) },
    markDone: markSessionDone,
    markRead: markSessionRead,
    deleteRecord: deleteSessionRecord,
  };
  return {
    shown,
    terminal: panel?.kind === "terminal" ? panel.request : undefined,
    result: panel?.kind === "result" ? panel.request : undefined,
    review: panel?.kind === "review" ? panel.request : undefined,
    maximized: panel?.maximized === true,
    maximize,
    close,
    markSessionDone,
    sessions,
    openSession: sessions.openSession,
    openReview,
    unavailableWorkspace,
  };
}
