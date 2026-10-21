// System settings → Feedback maintenance: the standing authorization for the
// dashboard to start the maintain-feedback-cycle session when it is due, off
// by default, with the host and model choices of the launch dialog
// (`./LaunchHostModel.tsx`). The setting itself is described in
// `../FEEDBACK-MAINTENANCE.md`.
import { useEffect, useState } from "react";
import { LaunchHostModel } from "./LaunchHostModel.tsx";
import {
  feedbackMaintenanceEndpoint,
  feedbackMaintenanceRemoveEndpoint,
  feedbackMaintenanceRepository,
  feedbackMaintenanceSaveEndpoint,
  feedbackMaintenanceSettingSchema,
  type FeedbackMaintenanceChoice,
  type FeedbackMaintenanceSetting,
} from "./feedbackMaintenanceSetting.ts";
import { hostName } from "./sessionCapabilities.ts";
import { launchModelName, type HostIdentity } from "./hostDescription.ts";
import { localSettingRequest } from "./localSettingRequest.ts";
import { useProjects } from "./projectList.tsx";
import { useLaunchHostOptions } from "./useLaunchHostOptions.ts";
import { launchSettingsBlocked } from "./useLaunchSettings.ts";
import { useLocalSetting } from "./useLocalSetting.ts";
import "./frame-controls.css";
import "./launch-dialog.css";

const updateFailure =
  "The feedback maintenance setting could not be updated. Retry the operation.";

async function settingRequest(
  endpoint: string,
  body?: FeedbackMaintenanceChoice | Record<string, never>,
): Promise<FeedbackMaintenanceSetting> {
  const setting = feedbackMaintenanceSettingSchema.safeParse(
    await localSettingRequest(endpoint, body, updateFailure),
  );
  if (!setting.success)
    throw new Error(
      "The feedback maintenance setting could not be read. Retry the operation.",
    );
  return setting.data;
}

function readSetting(): Promise<FeedbackMaintenanceSetting> {
  return settingRequest(feedbackMaintenanceEndpoint);
}

function describe(setting: FeedbackMaintenanceSetting): string {
  if (!setting.enabled) return "Off";
  const { host, model, effort } = setting.choice;
  return [
    `On, ${hostName(host)}`,
    model === undefined
      ? `default model (your ${hostName(host)} setting)`
      : launchModelName(host, model),
    ...(effort === undefined ? [] : [`${effort} effort`]),
  ].join(", ");
}

export function FeedbackMaintenanceSettings() {
  const projects = useProjects();
  const {
    value: setting,
    problem,
    busy,
    retryRead,
    change,
  } = useLocalSetting(
    readSetting,
    "The feedback maintenance setting could not be read.",
    updateFailure,
  );
  const [host, setHost] = useState<HostIdentity>("claude");
  const [model, setModel] = useState("");
  const [effort, setEffort] = useState("");
  // Each answered On setting shows its own choices.
  useEffect(() => {
    if (setting?.enabled) {
      setHost(setting.choice.host);
      setModel(setting.choice.model ?? "");
      setEffort(setting.choice.effort ?? "");
    }
  }, [setting]);
  const catalog = useLaunchHostOptions(
    projects.find(
      (project) => project.repository === feedbackMaintenanceRepository,
    )?.id ?? "",
    host,
  );
  function update(turnOff: boolean) {
    void change(() =>
      turnOff
        ? settingRequest(feedbackMaintenanceRemoveEndpoint, {})
        : settingRequest(feedbackMaintenanceSaveEndpoint, {
            host,
            ...(model === "" ? {} : { model }),
            ...(host !== "codex" || effort === "" ? {} : { effort }),
          }),
    );
  }
  const enabled = setting?.enabled === true;
  return (
    <section
      className="settings-section"
      aria-labelledby="settings-feedback-maintenance-heading"
    >
      <div className="settings-section-heading">
        <h2 id="settings-feedback-maintenance-heading">Feedback maintenance</h2>
      </div>
      <p role="status" className="openai-status">
        Feedback maintenance:{" "}
        {setting === undefined ? "Status unavailable" : describe(setting)}
      </p>
      <p className="settings-note">
        When on, this dashboard starts the feedback maintenance cycle in Open
        Dough's local folder on this machine once the due date the cycle
        publishes in its watch list is reached, on the host and model chosen
        here: one session per due date, listed in Sessions as Feedback
        maintenance. A quiet completion marks it done without a notification; a
        report that needs you notifies once and keeps it listed.
      </p>
      <form
        className="openai-settings-form"
        onSubmit={(event) => {
          event.preventDefault();
          update(false);
        }}
      >
        <fieldset className="feedback-maintenance-choices" disabled={busy}>
          <LaunchHostModel
            id="feedback-maintenance"
            host={host}
            onHost={setHost}
            model={model}
            onModel={setModel}
            effort={effort}
            onEffort={setEffort}
            catalog={catalog}
          />
        </fieldset>
        <div className="openai-settings-actions">
          <button
            type="submit"
            className="frame-button frame-button-primary"
            disabled={
              busy ||
              launchSettingsBlocked(host, model, effort, catalog.options)
            }
          >
            {enabled ? "Save feedback maintenance" : "Turn on"}
          </button>
          {(enabled || problem) && (
            <button
              type="button"
              className="frame-button"
              disabled={busy}
              onClick={() => {
                update(true);
              }}
            >
              Turn off
            </button>
          )}
        </div>
      </form>
      {busy && (
        <p role="status" className="settings-note">
          Updating feedback maintenance…
        </p>
      )}
      {problem && (
        <div role="alert" className="settings-problem">
          {problem}{" "}
          <button
            type="button"
            className="frame-button"
            disabled={busy}
            onClick={retryRead}
          >
            Retry status
          </button>
        </div>
      )}
    </section>
  );
}
