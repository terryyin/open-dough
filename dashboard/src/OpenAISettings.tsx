import { useEffect, useRef, useState } from "react";
import {
  openAIConfigurationEndpoint,
  openAIRemoveEndpoint,
  openAISaveEndpoint,
  type OpenAIConfigurationStatus,
} from "./openAIConfiguration.ts";
import "./frame-controls.css";

async function configurationRequest(
  endpoint: string,
  apiKey?: string,
): Promise<OpenAIConfigurationStatus> {
  const response = await fetch(
    endpoint,
    endpoint === openAIConfigurationEndpoint
      ? {}
      : {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(apiKey === undefined ? {} : { apiKey }),
        },
  );
  const answer: unknown = await response.json();
  if (!response.ok)
    throw new Error(
      typeof answer === "object" &&
        answer !== null &&
        "error" in answer &&
        typeof answer.error === "string"
        ? answer.error
        : "OpenAI configuration could not be updated. Retry the operation.",
    );
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

export function OpenAISettings() {
  const [status, setStatus] = useState<OpenAIConfigurationStatus>();
  const [apiKey, setAPIKey] = useState("");
  const [problem, setProblem] = useState<string>();
  const [busy, setBusy] = useState(false);
  const [retry, setRetry] = useState(0);
  const input = useRef<HTMLInputElement>(null);
  const focusAfterSave = useRef(false);
  const statusReadRevision = useRef(0);
  useEffect(() => {
    if (!busy && focusAfterSave.current) {
      focusAfterSave.current = false;
      input.current?.focus();
    }
  }, [busy]);
  useEffect(() => {
    let current = true;
    const revision = ++statusReadRevision.current;
    setProblem(undefined);
    void configurationRequest(openAIConfigurationEndpoint).then(
      (answer) => {
        if (current && revision === statusReadRevision.current)
          setStatus(answer);
      },
      (error: unknown) => {
        if (current && revision === statusReadRevision.current)
          setProblem(
            error instanceof Error
              ? error.message
              : "OpenAI configuration could not be read.",
          );
      },
    );
    return () => {
      current = false;
    };
  }, [retry]);
  async function update(remove: boolean) {
    if (busy) return;
    if (!remove && !apiKey.trim()) {
      setProblem("Enter an API key before saving. The previous key was kept.");
      input.current?.focus();
      return;
    }
    // The mutation owns subsequent feedback; an older read is only a snapshot.
    statusReadRevision.current += 1;
    setBusy(true);
    setProblem(undefined);
    try {
      setStatus(
        await configurationRequest(
          remove ? openAIRemoveEndpoint : openAISaveEndpoint,
          remove ? undefined : apiKey,
        ),
      );
      setAPIKey("");
      focusAfterSave.current = true;
    } catch (error) {
      setProblem(
        error instanceof Error
          ? error.message
          : "OpenAI configuration could not be updated. Retry the operation.",
      );
    } finally {
      setBusy(false);
    }
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
            onClick={() => {
              setRetry(retry + 1);
            }}
          >
            Retry status
          </button>
        </div>
      )}
    </section>
  );
}
