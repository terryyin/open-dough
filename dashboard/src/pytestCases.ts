// The test cases a published pytest file defines, in source order and named
// as pytest proof names them (`./pytestProof.ts`): every module-level
// `def test_*` or `async def test_*`, and `test_*` methods of `Test*`
// classes (nested `Test*` classes included), each a case row
// (`./proofCases.ts`) named by its node id's `::`-joined names after the
// file, at the 1-based line of its `def`. Read from the text itself, never
// from the runner, as the python kind's rows (`./proofKinds.ts`). A
// function's parameter ids exist only once run, so a function with observed
// parameter ids gives one row per observed id, varied by it, in parameter id
// order (by Unicode code point, as Python's `sorted` orders `str`, whatever
// order the snapshot holds them in), and otherwise one plain row.

import type { CaseRow, SuccessfulCaseObservation } from "./proofCases.ts";

const definitionLine = /^(?:async\s+)?def\s+([A-Za-z_]\w*)/;
const classLine = /^class\s+([A-Za-z_]\w*)/;

// A block a line opens: a class with its collected name path (undefined
// when pytest does not collect its methods), or a function.
type Block = {
  readonly indent: number;
  readonly classPath: readonly string[] | undefined;
};

type Scan = {
  // The triple quote the line ends inside, if any.
  readonly string: string | undefined;
  // Open brackets at the line's end.
  readonly depth: number;
};

// Where a line leaves string and bracket state, so lines inside a
// multi-line string or bracketed expression are not read as definitions.
function scanLine(line: string, from: Scan): Scan {
  let string = from.string;
  let depth = from.depth;
  let at = 0;
  while (at < line.length) {
    const char = line[at] ?? "";
    if (string !== undefined) {
      if (char === "\\") at += 2;
      else if (line.startsWith(string, at)) {
        at += string.length;
        string = undefined;
      } else at += 1;
      continue;
    }
    if (char === "#") break;
    if (char === '"' || char === "'") {
      const triple = char.repeat(3);
      if (line.startsWith(triple, at)) {
        string = triple;
        at += 3;
        continue;
      }
      at += 1;
      while (at < line.length && line[at] !== char) {
        at += line[at] === "\\" ? 2 : 1;
      }
      at += 1;
      continue;
    }
    if (char === "(" || char === "[" || char === "{") depth += 1;
    else if (char === ")" || char === "]" || char === "}") {
      depth = Math.max(0, depth - 1);
    }
    at += 1;
  }
  return { string, depth };
}

// The test functions a published pytest file defines, with their names and
// definition lines, in source order.
function pytestDefinitionsOf(
  text: string,
): { readonly name: string; readonly line: number }[] {
  const definitions: { name: string; line: number }[] = [];
  const blocks: Block[] = [];
  let scan: Scan = { string: undefined, depth: 0 };
  for (const [at, raw] of text.split(/\r?\n/).entries()) {
    const statement = scan.string === undefined && scan.depth === 0;
    scan = scanLine(raw, scan);
    if (!statement) continue;
    const code = raw.trimStart();
    if (code === "" || code.startsWith("#")) continue;
    const indent = raw.length - code.length;
    while ((blocks.at(-1)?.indent ?? -1) >= indent) blocks.pop();
    const enclosing = blocks.at(-1);
    const collected = enclosing === undefined ? [] : enclosing.classPath;
    const definition = definitionLine.exec(code);
    if (definition !== null) {
      const name = definition[1] ?? "";
      if (collected !== undefined && name.startsWith("test_")) {
        definitions.push({
          name: [...collected, name].join("::"),
          line: at + 1,
        });
      }
      blocks.push({ indent, classPath: undefined });
      continue;
    }
    const named = classLine.exec(code);
    if (named !== null) {
      const name = named[1] ?? "";
      blocks.push({
        indent,
        classPath:
          collected !== undefined && name.startsWith("Test")
            ? [...collected, name]
            : undefined,
      });
    }
  }
  return definitions;
}

// Orders sequences item by item, a shorter prefix first.
function lexicographic<T>(compare: (left: T, right: T) => number) {
  return (left: readonly T[], right: readonly T[]): number => {
    for (const [at, item] of left.entries()) {
      const other = right[at];
      if (other === undefined) return 1;
      const difference = compare(item, other);
      if (difference !== 0) return difference;
    }
    return left.length - right.length;
  };
}

const codePointsOf = (text: string): number[] =>
  Array.from(text, (character) => character.codePointAt(0) ?? 0);

// Orders strings by Unicode code point; the default comparison orders UTF-16
// code units, which differs beyond the Basic Multilingual Plane.
const byCodePoints = lexicographic(
  (left: number, right: number) => left - right,
);
const byCodePoint = (left: string, right: string): number =>
  byCodePoints(codePointsOf(left), codePointsOf(right));

// A variant's parameter ids in order, compared id by id.
const byParameterId = lexicographic(byCodePoint);

export function pytestRowsOf(
  text: string,
  observed: readonly SuccessfulCaseObservation[],
): CaseRow[] {
  return pytestDefinitionsOf(text).flatMap(({ name, line }) => {
    const variants = observed
      .flatMap(({ name: observedName, variant }) =>
        observedName === name && variant !== undefined ? [variant] : [],
      )
      .sort(byParameterId);
    return variants.length === 0
      ? [{ name, line }]
      : variants.map((variant) => ({ name, variant, line }));
  });
}
