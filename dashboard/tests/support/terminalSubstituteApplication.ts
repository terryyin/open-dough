// Applications standing in for a session's program behind the frontend tier's
// attached-terminal substitute (./frontendServiceSubstitutes.ts): what each
// prints once attached and how it answers the input the page sends.

export type TerminalApplication = {
  // Printed once the attachment is ready.
  readonly opening: string;
  // What it prints in answer to one input the page sent.
  answer(input: string): string;
};

// Prints `opening`, then echoes input as text.
export function echoingApplication(opening: string): TerminalApplication {
  return { opening, answer: (input) => input };
}

const escape = "\u001b";

// One wheel step as an SGR pointer report: button 64 scrolls to earlier
// output and 65 to later, at a one-based column and row.
export const wheelReport = new RegExp(`^${escape}\\[<(64|65);(\\d+);(\\d+)M$`);
const pointerReport = new RegExp(`^${escape}\\[<\\d+;\\d+;\\d+[Mm]$`);

export function conversationLine(number: number): string {
  return `conversation line ${String(number).padStart(3, "0")}`;
}

// An application that has taken over the screen and scrolls its own output,
// announcing itself as Claude Code was observed to: the alternate screen and
// tracking of any pointer event, reported in SGR form. It draws a window of
// `shown` numbered lines ending at the latest of `lines` and a draft row
// below it. Each wheel report redraws the window one line earlier or later.
// Other pointer reports, such as a tap's movement, press and release, change
// nothing. Any other input is typed into the draft, an escape shown as `^[`,
// so a key the page sent changes the draft row.
export function selfScrollingApplication({
  lines,
  shown,
}: {
  readonly lines: number;
  readonly shown: number;
}): TerminalApplication {
  const latest = lines - shown + 1;
  let first = latest;
  let draft = "";
  const draw = () =>
    `${escape}[H${Array.from(
      { length: shown },
      (...[, row]) => `${conversationLine(first + row)}${escape}[K\r\n`,
    ).join("")}> ${draft}${escape}[K`;
  return {
    opening: `${escape}[?1049h${escape}[?1003h${escape}[?1006h${draw()}`,
    answer(input) {
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
