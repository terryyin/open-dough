// A launch dialog's Host and Model, one row when it has room and stacked in
// that reading order when it does not. Changing the host returns the model to
// Default, the host's own setting; only Claude Code offers named models.

import { hostName, launchHosts } from "./sessionCapabilities.ts";
import {
  launchModels,
  type AgentLaunchRequest,
  type LaunchModel,
} from "./agentLaunch.ts";

export function LaunchHostModel({
  id,
  host,
  onHost,
  model,
  onModel,
}: {
  readonly id: string;
  readonly host: AgentLaunchRequest["host"];
  // Absent when the host is fixed.
  readonly onHost: ((host: AgentLaunchRequest["host"]) => void) | undefined;
  readonly model: LaunchModel | "";
  readonly onModel: (model: LaunchModel | "") => void;
}) {
  return (
    <div className="launch-dialog-row">
      <div className="launch-dialog-field">
        <label htmlFor={`${id}-host`}>Host</label>
        <select
          id={`${id}-host`}
          value={host}
          disabled={onHost === undefined}
          onChange={(event) => {
            onHost?.(event.target.value as AgentLaunchRequest["host"]);
            onModel("");
          }}
        >
          {launchHosts.map((choice) => (
            <option key={choice} value={choice}>
              {hostName(choice)}
            </option>
          ))}
        </select>
      </div>
      <div className="launch-dialog-field">
        <label htmlFor={`${id}-model`}>Model</label>
        <select
          id={`${id}-model`}
          value={model}
          onChange={(event) => {
            onModel(event.target.value as LaunchModel | "");
          }}
        >
          <option value="">Default (your {hostName(host)} setting)</option>
          {(host === "claude" ? Object.entries(launchModels) : []).map(
            ([alias, { name }]) => (
              <option key={alias} value={alias}>
                {name}
              </option>
            ),
          )}
        </select>
      </div>
    </div>
  );
}
