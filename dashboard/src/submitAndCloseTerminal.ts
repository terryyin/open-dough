// Command+Enter on a focused ready terminal: one ordinary Enter, then Close
// once activity leaves ready. The confirmation bound is longer than one
// prompt machine-sessions round-trip and shorter than the steady 15s poll.

import type { LaunchWithState } from "./agentLaunch.ts";
import { checkIntervalMs } from "./revisionCheckSchedule.ts";

// Longer than one local prompt read (listing spawn + HTTP), under one poll.
export const submitAndCloseConfirmMs = Math.min(8_000, checkIntervalMs - 1_000);

export const confirmationUnavailable =
  "Confirmation is unavailable. Reconnect, retry Command+Enter, or Close.";

export const submitAndCloseEnter = "\r";

export type SessionActivity = Extract<
  LaunchWithState["sessionState"],
  { readonly kind: "available" }
>["activity"];

export function activityOf(
  current: LaunchWithState,
): SessionActivity | undefined {
  return current.sessionState.kind === "available"
    ? current.sessionState.activity
    : undefined;
}

export function readyForPrompt(activity: SessionActivity | undefined): boolean {
  return activity === "awaiting-instruction" || activity === "review";
}

export function leftReady(activity: SessionActivity | undefined): boolean {
  return activity === "working" || activity === "waiting";
}

export function terminalInputFocused(screen: HTMLElement | null): boolean {
  const active = document.activeElement;
  return (
    active instanceof HTMLTextAreaElement &&
    active.classList.contains("xterm-helper-textarea") &&
    screen !== null &&
    screen.contains(active)
  );
}
