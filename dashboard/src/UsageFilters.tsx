// System settings → Usage's filters shared by every selected tool
// (`./usageComparison.ts`): one launch workflow (Execution, Refinement or Ad
// hoc), and Model and Effort, each the broad option or one a selected tool's
// observed tasks offer.
import { launchKindName } from "./launchWorkflow.ts";
import type { UsageSelection } from "./usageComparison.ts";
import {
  usageWorkflowOf,
  usageWorkflows,
  type TokenIndexAnswer,
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
  selection,
  options,
  onChoose,
}: {
  readonly selection: UsageSelection;
  // Undefined until the first answer arrives.
  readonly options: TokenIndexAnswer["options"] | undefined;
  readonly onChoose: (selection: UsageSelection) => void;
}) {
  const specific = (value: string) => (value === broad ? null : value);
  return (
    <>
      <Filter
        name="Launch workflow"
        value={selection.workflow}
        choices={usageWorkflows.map((workflow) => ({
          value: workflow,
          label: launchKindName(workflow),
        }))}
        onChoose={(workflow) => {
          onChoose({
            ...selection,
            workflow: usageWorkflowOf(workflow) ?? selection.workflow,
          });
        }}
      />
      <Filter
        name="Model"
        value={selection.model ?? broad}
        choices={[
          { value: broad, label: "All models" },
          ...(options?.models ?? []).map(({ id, name }) => ({
            value: id,
            label: name,
          })),
        ]}
        onChoose={(model) => {
          onChoose({ ...selection, model: specific(model) });
        }}
      />
      <Filter
        name="Effort"
        value={selection.effort ?? broad}
        choices={[
          { value: broad, label: "Any effort" },
          ...(options?.efforts ?? []).map((effort) => ({
            value: effort,
            label: effort,
          })),
        ]}
        onChoose={(effort) => {
          onChoose({ ...selection, effort: specific(effort) });
        }}
      />
    </>
  );
}
