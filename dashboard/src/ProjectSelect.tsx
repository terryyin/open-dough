import { useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import type { PublishedSource } from "./publishedSource.ts";
import { useProjects } from "./projectList.tsx";
import "./project-select.css";

// Shared with page-wide project arrow navigation so native radios and the
// shortcut recognize the same control group.
export const projectRadioName = "project";

// Compact project control at the banner's wrap width (`banner.css`); page-wide
// arrow cycling focuses this when it is the shown project control.
export const projectCompactSelectClass = "project-title-select";

// Which project this dashboard observes, chosen from the configured list.
// Selecting one is the only effect this control has: what happens when the
// selection changes belongs to the caller, not here. Wide layouts use the
// tab-shaped radios; at the wrap width the compact button opens a listbox so
// touch and keyboard (including Escape) share one accessible pattern. The
// selected control is also the banner's project name.
export function ProjectSelect({
  source,
  onSelect,
}: {
  readonly source: PublishedSource;
  readonly onSelect: (next: PublishedSource) => void;
}) {
  const projects = useProjects();
  return (
    <>
      <div className="project-select" role="radiogroup" aria-label="Project">
        {projects.map((option) => (
          <label key={option.id} className="project-choice">
            <input
              type="radio"
              name={projectRadioName}
              value={option.id}
              checked={source.id === option.id}
              onChange={() => {
                onSelect(option);
              }}
            />
            <span>{option.label}</span>
          </label>
        ))}
      </div>
      <ProjectCompactSelect source={source} onSelect={onSelect} />
    </>
  );
}

function ProjectCompactSelect({
  source,
  onSelect,
}: {
  readonly source: PublishedSource;
  readonly onSelect: (next: PublishedSource) => void;
}) {
  const projects = useProjects();
  const listId = useId();
  const root = useRef<HTMLDivElement>(null);
  const button = useRef<HTMLButtonElement>(null);
  const list = useRef<HTMLUListElement>(null);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(source.id);

  useEffect(() => {
    if (!open) {
      setActive(source.id);
    }
  }, [open, source.id]);

  useLayoutEffect(() => {
    if (open) {
      list.current?.focus();
    }
  }, [open]);

  const dismiss = () => {
    setOpen(false);
    button.current?.focus();
  };

  useEffect(() => {
    if (!open) return;
    const onPointer = (event: PointerEvent) => {
      if (
        event.target instanceof Node &&
        root.current?.contains(event.target)
      ) {
        return;
      }
      dismiss();
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      event.preventDefault();
      event.stopPropagation();
      dismiss();
    };
    window.addEventListener("pointerdown", onPointer);
    window.addEventListener("keydown", onKey, true);
    return () => {
      window.removeEventListener("pointerdown", onPointer);
      window.removeEventListener("keydown", onKey, true);
    };
  }, [open]);

  const choose = (id: string) => {
    const next = projects.find((option) => option.id === id);
    dismiss();
    if (next !== undefined && next.id !== source.id) onSelect(next);
  };

  const moveActive = (step: number) => {
    const index = Math.max(
      0,
      projects.findIndex((option) => option.id === active),
    );
    const next =
      projects[(index + step + projects.length) % projects.length]?.id ??
      source.id;
    setActive(next);
  };

  return (
    <div className={projectCompactSelectClass} ref={root}>
      <button
        type="button"
        ref={button}
        className="project-title-select-button"
        data-project-id={source.id}
        aria-label="Project"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        onClick={() => {
          setOpen((was) => !was);
        }}
        onKeyDown={(event) => {
          if (
            (event.key === "ArrowDown" ||
              event.key === "Enter" ||
              event.key === " ") &&
            !open
          ) {
            event.preventDefault();
            setOpen(true);
            setActive(source.id);
          }
        }}
      >
        {source.label}
      </button>
      {open ? (
        <ul
          id={listId}
          ref={list}
          className="project-title-select-list"
          role="listbox"
          aria-label="Project"
          tabIndex={-1}
          aria-activedescendant={`${listId}-${active}`}
          onKeyDown={(event) => {
            if (event.key === "ArrowDown") {
              event.preventDefault();
              moveActive(1);
              return;
            }
            if (event.key === "ArrowUp") {
              event.preventDefault();
              moveActive(-1);
              return;
            }
            if (event.key === "Home") {
              event.preventDefault();
              setActive(projects[0]?.id ?? source.id);
              return;
            }
            if (event.key === "End") {
              event.preventDefault();
              setActive(projects[projects.length - 1]?.id ?? source.id);
              return;
            }
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault();
              choose(active);
            }
          }}
        >
          {projects.map((option) => (
            <li
              key={option.id}
              id={`${listId}-${option.id}`}
              role="option"
              aria-selected={option.id === source.id}
              data-active={option.id === active ? "true" : undefined}
              onClick={() => {
                choose(option.id);
              }}
            >
              {option.label}
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
