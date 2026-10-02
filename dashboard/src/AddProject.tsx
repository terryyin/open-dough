import { useRef, useState } from "react";
import type { PublishedSource } from "./publishedSource.ts";
import { useReplaceProjects } from "./projectList.tsx";
import { AddProjectDialog } from "./AddProjectDialog.tsx";
import "./project-configuration.css";

export function AddProject({
  onSelect,
}: {
  readonly onSelect?: (source: PublishedSource) => void;
}) {
  const launcher = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);
  const replaceProjects = useReplaceProjects();
  return (
    <>
      <button
        type="button"
        ref={launcher}
        className="add-project"
        onClick={() => {
          setOpen(true);
        }}
      >
        Add project
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
