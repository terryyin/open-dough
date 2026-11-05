// JSX open detection and tag/`{…}` scanning for `./scriptTokens.ts`. JSX text
// is not tokenized; tags and expression braces are, so nested calls keep
// their lines.

import type { Token } from "./scriptTokens.ts";

const nameStart = /[A-Za-z_$]/;
const namePart = /[\w$]/;

// Words after which `<` may open JSX rather than a type argument list.
const jsxAfterWords = new Set([
  "return",
  "throw",
  "case",
  "else",
  "do",
  "default",
  "yield",
  "await",
  "typeof",
  "void",
  "delete",
  "new",
]);

// Mutable cursor the script tokenizer shares with JSX scanning.
export class TokenScan {
  at = 0;
  line = 1;
  depth = 0;
  // Open JSX elements waiting for children or a closing tag.
  jsxDepth = 0;
  keep: (token: Token, outside?: boolean) => void = () => {};
  quotedText: (quote: string) => string = () => "";
  // Ordinary script step, reused for JSX `{…}` bodies.
  stepScript: () => void = () => {};
  readonly text: string;

  constructor(text: string) {
    this.text = text;
  }

  // Scans a `{…}` JSX expression with ordinary script rules until its
  // closing brace at the entry depth.
  scanJsxExpression(): void {
    const entry = this.depth;
    this.at += 1;
    this.keep({ kind: "punct", text: "{", line: this.line });
    this.depth += 1;
    while (this.at < this.text.length && this.depth > entry) this.stepScript();
  }

  // Skips JSX text (quotes, comments and backticks are text here) and scans
  // nested tags and `{…}` expressions until the open element's close.
  scanJsxChildren(): void {
    const opened = this.jsxDepth;
    while (this.at < this.text.length && this.jsxDepth >= opened) {
      const char = this.text[this.at] ?? "";
      const next = this.text[this.at + 1] ?? "";
      if (this.advanceNewline(char, next)) continue;
      if (char === "{") this.scanJsxExpression();
      else if (char === "<") this.scanJsxAt();
      else this.at += 1;
    }
  }

  // Scans one JSX tag from its `<`, then children until the matching close
  // when the tag opens an element.
  scanJsxAt(): void {
    const start = this.line;
    this.at += 1;
    this.keep({ kind: "punct", text: "<", line: start });
    const closing = this.text[this.at] === "/";
    if (closing) {
      this.keep({ kind: "punct", text: "/", line: this.line });
      this.at += 1;
    }
    while (this.at < this.text.length) {
      const char = this.text[this.at] ?? "";
      const next = this.text[this.at + 1] ?? "";
      if (this.advanceNewline(char, next)) continue;
      if (/\s/.test(char)) {
        this.at += 1;
      } else if (char === '"' || char === "'") {
        const litStart = this.line;
        this.at += 1;
        this.keep({
          kind: "literal",
          text: this.quotedText(char),
          line: litStart,
        });
      } else if (char === "{") {
        this.scanJsxExpression();
      } else if (char === "/" && next === ">") {
        this.at += 2;
        this.keep({ kind: "punct", text: "/", line: this.line });
        this.keep({ kind: "punct", text: ">", line: this.line });
        return;
      } else if (char === ">") {
        this.at += 1;
        this.keep({ kind: "punct", text: ">", line: this.line });
        if (closing) {
          this.jsxDepth = Math.max(0, this.jsxDepth - 1);
          return;
        }
        this.jsxDepth += 1;
        this.scanJsxChildren();
        return;
      } else if (nameStart.test(char) || char === ":") {
        const from = this.at;
        while (
          this.at < this.text.length &&
          /[\w$.:-]/.test(this.text[this.at] ?? "")
        )
          this.at += 1;
        this.keep({
          kind: "name",
          text: this.text.slice(from, this.at),
          line: this.line,
        });
      } else {
        this.at += 1;
        this.keep({ kind: "punct", text: char, line: this.line });
      }
    }
  }

  private advanceNewline(char: string, next: string): boolean {
    if (char === "\n") {
      this.line += 1;
      this.at += 1;
      return true;
    }
    if (char === "\r") {
      if (next !== "\n") this.line += 1;
      this.at += 1;
      return true;
    }
    return false;
  }
}

// Whether `<` at `at` opens JSX given the previous token, rather than a type
// argument list (`each<Case>`) or a generic arrow (`<T,>`).
export function jsxOpensAt(
  text: string,
  at: number,
  previous: Token | undefined,
): boolean {
  if (previous?.kind === "name" && !jsxAfterWords.has(previous.text))
    return false;
  if (previous?.kind === "literal" || previous?.kind === "value") return false;
  if (
    previous?.kind === "punct" &&
    [")", "]", '"', "'", "`"].includes(previous.text)
  )
    return false;
  let i = at + 1;
  const first = text[i] ?? "";
  if (first === "/" || first === ">") return true;
  if (!nameStart.test(first)) return false;
  i += 1;
  while (i < text.length && namePart.test(text[i] ?? "")) i += 1;
  while (i < text.length && /[ \t]/.test(text[i] ?? "")) i += 1;
  const next = text[i] ?? "";
  if (next === ",") return false;
  if (nameStart.test(next)) {
    const from = i;
    while (i < text.length && namePart.test(text[i] ?? "")) i += 1;
    if (text.slice(from, i) === "extends") return false;
  }
  return true;
}
