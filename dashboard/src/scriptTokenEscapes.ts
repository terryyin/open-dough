// Escape sequences and regular-expression span ends for `./scriptTokens.ts`.

const namePart = /[\w$]/;

const simpleEscapes: Readonly<Record<string, string>> = {
  n: "\n",
  r: "\r",
  t: "\t",
  b: "\b",
  f: "\f",
  v: "\v",
  "0": "\0",
};

// The character an escape sequence at `at` (just after its backslash)
// stands for, and where it ends.
export function escapeAt(
  text: string,
  at: number,
): { value: string; end: number } {
  const char = text[at] ?? "";
  if (char === "\r" && text[at + 1] === "\n") return { value: "", end: at + 2 };
  if (char === "\n" || char === "\r" || char === "\u2028" || char === "\u2029")
    return { value: "", end: at + 1 };
  if (char === "x") {
    const hex = text.slice(at + 1, at + 3);
    return { value: String.fromCodePoint(parseInt(hex, 16) || 0), end: at + 3 };
  }
  if (char === "u") {
    if (text[at + 1] === "{") {
      const close = text.indexOf("}", at);
      const hex = text.slice(at + 2, close);
      return {
        value: String.fromCodePoint(parseInt(hex, 16) || 0),
        end: close + 1,
      };
    }
    const hex = text.slice(at + 1, at + 5);
    return { value: String.fromCharCode(parseInt(hex, 16) || 0), end: at + 5 };
  }
  return { value: simpleEscapes[char] ?? char, end: at + 1 };
}

// Where a regular expression literal starting at `at` ends, or `at` when
// none closes on its line, as with JSX's `/>`.
export function regexEndAt(text: string, at: number): number {
  let inClass = false;
  for (let end = at + 1; end < text.length; end += 1) {
    const char = text[end] ?? "";
    if (char === "\n" || char === "\r") return at;
    if (char === "\\") end += 1;
    else if (char === "[") inClass = true;
    else if (char === "]") inClass = false;
    else if (char === "/" && !inClass) {
      end += 1;
      while (end < text.length && namePart.test(text[end] ?? "")) end += 1;
      return end;
    }
  }
  return at;
}

export const newlinesIn = (text: string): number =>
  text.split(/\r\n|\r|\n/).length - 1;
