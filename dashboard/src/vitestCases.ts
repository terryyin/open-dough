// The test cases a published TypeScript or JavaScript test file defines for
// the `describe`/`suite` and `it`/`test` call family Vitest runs, in source
// order, each a case row (`./proofCases.ts`) at the 1-based line where its
// call starts. Read from the text itself, never from the runner, through its
// tokens (`./scriptTokens.ts`): calls inside comments, strings, template
// literals, JSX text and regular expressions are not read, and a test belongs
// to the suites whose call arguments enclose it.
//
// A call is `describe`, `suite`, `it` or `test`, not a member of another
// value, with an optional modifier chain (`.skip`, `.only`, `.todo`,
// `.concurrent`, `.sequential`, `.fails`, `.shuffle`, `.skipIf(…)`,
// `.runIf(…)`, `.each(…)` or `.each` with a tagged table, `.for(…)`) and its
// name as the first argument: a string literal or a template literal without
// substitutions. A test with any other name is not read, nor is a suite with
// any other name or anything inside it, since its tests' names would be
// wrong. A case is named as Vitest names it (`./vitestCaseNames.ts`).
//
// A name under `.each` or `.for` with placeholders names the observed names
// that fit it, one row each in Unicode code-point order whatever order the
// snapshot holds them in, and one row named as written while none is
// observed. An observed name a literal test of the file names, or an earlier
// template already fits, is not another template's. A name observed under
// several projects gives one row per project, varied by it, in code-point
// order (`observedVariantsOf`), a name observed without a project first; an
// unobserved name is one plain row.

import {
  byCodePoint,
  observedVariantsOf,
  type CaseRow,
  type SuccessfulCaseObservation,
} from "./proofCases.ts";
import { closingsOf, isPunct, tokensOf, type Token } from "./scriptTokens.ts";
import {
  nameSegmentOf,
  namingOf,
  type NameSegment,
} from "./vitestCaseNames.ts";

const roles: Readonly<Record<string, "suite" | "test">> = {
  describe: "suite",
  suite: "suite",
  it: "test",
  test: "test",
};

// Modifiers that take arguments (or, for `each`, a tagged table) before the
// call that names the case, and those whose names are templates.
const modifiersWithArguments = new Set(["each", "for", "skipIf", "runIf"]);
const templatingModifiers = new Set(["each", "for"]);
const modifiers = new Set([
  ...modifiersWithArguments,
  "skip",
  "only",
  "todo",
  "concurrent",
  "sequential",
  "fails",
  "shuffle",
]);

// Words before a name that make it a declaration rather than a call.
const declaringWords = new Set(["function", "class", "interface", "type"]);

type Call = {
  readonly role: "suite" | "test";
  readonly segment: NameSegment | undefined;
  readonly line: number;
  // The token range of the naming call's arguments, and where reading goes
  // on after the call.
  readonly from: number;
  readonly to: number;
};

// Where a type argument list opening at `at`, such as `.each<Case>`, ends.
function afterTypeArguments(tokens: readonly Token[], at: number): number {
  if (!isPunct(tokens[at], "<")) return at;
  let angles = 0;
  let next = at;
  for (; next < tokens.length; next += 1) {
    if (isPunct(tokens[next], "<")) angles += 1;
    else if (isPunct(tokens[next], ">")) angles -= 1;
    if (angles === 0) break;
  }
  return next + 1;
}

