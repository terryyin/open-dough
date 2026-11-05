export function withoutTerminalEscapeSequences(text: string) {
  // Drop ANSI CSI/OSC sequences as well as their introducers.
  return text.replace(
    // eslint-disable-next-line no-control-regex
    /\x1b\][^\x07\x1b]*(?:\x07|\x1b\\)|(?:\x1b\[|\x9b)[0-?]*[ -/]*[@-~]|\x1b[@-_]/g,
    "",
  );
}
