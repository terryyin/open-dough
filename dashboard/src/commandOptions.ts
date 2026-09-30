// The options a command's installed skill defines, read by the launch
// boundary (`../server/launchOptions.ts`): the definition's shape, which of a
// selection's flags it does not define, and the selection in the definition's
// own order. `options` and `focuses` are one flat list of selectable flags; a
// definition's other fields (defaults, how a selection composes) are for the
// agent and are tolerated here. Pure, no Node import.

import { z } from "zod";

const entrySchema = z.object({
  flag: z.string().regex(/^--[a-z][a-z0-9-]*$/),
  label: z.string().min(1),
  instruction: z.string().min(1),
});

const definitionShape = z.object({
  command: z.string().min(1),
  options: z.array(entrySchema),
  focuses: z.array(entrySchema).optional(),
});

export type OptionsDefinition = z.infer<typeof definitionShape>;

export const optionsDefinitionSchema = definitionShape.refine(
  (definition) => {
    const flags = selectableEntries(definition).map(({ flag }) => flag);
    return new Set(flags).size === flags.length;
  },
  { message: "A flag is defined once." },
);

// Every selectable entry, options then focuses, in the definition's order.
function selectableEntries(
  definition: Pick<OptionsDefinition, "options" | "focuses">,
) {
  return [...definition.options, ...(definition.focuses ?? [])];
}

// The flags of a selection the definition does not define, as given.
export function selectionProblems(
  definition: OptionsDefinition,
  selection: readonly string[],
): readonly string[] {
  const defined = new Set(
    selectableEntries(definition).map(({ flag }) => flag),
  );
  return selection.filter((flag) => !defined.has(flag));
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