// Where the modifier chain after a callee at `at` ends, at the call that
// names the case, and whether it templates the name; undefined when a
// modifier's arguments are not read.
function afterModifiers(
  tokens: readonly Token[],
  closings: ReadonlyMap<number, number>,
  at: number,
): { readonly next: number; readonly templated: boolean } | undefined {
  let templated = false;
  let next = at;
  for (;;) {
    const modifier = tokens[next + 1];
    if (
      !isPunct(tokens[next], ".") ||
      modifier?.kind !== "name" ||
      !modifiers.has(modifier.text)
    ) {
      return { next, templated };
    }
    next += 2;
    if (!modifiersWithArguments.has(modifier.text)) continue;
    if (templatingModifiers.has(modifier.text)) templated = true;
    next = afterTypeArguments(tokens, next);
    const table = tokens[next];
    if (table?.kind === "literal" || table?.kind === "template") {
      next += 1;
    } else if (isPunct(table, "(")) {
      const close = closings.get(next);
      if (close === undefined) return undefined;
      next = close + 1;
    } else {
      return undefined;
    }
  }
}

// The test-family call starting at `at`, undefined when none does.
function callAt(
  tokens: readonly Token[],
  closings: ReadonlyMap<number, number>,
  at: number,
): Call | undefined {
  const start = tokens[at];
  if (start?.kind !== "name" || !Object.hasOwn(roles, start.text)) {
    return undefined;
  }
  const before = tokens[at - 1];
  if (
    isPunct(before, ".") ||
    (before?.kind === "name" && declaringWords.has(before.text))
  ) {
    return undefined;
  }
  const chain = afterModifiers(tokens, closings, at + 1);
  if (chain === undefined || !isPunct(tokens[chain.next], "(")) {
    return undefined;
  }
  const open = chain.next;
  const close = closings.get(open);
  if (close === undefined) return undefined;
  const name = tokens[open + 1];
  const after = tokens[open + 2];
  return {
    role: roles[start.text] ?? "test",
    segment:
      name?.kind === "literal" && (isPunct(after, ",") || isPunct(after, ")"))
        ? nameSegmentOf(name.text, chain.templated)
        : undefined,
    line: start.line,
    from: open + 1,
    to: close,
  };
}

type Definition = {
  readonly path: readonly NameSegment[];
  readonly line: number;
};

// The tests a published file defines, with their suite paths and call
// lines, in source order.
function vitestDefinitionsOf(text: string): Definition[] {
  const tokens = tokensOf(text);
  const closings = closingsOf(tokens);
  const definitions: Definition[] = [];
  const read = (from: number, to: number, path: readonly NameSegment[]) => {
    let at = from;
    while (at < to) {
      const call = callAt(tokens, closings, at);
      if (call === undefined) {
        at += 1;
        continue;
      }
      if (call.segment !== undefined) {
        const named = [...path, call.segment];
        if (call.role === "suite") read(call.from, call.to, named);
        else definitions.push({ path: named, line: call.line });
      }
      at = call.to + 1;
    }
  };
  read(0, tokens.length, []);
  return definitions;
}

// The rows of one case name: one per observed project, after a plain row
// when the name was observed without one or not at all.
function rowsOfName(
  name: string,
  line: number,
  observed: readonly SuccessfulCaseObservation[],
): CaseRow[] {
  const { variants, plain } = observedVariantsOf(name, observed);
  return [
    ...(plain || variants.length === 0 ? [{ name, line }] : []),
    ...variants.map((variant) => ({ name, variant, line })),
  ];
}

export function vitestRowsOf(
  text: string,
  observed: readonly SuccessfulCaseObservation[],
): CaseRow[] {
  const definitions = vitestDefinitionsOf(text).map(({ path, line }) => ({
    ...namingOf(path),
    line,
  }));
  const claimed = new Set(
    definitions.flatMap(({ name, fits }) => (fits === undefined ? [name] : [])),
  );
  const observedNames = [...new Set(observed.map(({ name }) => name))];
  return definitions.flatMap(({ name, fits, line }) => {
    let names = [name];
    if (fits !== undefined) {
      const filled = observedNames
        .filter((candidate) => !claimed.has(candidate) && fits.test(candidate))
        .sort(byCodePoint);
      for (const candidate of filled) claimed.add(candidate);
      if (filled.length > 0) names = filled;
    }
    return names.flatMap((caseName) => rowsOfName(caseName, line, observed));
  });
}
