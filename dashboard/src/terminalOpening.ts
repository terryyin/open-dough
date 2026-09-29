// How a session shown anywhere on the page opens in the page's one terminal
// (`./TerminalPanel.tsx`): the page provides the opening, and a card's
// Started and a Recent sessions entry reach it through `LaunchSession`
// without every component between them passing it along.

import { createContext, useContext } from "react";
import type { LaunchRecord } from "./agentLaunch.ts";

// A session open in the terminal: its launch record, and the control that
// opened it, which gets the keyboard back when the terminal closes.
export type TerminalOpening = {
  readonly record: LaunchRecord;
  readonly opener: HTMLElement;
};

export type OpenTerminal = (opening: TerminalOpening) => void;

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
