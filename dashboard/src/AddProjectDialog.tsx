import { useEffect, useId, useRef, useState } from "react";
import { projectAddEndpoint } from "./projectConfiguration.ts";
import { githubRepository, type ProjectField } from "./projectInput.ts";
import type { PublishedSource } from "./publishedSource.ts";
import "./launch-dialog.css";

type AddedProject = {
  readonly project: PublishedSource;
  readonly projects: readonly PublishedSource[];
};
type Problem = { readonly error: string; readonly field?: ProjectField };

export function AddProjectDialog({
  onAdded,
  onClose,
}: {
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
      const response = await fetch(projectAddEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ githubUrl, localPath }),
      });
      const answer = (await response.json()) as AddedProject & Problem;
      if (!response.ok) {
        setProblem(answer);
        return;
      }
      added.current = true;
      onAdded(answer);
      dialog.current?.close();
    } catch {
      setProblem({
        error:
          "The project could not be added. Check the local dashboard server and try again.",
      });
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
            <p>Choose a GitHub repository and its checkout on this machine.</p>
            <label htmlFor={`${id}-url`}>GitHub URL</label>
            <input
              ref={urlField}
              id={`${id}-url`}
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
            <label htmlFor={`${id}-path`}>Local path</label>
            <input
              id={`${id}-path`}
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
            <button type="button" onClick={() => dialog.current?.close()}>
              Cancel
            </button>
            <button type="submit">{submitting ? "Adding…" : "Add"}</button>
          </div>
        </fieldset>
      </form>
    </dialog>
  );
}
