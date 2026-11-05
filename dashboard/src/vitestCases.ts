// The test cases a published TypeScript or JavaScript test file defines for
// the `describe`/`suite` and `it`/`test` call family Vitest, Playwright and
// Node run, in source order, each a case row (`./proofCases.ts`) at the
// 1-based line where its call starts (the `test` token when the family name
// is a member of `test`). Read from the text through its tokens
// (`./scriptTokens.ts`); a case is named as Vitest names it
// (`./vitestCaseNames.ts`). A call is `describe`, `suite`, `it` or `test`,
// bare or as a member of `test` (`test.describe`, `test.it`), with an
// optional modifier chain (`.skip`, `.only`, `.todo`, `.concurrent`,
// `.sequential`, `.fails`, `.fail`, `.fixme`, `.serial`, `.parallel`,
// `.shuffle`, `.skipIf(…)`, `.runIf(…)`, `.each(…)` / tagged `.each`,
// `.for(…)`) and a literal or unsubstituted template name. Other names are
// not read; a non-literal suite hides its interior; an anonymous suite
// (`describe(fn)` / `test.describe(fn)`) adds no path segment and is read
// through; `test.describe.configure`, `test.use`, hooks and `test.step`
// name no case. A templated `.each`/`.for` name expands to fitting observed
// names in code-point order (`observedVariantsOf`), one row per project
// when varied.

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
  "fail",
  "fixme",
  "serial",
  "parallel",
  "shuffle",
]);

// Words before a name that make it a declaration rather than a call.
const declaringWords = new Set(["function", "class", "interface", "type"]);

// First tokens of a suite's only argument that mark an anonymous callback,
// so the suite adds no path segment and its interior is still read.
const anonymousSuiteStarts = new Set(["(", "async", "function"]);

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

// The test-family call starting at `at`, undefined when none does. A family
// name that is a member of bare `test` (`test.describe`) is a call; the case
// line is the line of that `test` token.
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
  const owner = tokens[at - 2];
  const memberOfTest =
    isPunct(before, ".") &&
    owner?.kind === "name" &&
    owner.text === "test" &&
    !isPunct(tokens[at - 3], ".");
  if (isPunct(before, ".") && !memberOfTest) {
    return undefined;
  }
  if (before?.kind === "name" && declaringWords.has(before.text)) {
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
    line: memberOfTest ? owner.line : start.line,
    from: open + 1,
    to: close,
  };
}

function isAnonymousSuite(tokens: readonly Token[], call: Call): boolean {
  const first = tokens[call.from];
  return (
    first !== undefined &&
    (first.kind === "punct" || first.kind === "name") &&
    anonymousSuiteStarts.has(first.text)
  );
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
      } else if (call.role === "suite" && isAnonymousSuite(tokens, call)) {
        read(call.from, call.to, path);
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
