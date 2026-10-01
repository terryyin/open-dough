// One access decision for cards, Recent sessions and the Sessions sidebar.
import {
  attachOpens,
  type LaunchRecord,
  type LaunchWithState,
} from "./agentLaunch.ts";
import { embeddedTerminal } from "./sessionCapabilities.ts";

export const workspaceMissing =
  "The saved workspace is missing. Terminal continuation is unavailable here.";
export const workspaceUnknown =
  "The saved workspace availability could not be established. Terminal continuation is unconfirmed.";

export function workspaceLimitation(
  record: LaunchRecord & Pick<LaunchWithState, "workspaceState">,
): string | undefined {
  return record.workspaceState?.kind === "missing"
    ? workspaceMissing
    : record.workspaceState?.kind === "unknown"
      ? workspaceUnknown
      : undefined;
}
export type SessionAccess = "terminal" | "result";

export function sessionAccess(
  record: LaunchWithState,
): SessionAccess | undefined {
  if (
    record.session.host === "codex" &&
    record.workspaceState !== undefined &&
    record.workspaceState.kind !== "available"
  )
    return "result";
  return embeddedTerminal(record.session.host) &&
    attachOpens(record.sessionState)
    ? "terminal"
    : undefined;
}
