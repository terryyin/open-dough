// The tokens of a TypeScript or JavaScript source text that a reader of its
// calls needs (`./vitestCases.ts`): names, cooked string literals and
// substitution-free template literals, punctuation and opaque values, each
// at the 1-based line it starts on, and which bracket closes which. Comments,
// JSX text and the inside of template substitutions are not tokens, and a
// regular expression is one opaque value, so calls written inside any of them
// are not read. JSX tags and `{…}` expressions inside JSX are still scanned
// so their lines and nested calls stay correct (`./scriptTokensJsx.ts`).

import { escapeAt, newlinesIn, regexEndAt } from "./scriptTokenEscapes.ts";
import { TokenScan, jsxOpensAt } from "./scriptTokensJsx.ts";

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

// The file's tokens outside comments, JSX text and template substitutions.
export function tokensOf(text: string): Token[] {
  const tokens: Token[] = [];
  // The bracket depth each open template substitution returns to its
  // template at; tokens inside one are not kept.
  const substitutions: number[] = [];
  let previous: Token | undefined;
  const scan = new TokenScan(text);
  scan.keep = (token, outside = substitutions.length === 0) => {
    previous = token;
    if (outside) tokens.push(token);
  };
  // Reads an escape sequence from the backslash at `scan.at`.
  const escape = (): string => {
    const { value, end } = escapeAt(text, scan.at + 1);
    scan.line += newlinesIn(text.slice(scan.at, end));
    scan.at = end;
    return value;
  };
  // Reads a quoted string's text from `scan.at` to its closing `quote`, or to
  // the end of its line when unclosed — leaving a newline for the main loop
  // so the line count stays correct.
  scan.quotedText = (quote: string): string => {
    let cooked = "";
    while (scan.at < text.length && text[scan.at] !== quote) {
      const char = text[scan.at] ?? "";
      if (char === "\\") cooked += escape();
      else if (char === "\n" || char === "\r") break;
      else {
        cooked += char;
        scan.at += 1;
      }
    }
    if (scan.at < text.length && text[scan.at] === quote) scan.at += 1;
    return cooked;
  };
  // Reads template text from `scan.at` to its closing backtick or next
  // substitution; `opened` when a substitution opened.
  const templateText = (): { cooked: string; opened: boolean } => {
    let cooked = "";
    while (scan.at < text.length) {
      const char = text[scan.at] ?? "";
      if (char === "`") {
        scan.at += 1;
        return { cooked, opened: false };
      }
      if (char === "$" && text[scan.at + 1] === "{") {
        scan.at += 2;
        substitutions.push(scan.depth);
        scan.depth += 1;
        return { cooked, opened: true };
      }
      if (char === "\\") {
        cooked += escape();
        continue;
      }
      if (char === "\n") scan.line += 1;
      else if (char === "\r" && text[scan.at + 1] !== "\n") scan.line += 1;
      cooked += char === "\r" ? (text[scan.at + 1] === "\n" ? "" : "\n") : char;
      scan.at += 1;
    }
    return { cooked, opened: false };
  };
  const regexAllowed = () =>
    previous === undefined ||
    (previous.kind === "punct" && ![")", "]"].includes(previous.text)) ||
    (previous.kind === "name" && regexAfterWords.has(previous.text));
  // One step of ordinary script tokenization, used for JSX `{…}` too.
  scan.stepScript = (): void => {
    const char = text[scan.at] ?? "";
    const next = text[scan.at + 1] ?? "";
    const start = scan.line;
    if (char === "\n") {
      scan.line += 1;
      scan.at += 1;
    } else if (char === "\r") {
      if (next !== "\n") scan.line += 1;
      scan.at += 1;
    } else if (/\s/.test(char)) {
      scan.at += 1;
    } else if (char === "/" && next === "/") {
      while (scan.at < text.length && !/[\n\r]/.test(text[scan.at] ?? ""))
        scan.at += 1;
    } else if (char === "/" && next === "*") {
      const close = text.indexOf("*/", scan.at + 2);
      const end = close === -1 ? text.length : close + 2;
      scan.line += newlinesIn(text.slice(scan.at, end));
      scan.at = end;
    } else if (char === '"' || char === "'") {
      scan.at += 1;
      scan.keep({ kind: "literal", text: scan.quotedText(char), line: start });
    } else if (char === "`") {
      const outside = substitutions.length === 0;
      scan.at += 1;
      const { cooked, opened } = templateText();
      scan.keep(
        opened
          ? { kind: "template", line: start }
          : { kind: "literal", text: cooked, line: start },
        outside,
      );
    } else if (char === "}" && substitutions.at(-1) === scan.depth - 1) {
      scan.depth -= 1;
      substitutions.pop();
      scan.at += 1;
      templateText();
    } else if (nameStart.test(char)) {
      const from = scan.at;
      while (scan.at < text.length && namePart.test(text[scan.at] ?? ""))
        scan.at += 1;
      scan.keep({
        kind: "name",
        text: text.slice(from, scan.at),
        line: scan.line,
      });
    } else if (/\d/.test(char) || (char === "." && /\d/.test(next))) {
      while (scan.at < text.length && /[\w.]/.test(text[scan.at] ?? ""))
        scan.at += 1;
      scan.keep({ kind: "value", line: scan.line });
    } else if (
      char === "/" &&
      regexAllowed() &&
      regexEndAt(text, scan.at) > scan.at
    ) {
      scan.at = regexEndAt(text, scan.at);
      scan.keep({ kind: "value", line: scan.line });
    } else if (char === "=" && next === ">") {
      scan.at += 2;
      scan.keep({ kind: "punct", text: "=>", line: scan.line });
    } else if (char === "<" && jsxOpensAt(text, scan.at, previous)) {
      scan.scanJsxAt();
    } else {
      if (char === "(" || char === "[" || char === "{") scan.depth += 1;
      else if (char === ")" || char === "]" || char === "}") {
        scan.depth = Math.max(0, scan.depth - 1);
      }
      scan.at += 1;
      scan.keep({ kind: "punct", text: char, line: scan.line });
    }
  };
  while (scan.at < text.length) scan.stepScript();
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
