import type { AgentLaunchRequest } from "./agentLaunch.ts";
import type { LaunchHostOptions } from "./launchHostOptions.ts";
import {
  cursorNeedsSpecificModel,
  effortBlocked,
  launchEfforts,
} from "./launchEffort.ts";
import { hostName } from "./sessionCapabilities.ts";

export function LaunchReasoningEffort({
  id,
  host,
  model,
  effort,
  onEffort,
  options,
  error,
}: {
  readonly id: string;
  readonly host: AgentLaunchRequest["host"];
  readonly model: string;
  readonly effort: string;
  readonly onEffort: (effort: string) => void;
  readonly options: LaunchHostOptions | undefined;
  readonly error: string | undefined;
}) {
  const { efforts, known } = launchEfforts(options, model);
  const needsSpecificModel =
    host === "cursor" && cursorNeedsSpecificModel(model);
  const disabled =
    host === "cursor" && (needsSpecificModel || !known || efforts.length === 0);
  const disabledHint = needsSpecificModel
    ? "Choose a specific model to select reasoning effort."
    : disabled && known
      ? "This model does not offer reasoning effort choices."
      : undefined;
  const blocked = effortBlocked(options, model, effort, host);
  const hasEmptyEffort = efforts.some((item) => item.effort === "");
  const setting =
    host === "cursor" ? "your Cursor setting" : "the Codex setting";
  const emptyLabel =
    host === "cursor"
      ? model === ""
        ? "Use your Cursor setting"
        : "Choose a listed effort"
      : "Use Codex setting";
  return (
    <div className="launch-dialog-field">
      <label htmlFor={`${id}-effort`}>Reasoning effort</label>
      <select
        id={`${id}-effort`}
        className="frame-input"
        value={effort}
        disabled={disabled}
        aria-describedby={`${id}-effort-feedback`}
        aria-invalid={blocked || undefined}
        onChange={(event) => {
          onEffort(event.target.value);
        }}
      >
        {!hasEmptyEffort && <option value="">{emptyLabel}</option>}
        {effort !== "" && !efforts.some((item) => item.effort === effort) && (
          <option value={effort}>{effort} (unavailable)</option>
        )}
        {efforts.map((item) => (
          <option
            key={item.effort === "" ? "listed" : item.effort}
            value={item.effort}
          >
            {item.effort === ""
              ? item.description
              : `${item.effort} — ${item.description}`}
          </option>
        ))}
      </select>
      <p id={`${id}-effort-feedback`} className="quiet" aria-live="polite">
        {disabledHint ??
          (blocked
            ? `This reasoning effort cannot be verified for this model. Choose a supported effort or use ${setting}.`
            : (error ??
              (options === undefined
                ? `Reading ${hostName(host)} reasoning efforts… You can use ${setting}.`
                : effort === ""
                  ? host === "cursor"
                    ? model === ""
                      ? "Cursor starts with your current Cursor model setting."
                      : hasEmptyEffort
                        ? efforts.find((item) => item.effort === "")
                            ?.description
                        : "Choose a listed reasoning effort for this model."
                    : "Codex resolves its configured reasoning effort in the launch workspace."
                  : known
                    ? efforts.find((item) => item.effort === effort)
                        ?.description
                    : `${hostName(host)} resolves the configured model in the launch workspace. This explicit effort will be verified there before initial input.`)))}
      </p>
    </div>
  );
}
