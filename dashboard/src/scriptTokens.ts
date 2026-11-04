// The tokens of a TypeScript or JavaScript source text that a reader of its
// calls needs (`./vitestCases.ts`): names, cooked string literals and
// substitution-free template literals, punctuation and opaque values, each
// at the 1-based line it starts on, and which bracket closes which. Comments
// and the inside of template substitutions are not tokens, and a regular
// expression is one opaque value, so calls written inside any of them are
// not read.

export type Token =
  | { readonly kind: "name"; readonly text: string; readonly line: number }
  // A string literal or a template literal without substitutions, cooked.
  | { readonly kind: "literal"; readonly text: string; readonly line: number }
  // A template literal with substitutions.
  | { readonly kind: "template"; readonly line: number }
  | { readonly kind: "punct"; readonly text: string; readonly line: number }
  // A number or a regular expression.
  | { readonly kind: "value"; readonly line: number };

const nameStart = /[A-Za-z_$]/;
const namePart = /[\w$]/;

// Words after which `/` starts a regular expression rather than dividing.
const regexAfterWords = new Set([
  "return",
  "typeof",
  "case",
  "do",
  "else",
  "in",
  "of",
  "new",
  "delete",
  "void",
  "throw",
  "instanceof",
  "yield",
  "await",
]);

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
function escapeAt(text: string, at: number): { value: string; end: number } {
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
function regexEndAt(text: string, at: number): number {
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

const newlinesIn = (text: string): number =>
  text.split(/\r\n|\r|\n/).length - 1;

// The file's tokens outside comments and outside template substitutions.
export function tokensOf(text: string): Token[] {
  const tokens: Token[] = [];
  // The bracket depth each open template substitution returns to its
  // template at; tokens inside one are not kept.
  const substitutions: number[] = [];
  let depth = 0;
  let previous: Token | undefined;
  let at = 0;
  let line = 1;
  const keep = (token: Token, outside = substitutions.length === 0) => {
    previous = token;
    if (outside) tokens.push(token);
  };
  // Reads an escape sequence from the backslash at `at`.
  const escape = (): string => {
    const { value, end } = escapeAt(text, at + 1);
    line += newlinesIn(text.slice(at, end));
    at = end;
    return value;
  };
  // Reads a quoted string's text from `at` to its closing `quote`, or to the
  // end of its line when unclosed.
  const quotedText = (quote: string): string => {
    let cooked = "";
    while (at < text.length && text[at] !== quote) {
      const char = text[at] ?? "";
      if (char === "\\") cooked += escape();
      else if (char === "\n" || char === "\r") break;
      else {
        cooked += char;
        at += 1;
      }
    }
    at += 1;
    return cooked;
  };
  // Reads template text from `at` to its closing backtick or next
  // substitution; `opened` when a substitution opened.
  const templateText = (): { cooked: string; opened: boolean } => {
    let cooked = "";
    while (at < text.length) {
      const char = text[at] ?? "";
      if (char === "`") {
        at += 1;
        return { cooked, opened: false };
      }
      if (char === "$" && text[at + 1] === "{") {
        at += 2;
        substitutions.push(depth);
        depth += 1;
        return { cooked, opened: true };
      }
      if (char === "\\") {
        cooked += escape();
        continue;
      }
      if (char === "\n") line += 1;
      else if (char === "\r" && text[at + 1] !== "\n") line += 1;
      cooked += char === "\r" ? (text[at + 1] === "\n" ? "" : "\n") : char;
      at += 1;
    }
    return { cooked, opened: false };
  };
  const regexAllowed = () =>
    previous === undefined ||
    (previous.kind === "punct" && ![")", "]"].includes(previous.text)) ||
    (previous.kind === "name" && regexAfterWords.has(previous.text));
  while (at < text.length) {
    const char = text[at] ?? "";
    const next = text[at + 1] ?? "";
    const start = line;
    if (char === "\n") {
      line += 1;
      at += 1;
    } else if (char === "\r") {
      if (next !== "\n") line += 1;
      at += 1;
    } else if (/\s/.test(char)) {
      at += 1;
    } else if (char === "/" && next === "/") {
      while (at < text.length && !/[\n\r]/.test(text[at] ?? "")) at += 1;
    } else if (char === "/" && next === "*") {
      const close = text.indexOf("*/", at + 2);
      const end = close === -1 ? text.length : close + 2;
      line += newlinesIn(text.slice(at, end));
      at = end;
    } else if (char === '"' || char === "'") {
      at += 1;
      keep({ kind: "literal", text: quotedText(char), line: start });
    } else if (char === "`") {
      const outside = substitutions.length === 0;
      at += 1;
      const { cooked, opened } = templateText();
      keep(
        opened
          ? { kind: "template", line: start }
          : { kind: "literal", text: cooked, line: start },
        outside,
      );
    } else if (char === "}" && substitutions.at(-1) === depth - 1) {
      depth -= 1;
      substitutions.pop();
      at += 1;
      templateText();
    } else if (nameStart.test(char)) {
      const from = at;
      while (at < text.length && namePart.test(text[at] ?? "")) at += 1;
      keep({ kind: "name", text: text.slice(from, at), line });
    } else if (/\d/.test(char) || (char === "." && /\d/.test(next))) {
      while (at < text.length && /[\w.]/.test(text[at] ?? "")) at += 1;
      keep({ kind: "value", line });
    } else if (char === "/" && regexAllowed() && regexEndAt(text, at) > at) {
      at = regexEndAt(text, at);
      keep({ kind: "value", line });
    } else if (char === "=" && next === ">") {
      at += 2;
      keep({ kind: "punct", text: "=>", line });
    } else {
      if (char === "(" || char === "[" || char === "{") depth += 1;
      else if (char === ")" || char === "]" || char === "}") {
        depth = Math.max(0, depth - 1);
      }
      at += 1;
      keep({ kind: "punct", text: char, line });
    }
  }
  return tokens;
}

// For each opening bracket token, the index of the token closing it.
export function closingsOf(tokens: readonly Token[]): Map<number, number> {
  const closings = new Map<number, number>();
  const open: number[] = [];
  for (const [at, token] of tokens.entries()) {
    if (token.kind !== "punct") continue;
    if (["(", "[", "{"].includes(token.text)) open.push(at);
    else if ([")", "]", "}"].includes(token.text)) {
      const from = open.pop();
      if (from !== undefined) closings.set(from, at);
    }
  }
  return closings;
}

// A punctuation token of `text`.
export const isPunct = (token: Token | undefined, text: string): boolean =>
  token?.kind === "punct" && token.text === text;
