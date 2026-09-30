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
function selectableEntries(
  definition: Pick<OptionsDefinition, "options" | "focuses">,
) {
  return [...definition.options, ...(definition.focuses ?? [])];
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
  definition: OptionsDefinition,
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
  definition: OptionsDefinition,
  selection: readonly string[],
): string[] {
  return selectableEntries(definition)
    .map(({ flag }) => flag)
    .filter((flag) => selection.includes(flag));
}
