import { useState } from "react";
import "./frame-controls.css";
import { useSavedSyntaxStyling } from "./savedSyntaxStyling.ts";
import {
  isSyntaxStylingId,
  syntaxStylingChoices,
  syntaxStylingIds,
  type SyntaxStylingId,
} from "./syntaxStylingChoices.ts";

export function SyntaxStylingSettings() {
  const { saved, readProblem, reread, save } = useSavedSyntaxStyling();
  // The choice being saved; the selector shows it until it settles.
  const [saving, setSaving] = useState<SyntaxStylingId>();
  const [failed, setFailed] = useState<{
    readonly styling: SyntaxStylingId;
    readonly message: string;
  }>();
  const reading = saved === undefined && readProblem === undefined;
  const shown = saving ?? saved ?? "default";
  async function choose(styling: SyntaxStylingId) {
    if (saving !== undefined) return;
    setSaving(styling);
    setFailed(undefined);
    try {
      await save(styling);
    } catch (error) {
      setFailed({
        styling,
        message:
          error instanceof Error
            ? error.message
            : "The syntax styling could not be saved. Retry the operation; the previous setting was kept.",
      });
    } finally {
      setSaving(undefined);
    }
  }
  return (
    <section
      className="settings-section"
      aria-labelledby="settings-syntax-styling-heading"
    >
      <div className="settings-section-heading">
        <h2 id="settings-syntax-styling-heading">Syntax styling</h2>
      </div>
      <p className="settings-note">
        Choose whether Intent source reading and story-review diffs use shared
        syntax colours on this machine. Neither surface has its own palette or
        off switch. A choice is saved as soon as it is made.
      </p>
      <div className="settings-choice">
        <label htmlFor="syntax-styling">Syntax styling</label>
        <select
          id="syntax-styling"
          className="frame-input"
          value={shown}
          disabled={reading || saving !== undefined}
          onChange={(event) => {
            if (isSyntaxStylingId(event.target.value))
              void choose(event.target.value);
          }}
        >
          {syntaxStylingIds.map((id) => (
            <option key={id} value={id}>
              {syntaxStylingChoices[id].label}
            </option>
          ))}
        </select>
      </div>
      {reading && (
        <p role="status" className="settings-note">
          Reading the saved syntax styling…
        </p>
      )}
      {saving !== undefined && (
        <p role="status" className="settings-note">
          Saving syntax styling…
        </p>
      )}
      {failed && (
        <div role="alert" className="settings-problem">
          {failed.message}{" "}
          <button
            type="button"
            className="frame-button"
            disabled={saving !== undefined}
            onClick={() => {
              void choose(failed.styling);
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
