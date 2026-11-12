// Output for a substitute application (./terminalSubstituteApplication.ts) to
// print into a terminal whose width the test knows, with what that terminal
// then holds: the rows it draws and the lines its own selection copies.

import { conversationLine } from "./terminalSubstituteApplication.ts";

// The line the session printed before this output.
export const heldOpening = "attached held01";

// After `heldOpening`, a session prints `lines` numbered lines and, after
// line `after`, one line of `wrapped` characters, which a terminal `cols`
// wide wraps, then a token longer than a row, which the application draws
// over two rows itself: the first as wide as the terminal, the second
// indented.
export function heldOutput(
  cols: number,
  facts: {
    readonly lines: number;
    readonly after: number;
    readonly wrapped: number;
  },
) {
  const numbered = (from: number, to: number) =>
    Array.from({ length: to - from + 1 }, (...[, line]) =>
      conversationLine(from + line),
    );
  const wrapped = "wrapped-".padEnd(facts.wrapped, "0123456789");
  const token = "https://example.test/".padEnd(cols + 20, "drawn/");
  const drawnToken = [token.slice(0, cols), `  ${token.slice(cols)}`] as const;
  const earlier = numbered(1, facts.after);
  const later = numbered(facts.after + 1, facts.lines);
  return {
    // What the application prints, the cursor left after the last line.
    printed: [...earlier, wrapped, ...drawnToken, ...later].join("\r\n"),
    // The rows the terminal draws, earliest first.
    rows: [
      heldOpening,
      ...earlier,
      ...Array.from(
        { length: Math.ceil(wrapped.length / cols) },
        (...[, row]) => wrapped.slice(row * cols, (row + 1) * cols),
      ),
      ...drawnToken,
      ...later,
    ],
    // The lines the terminal's own selection of everything copies.
    lines: [heldOpening, ...earlier, wrapped, ...drawnToken, ...later],
    wrapped,
    drawnToken,
  };
}
