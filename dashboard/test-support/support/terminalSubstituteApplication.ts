// Applications standing in for a session's program behind the frontend tier's
// attached-terminal substitute (./frontendServiceSubstitutes.ts): what each
// prints once attached and how it answers the input the page sends.

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
