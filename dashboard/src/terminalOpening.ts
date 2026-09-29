// How a session shown anywhere on the page opens in the page's one terminal
// (`./TerminalPanel.tsx`): the page provides the opening, and a session entry
// on a card or in Recent sessions reaches it through `LaunchSession`
// without every component between them passing it along. Each Open terminal
// names the session it opens, so the page can find the control to return the
// keyboard to.

import { createContext, useContext } from "react";
import type { LaunchRecord } from "./agentLaunch.ts";

// A session open in the terminal: its launch record, and the control that
// opened it, which gets the keyboard back when the terminal closes.
export type TerminalOpening = {
  readonly record: LaunchRecord;
  readonly opener: HTMLElement;
};

export type OpenTerminal = (opening: TerminalOpening) => void;

// The attribute by which an Open terminal names the session it opens.
const opensSessionAttribute = "data-opens-session";

export function opensSession(sessionId: string) {
  return { [opensSessionAttribute]: sessionId };
}

// The Open terminal control of this session's Recent sessions entry, if its
// entry offers one, where the keyboard returns when the control that opened
// the session's terminal is gone.
export function recentSessionControl(sessionId: string): HTMLElement | null {
  return document.querySelector<HTMLElement>(
    `.recent-sessions [${opensSessionAttribute}="${CSS.escape(sessionId)}"]`,
  );
}

export const TerminalOpener = createContext<OpenTerminal | undefined>(
  undefined,
);

// The page's opening, which every session shown on the page is inside.
export function useOpenTerminal(): OpenTerminal {
  const openTerminal = useContext(TerminalOpener);
  if (openTerminal === undefined) {
    throw new Error("A session is shown outside the page's TerminalSplit.");
  }
  return openTerminal;
}
