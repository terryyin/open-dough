// System settings → Usage's selection: which tools it compares, each read as
// its own cohort (`./usageTokenIndex.ts`) under the shared launch workflow,
// model and effort. Each tool keeps its own tariff, unit and median; the view
// only offers their models and efforts together.
import { hostDescriptions } from "./hostDescription.ts";
import {
  defaultCohort,
  usageTools,
  type TokenIndexAnswer,
  type TokenIndexCohort,
  type UsageModel,
  type UsageTool,
} from "./usageTokenIndex.ts";

export type UsageSelection = Omit<TokenIndexCohort, "tool"> & {
  // In `usageTools` order; none selected reads nothing.
  readonly tools: readonly UsageTool[];
};

// The default cohort's tool alone, under its filters.
const { tool: defaultTool, ...defaultFilters } = defaultCohort;
export const defaultSelection: UsageSelection = {
  ...defaultFilters,
  tools: [defaultTool],
};

export const usageToolName = (tool: UsageTool): string =>
  hostDescriptions[tool].name;

// A tool's chart trace slot: traces keep `usageTools` order whichever are shown.
export const usageToolSlot = (tool: UsageTool): number =>
  usageTools.indexOf(tool);

// A tool's swatch in its chart trace's colour.
export const usageToolSwatch = (tool: UsageTool): string =>
  `usage-swatch usage-swatch-tool-${String(usageToolSlot(tool))}`;

// The selection with `tool` shown or hidden, keeping `usageTools` order.
export const withTool = (
  selection: UsageSelection,
  tool: UsageTool,
  shown: boolean,
): UsageSelection => ({
  ...selection,
  tools: usageTools.filter((each) =>
    each === tool ? shown : selection.tools.includes(each),
  ),
});

// One selected tool's cohort, read with the same filters as the others.
export const cohortOf = (
  { workflow, model, effort }: UsageSelection,
  tool: UsageTool,
): TokenIndexCohort => ({ tool, workflow, model, effort });

// The selection's identity: answers read for another one never join it.
export const selectionKey = (selection: UsageSelection, days: number) =>
  JSON.stringify({ ...selection, days });

// The models and efforts any selected tool offers, each once, in tool order.
export function unionOptions(
  answers: readonly TokenIndexAnswer[],
): TokenIndexAnswer["options"] {
  const models = new Map<string, UsageModel>();
  const efforts = new Set<string>();
  for (const { options } of answers) {
    for (const model of options.models)
      if (!models.has(model.id)) models.set(model.id, model);
    for (const effort of options.efforts) efforts.add(effort);
  }
  return { models: [...models.values()], efforts: [...efforts] };
}

// The selection with a model or effort no selected tool offers reset to the
// broad option; the selection itself when it needs no reset.
export function offeredSelection(
  selection: UsageSelection,
  { models, efforts }: TokenIndexAnswer["options"],
): UsageSelection {
  const model = models.some(({ id }) => id === selection.model)
    ? selection.model
    : null;
  const effort =
    selection.effort !== null && efforts.includes(selection.effort)
      ? selection.effort
      : null;
  return model === selection.model && effort === selection.effort
    ? selection
    : { ...selection, model, effort };
}
