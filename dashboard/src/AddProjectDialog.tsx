import { useEffect, useId, useRef, useState } from "react";
import type { AddedProject } from "./projectConfiguration.ts";
import {
  githubRepository,
  ProjectInputProblem,
  type ProjectField,
} from "./projectInput.ts";
import type { ProjectSettingsSource } from "./projectSettingsSource.ts";
import "./launch-dialog.css";
import "./frame-controls.css";

type Problem = { readonly error: string; readonly field?: ProjectField };

export function AddProjectDialog({
  add,
  onAdded,
  onClose,
}: {
  readonly add: ProjectSettingsSource["add"];
  readonly onAdded: (answer: AddedProject) => void;
  readonly onClose: (added: boolean) => void;
}) {
  const id = useId();
  const dialog = useRef<HTMLDialogElement>(null);
  const urlField = useRef<HTMLInputElement>(null);
  const [githubUrl, setGitHubUrl] = useState("");
  const [localPath, setLocalPath] = useState("");
  const editedPath = useRef(false);
  const [submitting, setSubmitting] = useState(false);
  const [problem, setProblem] = useState<Problem | undefined>();
  const added = useRef(false);
  useEffect(() => {
    dialog.current?.showModal();
    urlField.current?.focus();
  }, []);
  const submit = async () => {
    setSubmitting(true);
    setProblem(undefined);
    try {
      const answer = await add({ githubUrl, localPath });
      added.current = true;
      onAdded(answer);
      dialog.current?.close();
    } catch (error) {
      setProblem(
        error instanceof ProjectInputProblem
          ? { error: error.message, field: error.field }
          : { error: error instanceof Error ? error.message : String(error) },
      );
    } finally {
      setSubmitting(false);
    }
  };
  const feedbackFor = (field: ProjectField) =>
    problem?.field === field ? `${id}-problem` : undefined;
  return (
    <dialog
      ref={dialog}
      className="launch-dialog project-dialog"
      aria-labelledby={`${id}-heading`}
      onCancel={(event) => {
        if (submitting) event.preventDefault();
      }}
      onClose={() => {
        onClose(added.current);
      }}
    >
      <form
        onSubmit={(event) => {
          event.preventDefault();
          if (!submitting) void submit();
        }}
      >
        <fieldset disabled={submitting} className="launch-dialog-submission">
          <div className="launch-dialog-body">
            <h2 id={`${id}-heading`}>Add project</h2>
            <p>Choose a GitHub repository and its execution checkout.</p>
            <label htmlFor={`${id}-url`}>GitHub URL</label>
            <input
              ref={urlField}
              id={`${id}-url`}
              className="frame-input"
              value={githubUrl}
              required
              autoComplete="off"
              aria-invalid={feedbackFor("githubUrl") !== undefined}
              aria-describedby={feedbackFor("githubUrl")}
              onChange={(event) => {
                const value = event.target.value;
                setGitHubUrl(value);
                if (!editedPath.current) {
                  const repository = githubRepository(value);
                  setLocalPath(
                    repository === undefined
                      ? ""
                      : `~/git/${repository.split("/")[1]}`,
                  );
                }
              }}
            />
            <label htmlFor={`${id}-path`}>Execution checkout</label>
            <input
              id={`${id}-path`}
              className="frame-input"
              value={localPath}
              required
              autoComplete="off"
              aria-invalid={feedbackFor("localPath") !== undefined}
              aria-describedby={feedbackFor("localPath")}
              onChange={(event) => {
                editedPath.current = true;
                setLocalPath(event.target.value);
              }}
            />
            {problem !== undefined && (
              <p id={`${id}-problem`} role="alert">
                {problem.error}
              </p>
            )}
          </div>
          <div className="project-dialog-actions">
            <button
              type="button"
              className="frame-button"
              onClick={() => dialog.current?.close()}
            >
              Cancel
            </button>
            <button type="submit" className="frame-button frame-button-primary">
              {submitting ? "Adding…" : "Add"}
            </button>
          </div>
        </fieldset>
      </form>
    </dialog>
  );
}
