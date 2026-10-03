// The dashboard's one terminal registry, bound while that server is up.
// Cursor launch starts its kept client there; opening the terminal joins it.
import type { IPty } from "@lydell/node-pty";
import type { CursorSession } from "../../../src/launchRecord.ts";
import type { DetachedIdle } from "../../launchHosts.ts";
import type { LaunchInstructionInput } from "../../launchInstruction.ts";

export type CursorTerminalStart = {
  readonly pty: IPty;
  readonly session: CursorSession;
} & LaunchInstructionInput & {
    readonly detachedIdle: DetachedIdle;
  };

type KeepCursorTerminal = (start: CursorTerminalStart) => Promise<void>;

let keep: KeepCursorTerminal | undefined;

export function bindCursorTerminal(
  keepTerminal: KeepCursorTerminal | undefined,
): void {
  keep = keepTerminal;
}

export function keepCursorTerminal(start: CursorTerminalStart): Promise<void> {
  if (keep === undefined) {
    throw new Error("The Cursor terminal is not available.");
  }
  return keep(start);
}
