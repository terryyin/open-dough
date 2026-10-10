// Shared Start/Recover wording when Cursor's keep has not settled by the
// shared launch wait: unconfirmed instruction delivery, kept session, and
// how to continue.
import type { CursorSession } from "../../../src/hostSession.ts";
import { shellCommand } from "../../../src/sessionCapabilities.ts";

export function instructionDeliveryTimedOutExplanation(
  session: CursorSession,
): string {
  return `Cursor did not show it took the instruction in time. Session ${session.sessionId} is kept. Continue with \`${shellCommand(session.continuation.args)}\`.`;
}
