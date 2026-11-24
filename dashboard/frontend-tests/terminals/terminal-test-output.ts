// Application-mode and scrollback output supplied to mounted terminal cases.

const escape = "\u001b";

// One wheel step as an SGR pointer report: button 64 scrolls to earlier
// output and 65 to later, at a one-based column and row.
export const wheelReport = new RegExp(`^${escape}\\[<(64|65);(\\d+);(\\d+)M$`);
const pointerReport = new RegExp(`^${escape}\\[<\\d+;\\d+;\\d+[Mm]$`);

export function conversationLine(number: number): string {
  return `conversation line ${String(number).padStart(3, "0")}`;
}

// Pointer tracking the application announces with the alternate screen, in
// SGR form. `?1003h` is any-motion (as Claude Code was observed to); `?1000h`
// is button-event and `?1002h` is drag.
export type SelfScrollingTracking = "?1000h" | "?1002h" | "?1003h";

// An application that has taken over the screen and scrolls its own output,
// announcing the alternate screen and the `tracking` the test states. It
// draws a window of `shown` numbered lines ending at the latest of `lines`
// and a draft row below it. Each wheel report redraws the window one line
// earlier or later. Other pointer reports, such as a tap's movement, press
// and release, change nothing. Any other input is typed into the draft, an
// escape shown as `^[`, so a key the page sent changes the draft row.
export function selfScrollingApplication({
  lines,
  shown,
  tracking = "?1003h",
}: {
  readonly lines: number;
  readonly shown: number;
  readonly tracking?: SelfScrollingTracking;
}) {
  const latest = lines - shown + 1;
  let first = latest;
  let draft = "";
  const draw = () =>
    `${escape}[H${Array.from(
      { length: shown },
      (...[, row]) => `${conversationLine(first + row)}${escape}[K\r\n`,
    ).join("")}> ${draft}${escape}[K`;
  return {
    opening: `${escape}[?1049h${escape}[${tracking}${escape}[?1006h${draw()}`,
    answer(input: string) {
      const wheel = wheelReport.exec(input);
      if (wheel !== null) {
        const step = wheel[1] === "64" ? -1 : 1;
        first = Math.min(latest, Math.max(1, first + step));
      } else if (!pointerReport.test(input)) {
        draft += input.replaceAll(escape, "^[");
      }
      return draw();
    },
  };
}

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
