import { useEffect, useRef, useState } from "react";
import {
  openAIConfigurationEndpoint,
  openAIRemoveEndpoint,
  openAISaveEndpoint,
  type OpenAIConfigurationStatus,
} from "./openAIConfiguration.ts";
import "./frame-controls.css";
import { localSettingRequest } from "./localSettingRequest.ts";
import { useLocalSetting } from "./useLocalSetting.ts";

const updateFailure =
  "OpenAI configuration could not be updated. Retry the operation.";

async function configurationRequest(
  endpoint: string,
  body?: { readonly apiKey?: string },
): Promise<OpenAIConfigurationStatus> {
  const answer = await localSettingRequest(endpoint, body, updateFailure);
  if (
    typeof answer !== "object" ||
    answer === null ||
    !("configured" in answer) ||
    typeof answer.configured !== "boolean"
  )
    throw new Error(
      "OpenAI configuration could not be read. Retry the operation.",
    );
  return { configured: answer.configured };
}

function readConfiguration(): Promise<OpenAIConfigurationStatus> {
  return configurationRequest(openAIConfigurationEndpoint);
}

export function OpenAISettings() {
  const {
    value: status,
    problem,
    reportProblem,
    busy,
    retryRead,
    change,
  } = useLocalSetting(
    readConfiguration,
    "OpenAI configuration could not be read.",
    updateFailure,
  );
  const [apiKey, setAPIKey] = useState("");
  const input = useRef<HTMLInputElement>(null);
  const focusAfterSave = useRef(false);
  useEffect(() => {
    if (!busy && focusAfterSave.current) {
      focusAfterSave.current = false;
      input.current?.focus();
    }
  }, [busy]);
  async function update(remove: boolean) {
    if (busy) return;
    if (!remove && !apiKey.trim()) {
      reportProblem(
        "Enter an API key before saving. The previous key was kept.",
      );
      input.current?.focus();
      return;
    }
    await change(async () => {
      const answer = await (remove
        ? configurationRequest(openAIRemoveEndpoint, {})
        : configurationRequest(openAISaveEndpoint, { apiKey }));
      setAPIKey("");
      focusAfterSave.current = true;
      return answer;
    });
  }
  return (
    <section
      className="settings-section"
      aria-labelledby="settings-openai-heading"
    >
      <div className="settings-section-heading">
        <h2 id="settings-openai-heading">OpenAI</h2>
      </div>
      <p role="status" className="openai-status">
        API key:{" "}
        {status === undefined
          ? "Status unavailable"
          : status.configured
            ? "Configured"
            : "Not configured"}
      </p>
      <p className="settings-note">
        A saved key configures general OpenAI access on this machine. Saving
        does not verify it with OpenAI or make a paid request.
      </p>
      <form
        className="openai-settings-form"
        onSubmit={(event) => {
          event.preventDefault();
          void update(false);
        }}
      >
        <label htmlFor="openai-api-key">API key</label>
        <input
          ref={input}
          id="openai-api-key"
          className="frame-input"
          type="password"
          autoComplete="off"
          value={apiKey}
          disabled={busy}
          onChange={(event) => {
            setAPIKey(event.target.value);
          }}
        />
        <div className="openai-settings-actions">
          <button
            type="submit"
            className="frame-button frame-button-primary"
            disabled={busy}
          >
            Save API key
          </button>
          {(status?.configured || problem) && (
            <button
              type="button"
              className="frame-button"
              disabled={busy}
              onClick={() => {
                void update(true);
              }}
            >
              Remove API key
            </button>
          )}
        </div>
      </form>
      {busy && (
        <p role="status" className="settings-note">
          Updating OpenAI configuration…
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
