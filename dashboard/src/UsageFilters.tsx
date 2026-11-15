// System settings → Usage's cohort filters (`./usageTokenIndex.ts`): one
// tool (Codex or Claude Code), one launch workflow (Execution, Refinement or
// Ad hoc), and Model and Effort, each the broad option or one the observed
// tasks offer.
import { hostDescriptions } from "./hostDescription.ts";
import { launchKindName } from "./launchWorkflow.ts";
import {
  usageToolOf,
  usageTools,
  usageWorkflowOf,
  usageWorkflows,
  type TokenIndexAnswer,
  type TokenIndexCohort,
} from "./usageTokenIndex.ts";

type Choice = { readonly value: string; readonly label: string };

// A select's empty value is its broad option.
const broad = "";

function Filter({
  name,
  value,
  choices,
  onChoose,
}: {
  readonly name: string;
  readonly value: string;
  readonly choices: readonly Choice[];
  readonly onChoose: (value: string) => void;
}) {
  return (
    <label>
      {name}
      <select
        className="frame-input"
        value={value}
        onChange={(event) => {
          onChoose(event.target.value);
        }}
      >
        {choices.map((choice) => (
          <option key={choice.value} value={choice.value}>
            {choice.label}
          </option>
        ))}
      </select>
    </label>
  );
}

export function UsageFilters({
  cohort,
  options,
  onChoose,
}: {
  readonly cohort: TokenIndexCohort;
  // Undefined until the first answer arrives.
  readonly options: TokenIndexAnswer["options"] | undefined;
  readonly onChoose: (cohort: TokenIndexCohort) => void;
}) {
  const specific = (value: string) => (value === broad ? null : value);
  return (
    <>
      <Filter
        name="Tool"
        value={cohort.tool}
        choices={usageTools.map((tool) => ({
          value: tool,
          label: hostDescriptions[tool].name,
        }))}
        onChoose={(tool) => {
          onChoose({ ...cohort, tool: usageToolOf(tool) ?? cohort.tool });
        }}
      />
      <Filter
        name="Launch workflow"
        value={cohort.workflow}
        choices={usageWorkflows.map((workflow) => ({
          value: workflow,
          label: launchKindName(workflow),
        }))}
        onChoose={(workflow) => {
          onChoose({
            ...cohort,
            workflow: usageWorkflowOf(workflow) ?? cohort.workflow,
          });
        }}
      />
      <Filter
        name="Model"
        value={cohort.model ?? broad}
        choices={[
          { value: broad, label: "All models" },
          ...(options?.models ?? []).map(({ id, name }) => ({
            value: id,
            label: name,
          })),
        ]}
        onChoose={(model) => {
          onChoose({ ...cohort, model: specific(model) });
        }}
      />
      <Filter
        name="Effort"
        value={cohort.effort ?? broad}
        choices={[
          { value: broad, label: "Any effort" },
          ...(options?.efforts ?? []).map((effort) => ({
            value: effort,
            label: effort,
          })),
        ]}
        onChoose={(effort) => {
          onChoose({ ...cohort, effort: specific(effort) });
        }}
      />
    </>
  );
}
