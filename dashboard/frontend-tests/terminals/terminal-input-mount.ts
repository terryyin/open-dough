import { expect } from "vitest";
import { userEvent } from "vitest/browser";
import type { LaunchRecord } from "../../src/agentLaunch.ts";
import type { SessionServices } from "../../src/sessionServices.ts";
import {
  execution,
  mountSessionCards,
  sessionsReading,
  workingSession,
} from "../sessions/session-card-mount.ts";
import { cardSession } from "../sessions/session-card-page.ts";
import { terminal, terminalInput } from "../sessions/session-terminal-page.ts";
import { terminalSocket } from "../sessions/session-terminal-socket.ts";

export async function mountTerminalInput({
  connecting = false,
  openingLines = ["Claude Code"],
  program,
  record = execution,
  openSession = () => userEvent.click(cardSession().open),
  ...options
}: Pick<
  NonNullable<Parameters<typeof mountSessionCards>[0]>,
  "viewport" | "transcription" | "storeTerminalImage"
> & {
  readonly connecting?: boolean;
  readonly openingLines?: readonly [string, ...string[]];
  readonly record?: LaunchRecord;
  readonly program?: {
    readonly opening: string;
    answer(input: string): string;
  };
  readonly openSession?: () => Promise<void>;
} = {}) {
  const sockets: ReturnType<typeof terminalSocket>[] = [];
  const openTerminal: SessionServices["openTerminal"] = () => {
    const attachment = terminalSocket(
      program?.opening ?? `${openingLines.join("\r\n")}\r\n`,
      {
        connecting: connecting && sockets.length === 0,
        ...(program === undefined
          ? {}
          : { answer: (input: string) => program.answer(input) }),
      },
    );
    sockets.push(attachment);
    return attachment.socket;
  };
  await mountSessionCards({
    ...options,
    reading: sessionsReading("working", workingSession(record)),
    openTerminal,
  });
  await openSession();
  await expect.element(terminalInput).toHaveFocus();
  if (!connecting) {
    for (const line of openingLines) {
      await expect
        .element(terminal.getByText(line, { exact: true }))
        .toBeVisible();
    }
  }
  const attachment = sockets[0];
  if (!attachment) throw new Error("The terminal did not attach.");
  return { attachment, sent: () => sockets.flatMap(({ sent }) => sent) };
}
