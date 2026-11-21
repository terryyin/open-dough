import { useRef, useState } from "react";
import { Plus } from "lucide-react";
import { Icon } from "./Icon.tsx";
import type { PublishedSource } from "./publishedSource.ts";
import { useReplaceProjects } from "./projectList.tsx";
import { AddProjectDialog } from "./AddProjectDialog.tsx";
import type { ProjectSettingsSource } from "./projectSettingsSource.ts";
import "./frame-controls.css";
import "./project-configuration.css";

export function AddProject({
  add,
  onSelect,
  autoFocus = false,
}: {
  readonly add: ProjectSettingsSource["add"];
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
          add={add}
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
