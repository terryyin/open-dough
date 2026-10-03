import { useRef, useState } from "react";
import { Plus } from "lucide-react";
import { Icon } from "./Icon.tsx";
import type { PublishedSource } from "./publishedSource.ts";
import { useReplaceProjects } from "./projectList.tsx";
import { AddProjectDialog } from "./AddProjectDialog.tsx";
import "./frame-controls.css";
import "./project-configuration.css";

export function AddProject({
  onSelect,
  autoFocus = false,
}: {
  readonly onSelect?: (source: PublishedSource) => void;
  readonly autoFocus?: boolean;
}) {
  const launcher = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);
  const replaceProjects = useReplaceProjects();
  return (
    <>
      <button
        type="button"
        ref={launcher}
        className="frame-button frame-button-primary"
        aria-label="Add project"
        autoFocus={autoFocus}
        onClick={() => {
          setOpen(true);
        }}
      >
        <Icon icon={Plus} />
        <span>
          Add<span className="project-action-target"> project</span>
        </span>
      </button>
      {open && (
        <AddProjectDialog
          onAdded={({ projects, project }) => {
            replaceProjects(projects);
            onSelect?.(project);
          }}
          onClose={(added) => {
            setOpen(false);
            if (!added) launcher.current?.focus();
          }}
        />
      )}
    </>
  );
}
