import { useEffect, useId, useRef, useState } from "react";
import type { PublishedSource } from "./publishedSource.ts";
import { projectRemoveEndpoint } from "./projectConfiguration.ts";
import { useProjects, useReplaceProjects } from "./projectList.tsx";

export function RemoveProject({
  source,
  selectedId,
  onSelect,
}: {
  readonly source: PublishedSource;
  readonly selectedId: string | undefined;
  readonly onSelect: (source: PublishedSource) => void;
}) {
  const launcher = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);
  const projects = useProjects();
  const replaceProjects = useReplaceProjects();
  return (
    <>
      <button
        type="button"
        className="remove-project"
        aria-label={`Remove project ${source.label}`}
        ref={launcher}
        onClick={() => {
          setOpen(true);
        }}
      >
        Remove<span className="project-action-target"> project</span>
      </button>
      {open && (
        <RemoveProjectDialog
          source={source}
          onClose={() => {
            setOpen(false);
            launcher.current?.focus();
          }}
          onRemoved={(saved) => {
            setOpen(false);
            const index = projects.findIndex(
              (project) => project.id === source.id,
            );
            const next = saved[index] ?? saved[0];
            replaceProjects(saved);
            if (next && source.id === selectedId) onSelect(next);
            requestAnimationFrame(() => {
              const destination = document.querySelector<HTMLButtonElement>(
                "button[aria-label='Add project']",
              );
              destination?.focus();
            });
          }}
        />
      )}
    </>
  );
}

function RemoveProjectDialog({
  source,
  onClose,
  onRemoved,
}: {
  readonly source: PublishedSource;
  readonly onClose: () => void;
  readonly onRemoved: (projects: readonly PublishedSource[]) => void;
}) {
  const id = useId();
  const dialog = useRef<HTMLDialogElement>(null);
  const cancel = useRef<HTMLButtonElement>(null);
  const confirm = useRef<HTMLButtonElement>(null);
  const removed = useRef(false);
  const notified = useRef(false);
  const [submitting, setSubmitting] = useState(false);
  const [problem, setProblem] = useState<string>();
  useEffect(() => {
    dialog.current?.showModal();
    cancel.current?.focus();
  }, []);
  const dismiss = () => {
    dialog.current?.close();
    if (!notified.current && !removed.current) {
      notified.current = true;
      onClose();
    }
  };
  const submit = async () => {
    setSubmitting(true);
    setProblem(undefined);
    try {
      const response = await fetch(projectRemoveEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: source.id }),
      });
      const answer = (await response.json()) as {
        projects: readonly PublishedSource[];
        error?: string;
      };
      if (!response.ok) {
        setProblem(answer.error ?? "The project could not be removed.");
        return;
      }
      removed.current = true;
      dialog.current?.close();
      onRemoved(answer.projects);
    } catch {
      setProblem(
        "The project could not be removed. Check the local dashboard server and try again.",
      );
    } finally {
      setSubmitting(false);
    }
  };
  return (
    <dialog
      ref={dialog}
      className="launch-dialog project-dialog"
      aria-labelledby={`${id}-heading`}
      onKeyDown={(event) => {
        if (event.key !== "Tab" || submitting) return;
        const destination =
          event.shiftKey && document.activeElement === cancel.current
            ? confirm.current
            : !event.shiftKey && document.activeElement === confirm.current
              ? cancel.current
              : undefined;
        if (destination) {
          event.preventDefault();
          destination.focus();
        }
      }}
      onCancel={(event) => {
        event.preventDefault();
        if (!submitting) dismiss();
      }}
      onClose={dismiss}
    >
      <form
        onSubmit={(event) => {
          event.preventDefault();
          if (!submitting) void submit();
        }}
      >
        <fieldset disabled={submitting} className="launch-dialog-submission">
          <div className="launch-dialog-body">
            <h2 id={`${id}-heading`}>Remove {source.label}?</h2>
            <p>Remove {source.label} from this dashboard's project list?</p>
            <p>
              Nothing on disk or on GitHub changes. The checkout, session
              records and running sessions stay as they are.
            </p>
            {problem && <p role="alert">{problem}</p>}
          </div>
          <div className="project-dialog-actions">
            <button ref={cancel} type="button" onClick={dismiss}>
              Cancel
            </button>
            <button ref={confirm} type="submit">
              {submitting ? "Removing…" : "Remove"}
            </button>
          </div>
        </fieldset>
      </form>
    </dialog>
  );
}
