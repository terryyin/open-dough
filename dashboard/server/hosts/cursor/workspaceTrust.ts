// One recognition rule for Cursor's workspace trust prompt, shared by the
// runner's held-screen observation and recovery's existing trust stop.
const trustPhrases = [
  "Workspace Trust Required",
  "Do you trust this workspace?",
] as const;

export function showsCursorWorkspaceTrust(screen: string): boolean {
  return trustPhrases.some((phrase) => screen.includes(phrase));
}

export const cursorWorkspaceTrustExplanation =
  "Cursor is waiting for workspace trust. Answer the workspace trust prompt in this session's terminal to deliver the first input.";
