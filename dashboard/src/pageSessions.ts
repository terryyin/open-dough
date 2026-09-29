// The page's operations on the sessions it shows: opening one in the page's
// one terminal (`./TerminalPanel.tsx`), marking one done, and reading one
// again once its terminal attaches, each asked with one request shape. The
// page provides them (`./TerminalSplit.tsx`), and a session entry on a card
// or in Recent sessions reaches opening and marking without every component
// between them passing them along. Each Open terminal and each session entry
// names its session, so the page can find where to return the keyboard. Every
// Mark as done control follows its mark the same way (`useMarking`).

import { createContext, useContext, useState } from "react";
import type { LaunchRecord } from "./agentLaunch.ts";

// A request about one session the page shows: its launch record, and the
// control that asked, which gets the keyboard back once the page has answered.
export type SessionRequest = {
  readonly record: LaunchRecord;
  readonly control: HTMLElement;
};

// One of the page's operations on a session, answering with `Answer`.
export type SessionOperation<Answer> = (request: SessionRequest) => Answer;

// Shows the session in the page's one terminal.
export type OpenTerminal = SessionOperation<void>;

// Marks the session done, closing its terminal if the page shows it, and
// answers whether it was marked. The control that asked gets the keyboard
// back while it is on the page.
export type MarkSessionDone = SessionOperation<Promise<boolean>>;

// The page's operations that session entries ask.
export type PageSessions = {
  readonly openTerminal: OpenTerminal;
  readonly markDone: MarkSessionDone;
};

// The attributes by which an Open terminal names the session it opens, and a
// session entry the session it shows.
const opensSessionAttribute = "data-opens-session";
const showsSessionAttribute = "data-shows-session";

export function opensSession(sessionId: string) {
  return { [opensSessionAttribute]: sessionId };
}

export function showsSession(sessionId: string) {
  return { [showsSessionAttribute]: sessionId };
}

// Where the keyboard goes when the control that opened the session's terminal,
// or marked it done, is gone, as a card's entry goes once its session is
// marked done: the Open terminal of the session's Recent sessions entry; the
// entry itself when it offers none; Recent sessions when the session's entry
// is not on the page, as when another project is selected.
export function sessionKeyboardHome(sessionId: string): HTMLElement | null {
  const session = CSS.escape(sessionId);
  return (
    document.querySelector<HTMLElement>(
      `.recent-sessions [${opensSessionAttribute}="${session}"]`,
    ) ??
    document.querySelector<HTMLElement>(
      `.recent-sessions [${showsSessionAttribute}="${session}"]`,
    ) ??
    document.querySelector<HTMLElement>(".recent-sessions")
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
