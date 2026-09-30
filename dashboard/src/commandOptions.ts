// The options a command's installed skill defines, read by the launch
// boundary (`../server/launchOptions.ts`): the definition's shape, which of a
// selection's flags it does not define or that share an exclusive group, and
// the selection in the definition's own order. `options` and `focuses` are one
// flat list of selectable flags; a definition's other fields (defaults, how a
// selection composes) are for the agent and are tolerated here. Pure, no Node
// import.

import { z } from "zod";

const entrySchema = z.object({
  flag: z.string().regex(/^--[a-z][a-z0-9-]*$/),
  label: z.string().min(1),
  // One line for the developer choosing the option.
  summary: z.string().min(1),
  instruction: z.string().min(1),
});

// Flags of one group cannot be selected together.
const groupSchema = z.object({
  id: z.string().min(1),
  label: z.string().min(1),
  selection: z.literal("exclusive"),
  flags: z.array(z.string()),
});

const definitionShape = z.object({
  command: z.string().min(1),
  options: z.array(entrySchema),
  focuses: z.array(entrySchema).optional(),
  groups: z.array(groupSchema).optional(),
});

export type OptionsDefinition = z.infer<typeof definitionShape>;

// What a launch dialog offers of one entry: the words for choosing it.
export const offeredOptionSchema = entrySchema.pick({
  flag: true,
  label: true,
  summary: true,
});

export type OfferedOption = z.infer<typeof offeredOptionSchema>;

// What a launch dialog offers of a definition: its entries, options then
// focuses in one flat list in the definition's order, and its groups.
export const offeredShapeSchema = z.object({
  options: z.array(offeredOptionSchema),
  groups: z.array(groupSchema),
});

export type OfferedShape = z.infer<typeof offeredShapeSchema>;

// The part of a definition that selection rules read; an offer has it too.
type SelectionShape = {
  readonly options: readonly { readonly flag: string }[];
  readonly focuses?: readonly { readonly flag: string }[] | undefined;
  readonly groups?:
    | readonly {
        readonly label: string;
        readonly flags: readonly string[];
      }[]
    | undefined;
};

// A malformed definition is invalid as a whole: a flag defined twice, a group
// member the definition does not define, or a flag in two groups.
export const optionsDefinitionSchema = definitionShape
  .refine(
    (definition) => {
      const flags = selectableEntries(definition).map(({ flag }) => flag);
      return new Set(flags).size === flags.length;
    },
    { message: "A flag is defined once." },
  )
  .refine(
    (definition) => {
      const defined = new Set(
        selectableEntries(definition).map(({ flag }) => flag),
      );
      const members = (definition.groups ?? []).flatMap(({ flags }) => flags);
      return (
        members.every((flag) => defined.has(flag)) &&
        new Set(members).size === members.length
      );
    },
    { message: "A group holds defined flags, each in one group." },
  );

// Every selectable entry, options then focuses, in the definition's order.
function selectableEntries<
  Entry extends { readonly flag: string },
>(definition: {
  readonly options: readonly Entry[];
  readonly focuses?: readonly Entry[] | undefined;
}) {
  return [...definition.options, ...(definition.focuses ?? [])];
}

// What a dialog offers of a definition: its entries and its groups.
export function offeredShape(definition: OptionsDefinition): OfferedShape {
  return {
    options: selectableEntries(definition).map(({ flag, label, summary }) => ({
      flag,
      label,
      summary,
    })),
    groups: definition.groups ?? [],
  };
}

export type SelectionProblem =
  | { readonly kind: "unknown"; readonly flag: string }
  | {
      readonly kind: "exclusive";
      readonly group: string;
      readonly flags: readonly string[];
    };

// What keeps a selection from being honored: each flag the definition does
// not define, as given, then each exclusive group with more than one of its
// flags selected (the group's label, the selected flags in its order).
export function selectionProblems(
  definition: SelectionShape,
  selection: readonly string[],
): readonly SelectionProblem[] {
  const defined = new Set(
    selectableEntries(definition).map(({ flag }) => flag),
  );
  const unknown = selection
    .filter((flag) => !defined.has(flag))
    .map((flag): SelectionProblem => ({ kind: "unknown", flag }));
  const conflicts = (definition.groups ?? []).flatMap(
    ({ label, flags }): SelectionProblem[] => {
      const chosen = flags.filter((flag) => selection.includes(flag));
      return chosen.length > 1
        ? [{ kind: "exclusive", group: label, flags: chosen }]
        : [];
    },
  );
  return [...unknown, ...conflicts];
}

// A selection's flags in the definition's order, each once; the order a
// request names them in has no meaning.
export function inDefinitionOrder(
  definition: SelectionShape,
  selection: readonly string[],
): string[] {
  return selectableEntries(definition)
    .map(({ flag }) => flag)
    .filter((flag) => selection.includes(flag));
}

// Why a project's installed skill offers no options, worded to follow
// "the installed <skill> skill in <place>": the boundary refuses with these
// words and the page says the same, including when it finds no definition.
export const unavailableOptionsWhy = {
  missing: "has no options file",
  unreadable: "has an options file that could not be read",
  invalid: "has an options file that is not valid",
  otherCommand: "has an options file for another command",
} as const;

export type UnavailableOptionsWhy =
  (typeof unavailableOptionsWhy)[keyof typeof unavailableOptionsWhy];

// A selection with none of an exclusive group's flags.
export function withoutGroup(
  selection: ReadonlySet<string>,
  group: { readonly flags: readonly string[] },
): ReadonlySet<string> {
  return new Set([...selection].filter((flag) => !group.flags.includes(flag)));
}

// A selection with one flag chosen or cleared. Choosing a flag replaces the
// selected flag of its exclusive group, so a dialog never builds a selection
// `selectionProblems` would refuse.
export function withChoice(
  shape: SelectionShape,
  selection: ReadonlySet<string>,
  flag: string,
  chosen: boolean,
): ReadonlySet<string> {
  const next = new Set(selection);
  if (!chosen) {
    next.delete(flag);
    return next;
  }
  const group = (shape.groups ?? []).find(({ flags }) => flags.includes(flag));
  for (const member of group?.flags ?? []) next.delete(member);
  next.add(flag);
  return next;
}
