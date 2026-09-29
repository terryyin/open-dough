// How a session shown anywhere on the page opens in the page's one terminal
// (`./TerminalPanel.tsx`) and is marked done: the page provides both, and a
// session entry on a card or in Recent sessions reaches them without every
// component between them passing them along. Each Open terminal and each
// Recent sessions entry names its session, so the page can find where to
// return the keyboard, and the page can bring the entry into view. The page
// also says which session its terminal shows. Every Mark as done control
// follows its mark the same way (`useMarking`).

import { createContext, useContext, useState } from "react";
import type { LaunchRecord } from "./agentLaunch.ts";

// A session open in the terminal: its launch record, and the control that
// opened it, which gets the keyboard back when the terminal closes.
export type TerminalOpening = {
  readonly record: LaunchRecord;
  readonly opener: HTMLElement;
};

export type OpenTerminal = (opening: TerminalOpening) => void;

// Marks the session done, closing its terminal if the page shows it, and
// answers whether it was marked. The control that asked gets the keyboard
// back while it is on the page.
export type MarkSessionDone = (marking: TerminalOpening) => Promise<boolean>;

// The page's operations on the sessions it shows, and the session its
// terminal shows, if any, from which every entry of that session derives its
// "Shown in terminal" mark.
export type PageSessions = {
  readonly openTerminal: OpenTerminal;
  readonly markDone: MarkSessionDone;
  readonly shownInTerminal: string | undefined;
};

// The attributes by which an Open terminal names the session it opens, and a
// Recent sessions entry the session it shows.
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
  return (
    document.querySelector<HTMLElement>(
      `.recent-sessions [${opensSessionAttribute}="${CSS.escape(sessionId)}"]`,
    ) ??
    recentSessionsEntry(sessionId) ??
    document.querySelector<HTMLElement>(".recent-sessions")
  );
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
