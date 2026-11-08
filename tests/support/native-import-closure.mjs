#!/usr/bin/env node
// node native-import-closure.mjs ROOT MODULE...
// Prints, one per line and sorted, each MODULE and every module it reaches
// through relative imports (`import … from "./…"`, `export … from "../…"`,
// `import "./…"`, or `import("./…")` with a literal path) or through a literal
// relative `.mjs` path given to `new URL("./….mjs", import.meta.url)`, which
// a module uses to spawn a script or register a Git driver, as paths relative
// to ROOT. A native evidence identity hashes this closure so a change to any
// module a journey's command runs or spawns changes the identity. Template
// literal text is data, such as the source of a generated project, so imports
// written inside it are not followed. Exits non-zero when a reached module
// cannot be read.
import { readFileSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";

const relativeImport =
  /(?:\bfrom|^\s*import|\bimport\s*\()\s*["'](\.{1,2}\/[^"']+)["']/gmu;
const spawnedScript =
  /\bnew URL\(\s*["'](\.{1,2}\/[^"']+\.mjs)["']\s*,\s*import\.meta\.url/gu;
// A `/` after one of these, or after a keyword below, starts a regular
// expression literal rather than a division.
const beforeRegExp = new Set("(,=:[!&|?{};+-*%<>~^".split(""));
const regExpKeyword =
  /\b(?:return|typeof|case|do|else|in|of|new|delete|void|throw|yield|await)$/u;

// `source` with the text of every template literal blanked, keeping line
// breaks and `${…}` expressions, so the patterns above see only code.
function withoutTemplateText(source, file) {
  const out = source.split("");
  // Each entry is the brace depth of an open `${…}` expression.
  const expressions = [];
  let inTemplate = false;
  let previous = "";
  let index = 0;
  // Moves past the string or regular expression literal opening at index.
  const skipQuoted = (quote) => {
    const start = index;
    let inClass = false;
    index += 1;
    while (inClass || source[index] !== quote) {
      if (index >= source.length || source[index] === "\n")
        throw new Error(
          `unterminated ${quote} literal in ${file}:${source.slice(0, start).split("\n").length}`,
        );
      if (source[index] === "\\") index += 1;
      else if (quote === "/" && source[index] === "[") inClass = true;
      else if (quote === "/" && source[index] === "]") inClass = false;
      index += 1;
    }
    index += 1;
  };
  while (index < source.length) {
    const char = source[index];
    if (inTemplate) {
      if (char === "`") {
        inTemplate = false;
        previous = "`";
        index += 1;
      } else if (char === "$" && source[index + 1] === "{") {
        inTemplate = false;
        expressions.push(0);
        previous = "{";
        index += 2;
      } else {
        const width = char === "\\" ? 2 : 1;
        for (let at = index; at < index + width && at < source.length; at += 1)
          if (out[at] !== "\n") out[at] = " ";
        index += width;
      }
      continue;
    }
    if (char === "/" && source[index + 1] === "/") {
      while (index < source.length && source[index] !== "\n") index += 1;
    } else if (char === "/" && source[index + 1] === "*") {
      const end = source.indexOf("*/", index + 2);
      if (end < 0) throw new Error(`unterminated comment in ${file}`);
      index = end + 2;
    } else if (char === '"' || char === "'") {
      skipQuoted(char);
      previous = char;
    } else if (
      char === "/" &&
      (previous === "" ||
        beforeRegExp.has(previous) ||
        regExpKeyword.test(
          source.slice(Math.max(0, index - 8), index).trimEnd(),
        ))
    ) {
      skipQuoted("/");
      previous = "/";
    } else if (char === "`") {
      inTemplate = true;
      index += 1;
    } else {
      if (expressions.length > 0) {
        const depth = expressions.length - 1;
        if (char === "{") expressions[depth] += 1;
        if (char === "}") {
          if (expressions[depth] === 0) {
            expressions.pop();
            inTemplate = true;
            index += 1;
            continue;
          }
          expressions[depth] -= 1;
        }
      }
      if (!/\s/u.test(char)) previous = char;
      index += 1;
    }
  }
  if (inTemplate || expressions.length > 0)
    throw new Error(`unterminated template literal in ${file}`);
  return out.join("");
}

const [root, ...modules] = process.argv.slice(2);
if (!root || modules.length === 0) {
  process.stderr.write("usage: native-import-closure.mjs ROOT MODULE...\n");
  process.exit(2);
}

const seen = new Set();
const pending = modules.map((module) => resolve(root, module));
while (pending.length > 0) {
  const file = pending.pop();
  if (seen.has(file)) continue;
  seen.add(file);
  // JSDoc import types support static checking and never load those modules
  // when the native journey runs.
  const source = withoutTemplateText(
    readFileSync(file, "utf8").replace(/\/\*\*[\s\S]*?\*\//g, ""),
    file,
  );
  for (const pattern of [relativeImport, spawnedScript]) {
    for (const [, specifier] of source.matchAll(pattern)) {
      pending.push(join(dirname(file), specifier));
    }
  }
}
const closure = [...seen].map((file) => relative(root, file)).sort();
process.stdout.write(`${closure.join("\n")}\n`);
