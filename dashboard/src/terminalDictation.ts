import { withoutTerminalEscapeSequences } from "./terminalInputText.ts";

// A transcript is ordinary terminal text, never a key or paste command.
export function terminalDictationText(text: string) {
  return (
    withoutTerminalEscapeSequences(text)
      .replace(/\r\n|[\r\n\u2028\u2029]/g, " ")
      // eslint-disable-next-line no-control-regex
      .replace(/[\x00-\x1f\x7f-\x9f]/g, "")
      .trim()
  );
}
