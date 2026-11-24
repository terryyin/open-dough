// Applications standing in for a session's program behind the frontend tier's
// attached-terminal substitute (./frontendServiceSubstitutes.ts): what each
// prints once attached and how it answers the input the page sends.

import { terminalEndedCode } from "../../src/agentTerminal.ts";

export type TerminalApplication = {
  // Printed once the attachment is ready.
  readonly opening: string;
  // What it prints in answer to one input the page sent.
  answer(input: string): string;
  // Called with the attachment once `opening` is printed, for an application
  // that prints or closes at a moment of its own.
  attached?(attachment: SubstituteAttachment): void;
};

export type SubstituteAttachment = {
  print(output: string): void;
  // Closes the page's attachment with a WebSocket close code.
  close(code: number): void;
};

// Prints `opening`, then echoes input as text.
export function echoingApplication(opening: string): TerminalApplication {
  return { opening, answer: (input) => input };
}

// Prints `opening` and echoes input, then prints, ends or disconnects when
// the test says so.
export function directedApplication(opening: string) {
  let current: SubstituteAttachment | undefined;
  const attachment = () => {
    if (current === undefined) throw new Error("No page has attached.");
    return current;
  };
  const application: TerminalApplication = {
    ...echoingApplication(opening),
    attached(to) {
      current = to;
    },
  };
  return {
    application,
    print(output: string) {
      attachment().print(output);
    },
    // The session's terminal ended.
    end() {
      attachment().close(terminalEndedCode);
    },
    // The connection went away under a session still running.
    disconnect() {
      attachment().close(1001);
    },
  };
}
