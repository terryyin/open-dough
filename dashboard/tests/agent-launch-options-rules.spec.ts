// The pure option rules, with no server: which definitions the shared schema
// accepts (../src/commandOptions.ts), which selections they refuse and in what
// order, the definition's own order of a selection, how a dialog's choice
// keeps an exclusive group to one flag, and the shape of a request's
// `options` (../src/agentLaunch.ts). How the launch boundary applies them over
// HTTP is ./agent-launch-options-boundary.spec.ts and
// ./agent-launch-options-groups.spec.ts.

import { expect, test } from "@playwright/test";
import { agentLaunchRequestSchema } from "../src/agentLaunch.ts";
import {
  inDefinitionOrder,
  optionsDefinitionSchema,
  selectionProblems,
  withChoice,
  withoutGroup,
} from "../src/commandOptions.ts";

const [a, b, c, d] = ["--a", "--b", "--c", "--d"];

const entry = (flag: string) => ({
  flag,
  label: flag,
  summary: `${flag}.`,
  instruction: `${flag}.`,
});

const group = (id: string, ...flags: string[]) => ({
  id,
  label: id.toUpperCase(),
  selection: "exclusive",
  flags,
});

// A definition of options A and B and focuses C and D, with these groups.
const definitionWith = <Group>(
  groups: readonly Group[] | undefined,
  {
    options = [a, b],
    focuses = [c, d],
  }: { options?: readonly string[]; focuses?: readonly string[] } = {},
) => ({
  command: "dough-story-refinement",
  options: options.map(entry),
  focuses: focuses.map(entry),
  ...(groups ? { groups } : {}),
});

test.describe("options definition schema", () => {
  test("accepts a definition with or without groups and focuses", () => {
    for (const definition of [
      definitionWith([group("pair", a, b)]),
      definitionWith(undefined),
      { command: "dough-story-refinement", options: [entry(a)] },
    ]) {
      expect(optionsDefinitionSchema.safeParse(definition).success).toBe(true);
    }
  });

  for (const [kind, definition] of [
    ["a duplicate flag", definitionWith(undefined, { options: [a, a] })],
    [
      "an entry without an instruction",
      {
        command: "dough-story-refinement",
        options: [{ flag: a, label: "A", summary: "A." }],
      },
    ],
    [
      "a flag in two groups",
      definitionWith([group("pair", a, b), group("other", b, c)]),
    ],
    [
      "a group member the definition does not define",
      definitionWith([group("pair", a, "--ghost")]),
    ],
    [
      "a group whose selection is not exclusive",
      definitionWith([{ ...group("pair", a, b), selection: "any" }]),
    ],
    [
      "a flag in both options and focuses",
      definitionWith([group("pair", a, b)], { focuses: [a] }),
    ],
  ] as const satisfies readonly (readonly [string, unknown])[]) {
    test(`rejects ${kind}, though the selection rules alone would allow the selection`, () => {
      expect(optionsDefinitionSchema.safeParse(definition).success).toBe(false);
      expect(
        selectionProblems(
          definition as Parameters<typeof selectionProblems>[0],
          [a],
        ),
      ).toEqual([]);
    });
  }
});

test.describe("selection problems", () => {
  const definition = definitionWith([
    group("pair", a, b),
    group("other", c, d),
  ]);

  test("names unknown flags as given, before exclusive conflicts", () => {
    expect(selectionProblems(definition, ["--y", b, a, "--x"])).toEqual([
      { kind: "unknown", flag: "--y" },
      { kind: "unknown", flag: "--x" },
      { kind: "exclusive", group: "PAIR", flags: [a, b] },
    ]);
  });

  test("names the group's label and its selected flags in the group's order", () => {
    const reversed = definitionWith([group("pair", b, a)]);
    expect(selectionProblems(reversed, [a, c, b])).toEqual([
      { kind: "exclusive", group: "PAIR", flags: [b, a] },
    ]);
  });

  test("reports two groups on their own, and allows one flag of each", () => {
    expect(selectionProblems(definition, [d, a, c, b])).toEqual([
      { kind: "exclusive", group: "PAIR", flags: [a, b] },
      { kind: "exclusive", group: "OTHER", flags: [c, d] },
    ]);
    expect(selectionProblems(definition, [a, c])).toEqual([]);
    expect(selectionProblems(definition, [])).toEqual([]);
  });

  test("treats an option and a focus of one group as a conflict", () => {
    const mixed = definitionWith([group("mixed", a, c)]);
    expect(selectionProblems(mixed, [c, a])).toEqual([
      { kind: "exclusive", group: "MIXED", flags: [a, c] },
    ]);
  });
});

test("a selection in the definition's order, across options and focuses, each once", () => {
  const definition = definitionWith([]);
  expect(inDefinitionOrder(definition, [d, b, a, d])).toEqual([a, b, d]);
  expect(inDefinitionOrder(definition, [])).toEqual([]);
});

test.describe("choosing in a dialog", () => {
  const shape = definitionWith([group("pair", a, b)], {
    options: [a, b, c],
    focuses: [d],
  });
  const other = definitionWith([group("pair", a, b), group("other", c, d)]);

  test("choosing a flag replaces the selected flag of its group, and leaves free flags and other groups", () => {
    expect([...withChoice(shape, new Set([a, c]), b, true)].sort()).toEqual(
      [b, c].sort(),
    );
    expect([...withChoice(shape, new Set([a]), c, true)].sort()).toEqual(
      [a, c].sort(),
    );
    expect([...withChoice(other, new Set([a, c]), b, true)].sort()).toEqual(
      [b, c].sort(),
    );
  });

  test("clearing a flag removes only that flag", () => {
    expect([...withChoice(shape, new Set([a, c, d]), c, false)]).toEqual([
      a,
      d,
    ]);
  });

  test("clearing a group removes only that group's flags", () => {
    expect([...withoutGroup(new Set([a, c, d]), group("other", c, d))]).toEqual(
      [a],
    );
    expect([...withoutGroup(new Set([b, c]), group("pair", a, b))]).toEqual([
      c,
    ]);
  });
});

test.describe("a launch request's options", () => {
  const request = {
    source: "open-dough",
    identity: "SEED-001#story",
    title: "A story",
    workflow: "refinement",
    host: "claude",
  };
  const flags = (count: number) =>
    Array.from({ length: count }, (_, index) => `--f${index}`);

  test("may be absent, empty, or up to the limit of one-line flags", () => {
    for (const options of [undefined, [], [a], flags(32)]) {
      expect(
        agentLaunchRequestSchema.safeParse({ ...request, options }).success,
        JSON.stringify(options),
      ).toBe(true);
    }
  });

  test("refuses anything but a list of non-empty strings, or too many", () => {
    for (const options of [a, [1], [""], null, flags(33)]) {
      expect(
        agentLaunchRequestSchema.safeParse({ ...request, options }).success,
        JSON.stringify(options),
      ).toBe(false);
    }
  });
});
