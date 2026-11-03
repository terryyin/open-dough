// The page's one side panel owns what it shows, maximization and focus return.
// It shows one item: a session's terminal or final report, or a story's
// review. Opening different content replaces what it showed, detaching a
// terminal without ending its session, and returns to the normal split.
// Each opening selects the content's story, or clears the page's selected
// story for a session attached to no story; each close clears it. A card's
// toggle may select another story while the panel stays as it is, so the
// selection is set here rather than derived from what the panel shows.
// Session operations retain their host-qualified identity across
// asynchronous answers; a review is not a session and has no session mark.
// How the keyboard returns is `./keyboardReturn.ts`.
import { useCallback, useLayoutEffect, useRef, useState } from "react";
import { launchSubject } from "./agentLaunch.ts";
import type { MachineSessions } from "./agentLaunches.ts";
import { sessionAccess } from "./sessionAccess.ts";
import { embeddedTerminal } from "./sessionCapabilities.ts";
import { sessionKey } from "./sessionReference.ts";
import type { TerminalWorkspaceUnavailable } from "./agentTerminal.ts";
import { deletedEntryHome, sessionEntry } from "./pageEntries.ts";
import {
  type OpenTerminal,
  type OpenFinalReport,
  type PageSessions,
  type SessionRequest,
  type MarkSessionDone,
  type MarkSessionRead,
  type DeleteSessionRecord,
} from "./pageSessions.ts";
import { sameStory, type OpenStoryReview } from "./pageStoryReviews.ts";
import type { PageStorySelection } from "./pageStorySelection.tsx";
import type { RecentlyDoneRange } from "./recentlyDoneRange.ts";
import {
  shownSessionOf,
  shownStory,
  type Shown,
  type SidePanel,
} from "./sidePanelContent.ts";
import { storyCardHome } from "./storyCardFocus.ts";
import { useKeyboardReturn } from "./keyboardReturn.ts";

