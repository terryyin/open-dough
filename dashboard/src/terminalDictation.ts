// A transcript is ordinary terminal text, never a key or paste command.
export function terminalDictationText(text: string) {
  return (
    text
      // Drop ANSI CSI/OSC sequences as well as their introducers.
      .replace(
        // eslint-disable-next-line no-control-regex
        /\x1b\][^\x07\x1b]*(?:\x07|\x1b\\)|(?:\x1b\[|\x9b)[0-?]*[ -/]*[@-~]|\x1b[@-_]/g,
        "",
      )
      .replace(/\r\n|[\r\n\u2028\u2029]/g, " ")
      // eslint-disable-next-line no-control-regex
      .replace(/[\x00-\x1f\x7f-\x9f]/g, "")
      .trim()
  );
}
