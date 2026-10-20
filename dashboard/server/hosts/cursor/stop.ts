// Stop a held Cursor session through the runner, confirmed only by
// re-observing the runner afterwards: the hangup having been sent proves
// nothing. Anything else — still held, runner not answering, hangup not
// delivered — throws a HostOperationFailure naming the remaining state.
import type { HostSession } from "../../../src/agentLaunch.ts";
import { cursorRunnerSentence } from "../../../src/cursorRunnerSessions.ts";
import { sessionKey } from "../../../src/sessionReference.ts";
import { HostOperationFailure } from "../../hostLaunch.ts";
import {
  hangupCursorClient,
  readCursorRunnerSessions,
} from "./runnerClient.ts";

// How long re-observation waits for the runner to stop holding the client
// before the stop reads unconfirmed; the caller's signal bounds it too.
const confirmWaitMs = 3_000;
const confirmPollMs = 100;

const sleep = (ms: number) =>
  new Promise<void>((resolve) => setTimeout(resolve, ms));

export async function stopCursor(
  session: HostSession,
  signal: AbortSignal,
): Promise<void> {
  if (session.host !== "cursor") {
    throw new HostOperationFailure("This is not a Cursor session.");
  }
  const delivered = await hangupCursorClient(session, undefined, signal);
  if (!delivered) {
    throw new HostOperationFailure(
      "Stop unconfirmed: the hangup could not be delivered to the Cursor runner, so this session may still be held and working.",
    );
  }
  const deadline = Date.now() + confirmWaitMs;
  for (;;) {
    const read = await readCursorRunnerSessions();
    if (read.kind !== "running") {
      throw new HostOperationFailure(
        `Stop unconfirmed: ${cursorRunnerSentence(read.kind)} The hangup was delivered, but whether this session stopped could not be confirmed; it may still be held and working.`,
      );
    }
    const held = read.sessions.find(
      (item) => sessionKey(item.session) === sessionKey(session),
    );
    if (held === undefined) return;
    if (Date.now() >= deadline || signal.aborted) {
      throw new HostOperationFailure(
        `Stop unconfirmed: the Cursor runner still holds this session (${held.label}); it may still be working.`,
      );
    }
    await sleep(confirmPollMs);
  }
}