export function usePageSidePanel({
  markDone,
  markRead,
  deleteRecord,
  recoverSession,
  stopSession,
  hostOperations,
  range,
  selection,
}: Pick<
  MachineSessions,
  | "markDone"
  | "markRead"
  | "deleteRecord"
  | "recoverSession"
  | "stopSession"
  | "hostOperations"
> & {
  readonly range: RecentlyDoneRange;
  readonly selection: PageStorySelection;
}) {
  const [sidePanel, setSidePanel] = useState<SidePanel | undefined>();
  const shown = sidePanel?.request;
  const latest = useRef<SidePanel | undefined>(undefined);
  useLayoutEffect(() => {
    latest.current = sidePanel;
  }, [sidePanel]);
  // After `latest` follows the panel, so a return sees what the panel shows.
  const setReturning = useKeyboardReturn<Shown>(latest, range);
  // What each host offers as the page reads it now: a launch asked before a
  // read presents its terminal by what the page knows once it started.
  const operations = useRef(hostOperations);
  useLayoutEffect(() => {
    operations.current = hostOperations;
  }, [hostOperations]);
  // The sessions whose terminal the developer opened themselves on this page,
  // which a launch's presentation then leaves as the developer left them.
  const openedByDeveloper = useRef(new Set<string>());
  // Content selects its story; a session attached to no story clears it.
  const selectStoryOf = useCallback(
    (shown: Shown) => {
      const story = shownStory(shown);
      if (story === undefined) selection.clear();
      else selection.select(story);
    },
    [selection],
  );
  const empty = () => {
    setSidePanel(undefined);
    selection.clear();
  };
  const openTerminal = useCallback<OpenTerminal>(
    (request) => {
      selectStoryOf(request);
      setSidePanel((current) =>
        current?.kind === "terminal" &&
        sessionKey(current.request.record.session) ===
          sessionKey(request.record.session)
          ? current
          : { kind: "terminal", request },
      );
    },
    [selectStoryOf],
  );
  const openFinalReport = useCallback<OpenFinalReport>(
    (request) => {
      selectStoryOf(request);
      setSidePanel({ kind: "final-report", request });
    },
    [selectStoryOf],
  );
  // Asking again for the story's review already shown keeps that review, its
  // snapshot included, and takes the new request so the review takes the
  // keyboard; any other opening reads a fresh one.
  const openStoryReview = useCallback<OpenStoryReview>(
    (request) => {
      selectStoryOf(request);
      setSidePanel((current) =>
        current?.kind === "story-review" && sameStory(current.request, request)
          ? { ...current, request }
          : { kind: "story-review", request },
      );
    },
    [selectStoryOf],
  );
  const maximize = useCallback((maximized: boolean) => {
    setSidePanel((current) => current && { ...current, maximized });
  }, []);
  const unavailableWorkspace = useCallback(
    (request: SessionRequest, workspaceState: TerminalWorkspaceUnavailable) => {
      if (latest.current?.request !== request) return;
      const record = { ...request.record, workspaceState };
      openFinalReport({ ...request, record });
    },
    [openFinalReport],
  );
  const close = (closed: Shown) => {
    if (latest.current?.request !== closed) return;
    empty();
    setReturning({
      control: closed.control,
      shows: undefined,
      ...("record" in closed ? { session: closed.record } : {}),
      home: () =>
        ("record" in closed
          ? sessionEntry(sessionKey(closed.record.session))
          : null) ?? storyCardHome(shownStory(closed)?.identity),
    });
  };
  const markSessionDone: MarkSessionDone = async ({ record, control }) => {
    const askedFrom = latest.current?.request;
    const outcome = await markDone(record);
    if (outcome !== "marked") return outcome;
    // A later panel owns the keyboard after the developer changes content.
    if (latest.current?.request !== askedFrom) return "marked";
    const open = shownSessionOf(latest.current);
    if (
      open !== undefined &&
      sessionKey(open.record.session) === sessionKey(record.session)
    )
      close(open);
    else
      setReturning({
        control,
        shows: latest.current?.request,
        session: record,
        home: () =>
          sessionEntry(sessionKey(record.session)) ??
          storyCardHome(launchSubject(record.request).identity),
      });
    return "marked";
  };
  const markSessionRead: MarkSessionRead = ({ record }) => markRead(record);
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
    if (closes) empty();
    setReturning({
      control,
      shows: closes ? undefined : latest.current?.request,
      home,
    });
    return outcome;
  };
  const sessions: PageSessions = {
    hostOperations,
    presentTerminal: (request) => {
      const { session } = request.record;
      if (
        embeddedTerminal(operations.current, session.host) &&
        !openedByDeveloper.current.has(sessionKey(session))
      )
        openTerminal(request);
    },
    openSession: (request) => {
      const access = sessionAccess(request.record, hostOperations);
      if (access === "terminal")
        openedByDeveloper.current.add(sessionKey(request.record.session));
      if (access !== undefined)
        (access === "final-report" ? openFinalReport : openTerminal)(request);
    },
    shownSession:
      sidePanel === undefined || sidePanel.kind === "story-review"
        ? undefined
        : {
            kind: sidePanel.kind,
            key: sessionKey(sidePanel.request.record.session),
          },
    markDone: markSessionDone,
    markRead: markSessionRead,
    deleteRecord: deleteSessionRecord,
    recoverSession: ({ record }) => recoverSession(record),
    stopSession: ({ record }) => stopSession(record),
  };
  return {
    shown,
    terminal: sidePanel?.kind === "terminal" ? sidePanel.request : undefined,
    finalReport:
      sidePanel?.kind === "final-report" ? sidePanel.request : undefined,
    storyReview:
      sidePanel?.kind === "story-review" ? sidePanel.request : undefined,
    maximized: sidePanel?.maximized === true,
    maximize,
    close,
    markSessionDone,
    sessions,
    openSession: sessions.openSession,
    openStoryReview,
    unavailableWorkspace,
  };
}
