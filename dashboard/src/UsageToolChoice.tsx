// System settings → Usage's tool selection: Codex, Claude Code or both, each
// an independent checkbox named with its trace's colour (`./usageComparison.ts`).
import {
  usageToolName,
  usageToolSwatch,
  type UsageSelection,
} from "./usageComparison.ts";
import { usageTools, type UsageTool } from "./usageTokenIndex.ts";

export function UsageToolChoice({
  tools,
  onChoose,
}: {
  readonly tools: UsageSelection["tools"];
  readonly onChoose: (tool: UsageTool, shown: boolean) => void;
}) {
  return (
    <fieldset className="usage-tools-choice">
      <legend>Tools</legend>
      {usageTools.map((tool) => (
        <label key={tool}>
          <input
            type="checkbox"
            checked={tools.includes(tool)}
            onChange={(event) => {
              onChoose(tool, event.target.checked);
            }}
          />
          <i className={usageToolSwatch(tool)} />
          {usageToolName(tool)}
        </label>
      ))}
    </fieldset>
  );
}
