import type { LaunchHostOptions } from "./launchHostOptions.ts";
import { effortBlocked, launchEfforts } from "./launchEffort.ts";
export function LaunchReasoningEffort({
  id,
  model,
  effort,
  onEffort,
  options,
  error,
}: {
  readonly id: string;
  readonly model: string;
  readonly effort: string;
  readonly onEffort: (effort: string) => void;
  readonly options: LaunchHostOptions | undefined;
  readonly error: string | undefined;
}) {
  const { efforts, known } = launchEfforts(options, model);
  const blocked = effortBlocked(options, model, effort);
  return (
    <div className="launch-dialog-field">
      <label htmlFor={`${id}-effort`}>Reasoning effort</label>
      <select
        id={`${id}-effort`}
        className="frame-input"
        value={effort}
        aria-describedby={`${id}-effort-feedback`}
        aria-invalid={blocked || undefined}
        onChange={(event) => {
          onEffort(event.target.value);
        }}
      >
        <option value="">Use Codex setting</option>
        {effort !== "" && !efforts.some((item) => item.effort === effort) && (
          <option value={effort}>{effort} (unavailable)</option>
        )}
        {efforts.map((item) => (
          <option key={item.effort} value={item.effort}>
            {item.effort} — {item.description}
          </option>
        ))}
      </select>
      <p id={`${id}-effort-feedback`} className="quiet" aria-live="polite">
        {blocked
          ? "This reasoning effort cannot be verified for this model. Choose a supported effort or use the Codex setting."
          : (error ??
            (options === undefined
              ? "Reading Codex reasoning efforts… You can use the Codex setting."
              : effort === ""
                ? "Codex resolves its configured reasoning effort in the launch workspace."
                : known
                  ? efforts.find((item) => item.effort === effort)?.description
                  : "Codex resolves the configured model in the launch workspace. This explicit effort will be verified there before initial input."))}
      </p>
    </div>
  );
}
