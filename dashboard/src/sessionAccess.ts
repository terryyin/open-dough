// One access decision for cards, Recently done and the Sessions sidebar.
import {
  attachOpens,
  type LaunchRecord,
  type LaunchWithState,
} from "./agentLaunch.ts";
import {
  embeddedTerminal,
  type HostOperations,
} from "./sessionCapabilities.ts";

export const workspaceMissing =
  "The saved workspace is missing. Terminal continuation is unavailable here.";
export const workspaceUnknown =
  "The saved workspace availability could not be established. Terminal continuation is unconfirmed.";
// Panel-only claim from retained landing plus readable published closure.
export const productClosureEvidencePresent =
  "Product closure evidence is present.";

export function workspaceLimitation(
  record: LaunchRecord & Pick<LaunchWithState, "workspaceState">,
): string | undefined {
  return record.workspaceState?.kind === "missing"
    ? workspaceMissing
    : record.workspaceState?.kind === "unknown"
      ? workspaceUnknown
      : undefined;
}
export type SessionAccess = "terminal" | "final-report";

export function sessionAccess(
  record: LaunchWithState,
  operations: HostOperations,
): SessionAccess | undefined {
  if (
    record.workspaceState !== undefined &&
    record.workspaceState.kind !== "available"
  )
    return "final-report";
  return embeddedTerminal(operations, record.session.host) &&
    attachOpens(record.sessionState)
    ? "terminal"
    : undefined;
}

// Whether an entry in Recently done offers Follow up: no session it holds
// offers Open terminal, whatever the reason (its conversation confirmed
// unavailable, its workspace missing or unconfirmed, or its host without an
// embedded terminal), so reopening the earlier conversation is not possible.
export function offersFollowUp(
  sessions: readonly LaunchWithState[],
  operations: HostOperations,
): boolean {
  return sessions.every(
    (record) => sessionAccess(record, operations) !== "terminal",
  );
}
