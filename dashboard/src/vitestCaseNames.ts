// How Vitest names a test case (`./vitestCases.ts`): its suites' and its own
// names from the outermost suite in, joined by Vitest's own full-name
// separator. Under `.each` or `.for` a name is a template whose placeholders
// (`%s %d %i %f %j %o %O %c %# %$ %%`, `$field`, `$field.path`) Vitest fills
// in, so a path with such a template names the observed names its pattern
// fits rather than itself; a template without placeholders names itself.

const nameSeparator = " > ";

// The case name of a test from its outermost suite's name to its own.
export const vitestCaseName = (path: readonly string[]): string =>
  path.join(nameSeparator);

// One name of a case's path: as written, and when it is a template with
// placeholders, the pattern of the names it fills in.
export type NameSegment = {
  readonly text: string;
  readonly pattern: string | undefined;
};

const placeholder = /%[sdifjoOc#$%]|\$[$\p{ID_Continue}.]+/gu;
const anything = "[\\s\\S]*";
const number = "(?:-?(?:Infinity|\\d+(?:\\.\\d+)?(?:e[-+]?\\d+)?n?)|NaN)";
const placeholderPatterns: Readonly<Record<string, string>> = {
  "%s": anything,
  "%o": anything,
  "%O": anything,
  "%j": anything,
  "%d": number,
  "%i": number,
  "%f": number,
  "%c": "",
  "%#": "\\d+",
  "%$": "\\d+",
  "%%": "%",
};

// Escapes the regular expression syntax characters of literal text.
const escaped = (text: string) => text.replace(/[\\^$.*+?()[\]{}|/]/g, "\\$&");

// A path segment named `text`, read as a template when `templated`.
export function nameSegmentOf(text: string, templated: boolean): NameSegment {
  return { text, pattern: templated ? patternOf(text) : undefined };
}

// The pattern of the names a template fills in, undefined when it has no
// placeholder and so names itself.
function patternOf(template: string): string | undefined {
  let pattern = "";
  let last = 0;
  let found = false;
  for (const match of template.matchAll(placeholder)) {
    found = true;
    pattern += escaped(template.slice(last, match.index));
    pattern += placeholderPatterns[match[0]] ?? anything;
    last = match.index + match[0].length;
  }
  return found ? pattern + escaped(template.slice(last)) : undefined;
}

// A test's written name and, when a suite's or its own name is a template
// with placeholders, the expression of the names it fills in.
export function namingOf(path: readonly NameSegment[]): {
  readonly name: string;
  readonly fits: RegExp | undefined;
} {
  const name = vitestCaseName(path.map(({ text }) => text));
  if (path.every(({ pattern }) => pattern === undefined)) {
    return { name, fits: undefined };
  }
  const pattern = path
    .map(({ text, pattern: filled }) => filled ?? escaped(text))
    .join(escaped(nameSeparator));
  return { name, fits: new RegExp(`^${pattern}$`, "u") };
}
