import { useState } from "react";
import "./frame-controls.css";
import { useSavedTerminalTheme } from "./savedTerminalTheme.ts";
import {
  ansiColorNames,
  isTerminalThemeId,
  terminalPalette,
  terminalThemeIds,
  terminalThemes,
  type TerminalThemeId,
} from "./terminalThemes.ts";

function colorLabel(name: string): string {
  return name.startsWith("bright")
    ? `bright ${name.slice("bright".length).toLowerCase()}`
    : name;
}

function TerminalThemeSample({ theme }: { readonly theme: TerminalThemeId }) {
  const palette = terminalPalette(theme);
  return (
    <figure className="terminal-theme-sample">
      <figcaption>Sample: {terminalThemes[theme].label}</figcaption>
      <pre
        style={{ color: palette.foreground, background: palette.background }}
      >
        {"$ npm test\nAll checks passed.\n"}
        {[ansiColorNames.slice(0, 8), ansiColorNames.slice(8)].map(
          (row, index) => (
            <span key={index}>
              {row.map((name, column) => (
                <span key={name}>
                  {column > 0 && " "}
                  <span style={{ color: palette[name] }}>
                    {colorLabel(name)}
                  </span>
                </span>
              ))}
              {"\n"}
            </span>
          ),
        )}
      </pre>
    </figure>
  );
}

export function TerminalThemeSettings() {
  const { saved, readProblem, reread, save } = useSavedTerminalTheme();
  // The choice being saved; the selector and sample show it until it settles.
  const [saving, setSaving] = useState<TerminalThemeId>();
  const [failed, setFailed] = useState<{
    readonly theme: TerminalThemeId;
    readonly message: string;
  }>();
  const reading = saved === undefined && readProblem === undefined;
  const shown = saving ?? saved ?? "default";
  async function choose(theme: TerminalThemeId) {
    if (saving !== undefined) return;
    setSaving(theme);
    setFailed(undefined);
    try {
      await save(theme);
    } catch (error) {
      setFailed({
        theme,
        message:
          error instanceof Error
            ? error.message
            : "The terminal theme could not be saved. Retry the operation; the previous theme was kept.",
      });
    } finally {
      setSaving(undefined);
    }
  }
  return (
    <section
      className="settings-section"
      aria-labelledby="settings-terminal-theme-heading"
    >
      <div className="settings-section-heading">
        <h2 id="settings-terminal-theme-heading">Terminal theme</h2>
      </div>
      <p className="settings-note">
        Choose the colours embedded terminals use on this machine. A choice is
        saved as soon as it is made.
      </p>
      <div className="terminal-theme-settings-choice">
        <label htmlFor="terminal-theme">Terminal theme</label>
        <select
          id="terminal-theme"
          className="frame-input"
          value={shown}
          disabled={reading || saving !== undefined}
          onChange={(event) => {
            if (isTerminalThemeId(event.target.value))
              void choose(event.target.value);
          }}
        >
          {terminalThemeIds.map((id) => (
            <option key={id} value={id}>
              {terminalThemes[id].label}
            </option>
          ))}
        </select>
      </div>
      {reading && (
        <p role="status" className="settings-note">
          Reading the saved terminal theme…
        </p>
      )}
      {saving !== undefined && (
        <p role="status" className="settings-note">
          Saving terminal theme…
        </p>
      )}
      <TerminalThemeSample theme={shown} />
      {failed && (
        <div role="alert" className="settings-problem">
          {failed.message}{" "}
          <button
            type="button"
            className="frame-button"
            disabled={saving !== undefined}
            onClick={() => {
              void choose(failed.theme);
            }}
          >
            Retry
          </button>
        </div>
      )}
      {!failed && readProblem && (
        <div role="alert" className="settings-problem">
          {readProblem}{" "}
          <button type="button" className="frame-button" onClick={reread}>
            Retry
          </button>
        </div>
      )}
    </section>
  );
}
