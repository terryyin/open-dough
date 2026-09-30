// The page's operations on the sessions it shows: opening one in the page's
// one terminal (`./TerminalPanel.tsx`), marking one done, and reading one
// again once its terminal attaches, each asked with one request shape. The
// page provides them (`./TerminalSplit.tsx`), and a session entry on a card,
// in Recent sessions, or in the Sessions sidebar reaches opening and marking
// without every component between them passing them along. Each session entry
// names its session, so the page can find where to bring the entry into view.
// The page also says which session its terminal shows. Every Mark as done
// control follows its mark the same way (`useMarking`).

import { createContext, useContext, useState } from "react";
import type { LaunchRecord } from "./agentLaunch.ts";

// A request about one session the page shows: its launch record, joined with
// its state where the operation needs it, and the control that asked, which
// gets the keyboard back once the page has answered.
export type SessionRequest<Record extends LaunchRecord = LaunchRecord> = {
  readonly record: Record;
  readonly control: HTMLElement;
};

// One of the page's operations on a session, answering with `Answer`.
export type SessionOperation<
  Answer,
  Record extends LaunchRecord = LaunchRecord,
> = (request: SessionRequest<Record>) => Answer;

// Shows the session in the page's one terminal.
export type OpenTerminal = SessionOperation<void>;

// Marks the session done, closing its terminal if the page shows it, and
// answers whether it was marked. The control that asked gets the keyboard
// back while it is on the page.
export type MarkSessionDone = SessionOperation<Promise<boolean>>;

// The page's operations that session entries ask, and the session its
// terminal shows, if any, from which every entry of that session derives its
// "Shown in terminal" mark.
export type PageSessions = {
  readonly openTerminal: OpenTerminal;
  readonly markDone: MarkSessionDone;
  readonly shownInTerminal: string | undefined;
};

// The attribute by which a session entry names the session it shows.
const showsSessionAttribute = "data-shows-session";

export function showsSession(sessionId: string) {
  return { [showsSessionAttribute]: sessionId };
}

// The session's Recent sessions entry, while the page shows it.
export function recentSessionsEntry(sessionId: string): HTMLElement | null {
  return document.querySelector<HTMLElement>(
    `.recent-sessions [${showsSessionAttribute}="${CSS.escape(sessionId)}"]`,
  );
}

export const SessionsOnPage = createContext<PageSessions | undefined>(
  undefined,
);

// The page's operations, which every session shown on the page is inside.
export function usePageSessions(): PageSessions {
  const sessions = useContext(SessionsOnPage);
  if (sessions === undefined) {
    throw new Error("A session is shown outside the page's TerminalSplit.");
  }
  return sessions;
}

// Where a control's Mark as done stands: asked, or refused. A mark that
// succeeds takes the control off the page, so nothing follows it.
export type Marking = "marking" | "not-marked";

// What a control says when the boundary refused its mark or no answer came.
export const notMarkedDone = "The session could not be marked done.";

// Follows one control's Mark as done from its asking to the answer.
export function useMarking() {
  const [marking, setMarking] = useState<Marking | undefined>();
  const follow = (asked: Promise<boolean>) => {
    setMarking("marking");
    void asked.then((marked) => {
      if (!marked) {
        setMarking("not-marked");
      }
    });
  };
  return { marking, follow };
}
