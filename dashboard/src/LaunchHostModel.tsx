// A launch dialog's Host and Model, one row when it has room and stacked in
// that reading order when it does not. Changing the host returns the model to
// the host's own setting. A host with a model catalog offers its transient
// native choices.

import { LaunchReasoningEffort } from "./LaunchReasoningEffort.tsx";
import type { LaunchHostOptions } from "./launchHostOptions.ts";
import { hostName, launchHosts } from "./sessionCapabilities.ts";
import { hostDescription, type HostDescription } from "./hostDescription.ts";
import { type AgentLaunchRequest, type LaunchModel } from "./agentLaunch.ts";

function chosenFeedback(
  item: LaunchHostOptions["models"][number] | undefined,
  modelCatalog: NonNullable<HostDescription["modelCatalog"]>,
): string {
  if (item === undefined) return modelCatalog.unavailable;
  return [item.description, modelCatalog.chosenNote]
    .filter((part) => part !== undefined && part !== "")
    .join(" ");
}

export function LaunchHostModel({
  id,
  host,
  onHost,
  model,
  onModel,
  catalog,
  effort,
  onEffort,
}: {
  readonly catalog: {
    options?: LaunchHostOptions;
    error?: string;
    retry: () => void;
  };
  readonly effort: string;
  readonly onEffort: (effort: string) => void;
  readonly id: string;
  readonly host: AgentLaunchRequest["host"];
  // Absent when the host is fixed.
  readonly onHost: ((host: AgentLaunchRequest["host"]) => void) | undefined;
  readonly model: LaunchModel;
  readonly onModel: (model: LaunchModel) => void;
}) {
  const modelCatalog = hostDescription(host).modelCatalog;
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
            onEffort("");
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
          aria-describedby={
            modelCatalog === undefined ? undefined : `${id}-model-feedback`
          }
          onChange={(event) => {
            onModel(event.target.value);
          }}
        >
          <option value="">
            {modelCatalog?.defaultLabel ??
              `Default (your ${hostName(host)} setting)`}
          </option>
          {modelCatalog !== undefined &&
            model !== "" &&
            !catalog.options?.models.some((item) => item.model === model) && (
              <option value={model}>{model} (unavailable)</option>
            )}
          {modelCatalog !== undefined &&
            catalog.options?.models.map((item) => (
              <option key={item.model} value={item.model}>
                {item.name}
              </option>
            ))}
          {Object.entries(hostDescription(host).models).map(
            ([alias, { name }]) => (
              <option key={alias} value={alias}>
                {name}
              </option>
            ),
          )}
        </select>
        {modelCatalog !== undefined && (
          <div id={`${id}-model-feedback`} className="quiet" aria-live="polite">
            <p>
              {catalog.error ??
                (catalog.options === undefined
                  ? modelCatalog.reading
                  : model === ""
                    ? modelCatalog.defaultNote
                    : chosenFeedback(
                        catalog.options.models.find(
                          (item) => item.model === model,
                        ),
                        modelCatalog,
                      ))}
            </p>
            {catalog.error && (
              <button type="button" onClick={catalog.retry}>
                Retry model choices
              </button>
            )}
          </div>
        )}
      </div>
      {host === "codex" && (
        <LaunchReasoningEffort
          id={id}
          model={model}
          effort={effort}
          onEffort={onEffort}
          options={catalog.options}
          error={catalog.error}
        />
      )}
    </div>
  );
}
