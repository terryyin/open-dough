// Runner HTTP answers for keep and hangup. Keep may omit the instruction so
// recovery waits for a screen or exit without typing.
import type { CursorSession } from "../../../src/launchRecord.ts";
import { keptSession, updateRecord } from "../../launchRecordStore.ts";
import type { TerminalAttachments } from "../../terminalAttachments.ts";
import {
  cursorRunnerHangupRequest,
  cursorRunnerKeepRequest,
} from "./runnerProtocol.ts";
import { showsCursorComposer } from "./idleScreen.ts";
import { cursorKeptTerminal, spawnCursorPty } from "./terminal.ts";

async function confirmInstruction(
  sourceId: string,
  session: CursorSession,
  instruction: string,
): Promise<void> {
  const kept = await keptSession(sourceId, session);
  if (kept === undefined || kept.firstInput?.state === "confirmed") return;
  await updateRecord(sourceId, {
    ...kept,
    firstInput: { state: "confirmed", instruction },
  });
}

export function answerHangup(
  body: unknown,
  attachments: TerminalAttachments,
  sendJson: (status: number, body: unknown) => void,
): void {
  const parsed = cursorRunnerHangupRequest.parse(body);
  if (parsed.session.host !== "cursor") {
    sendJson(400, { kind: "failed" });
    return;
  }
  attachments.endAttachments(parsed.session);
  sendJson(200, { kind: "released" });
}

export async function answerKeep(
  body: unknown,
  attachments: TerminalAttachments,
  sendJson: (status: number, body: unknown) => void,
): Promise<void> {
  const parsed = cursorRunnerKeepRequest.parse(body);
  if (parsed.session.host !== "cursor") {
    sendJson(400, { kind: "failed" });
    return;
  }
  let pty;
  try {
    pty = spawnCursorPty(parsed.command, parsed.args, parsed.cwd, {
      cols: parsed.cols,
      rows: parsed.rows,
    });
  } catch (error) {
    sendJson(200, {
      kind:
        (error as NodeJS.ErrnoException).code === "ENOENT"
          ? "missing"
          : "failed",
    });
    return;
  }
  const session = parsed.session;
  const instruction = parsed.instruction;
  try {
    const outcome =
      instruction === undefined
        ? await attachments.keep(session, pty)
        : await attachments.keep(session, pty, {
            instruction,
            ready:
              parsed.idleComposer === true
                ? showsCursorComposer
                : cursorKeptTerminal.ready,
            ...(parsed.idleComposer === true ? { completePaint: true } : {}),
            ...(parsed.handoff === true ? { handoff: true } : {}),
            onEntered: () =>
              confirmInstruction(parsed.sourceId, session, instruction),
          });
    sendJson(200, outcome);
  } catch {
    sendJson(200, { kind: "failed" });
  }
}
