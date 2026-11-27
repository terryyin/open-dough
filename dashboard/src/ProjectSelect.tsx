import { useLayoutEffect, useRef } from "react";
import { CompactSelect } from "./CompactSelect.tsx";
import type { PublishedSource } from "./publishedSource.ts";
import { useVisibleProjects } from "./projectList.tsx";
import "./project-select.css";

// Shared with page-wide project arrow navigation so native radios and the
// shortcut recognize the same control group.
export const projectRadioName = "project";

// Compact project control shown when the tabs do not fit (`banner.css`);
// page-wide arrow cycling focuses this when it is the shown project control.
export const projectCompactSelectClass = "project-title-select";

// Which project this dashboard observes, chosen from the configured list.
// Selecting one is the only effect this control has: what happens when the
// selection changes belongs to the caller, not here. The tab-shaped radios
// stay on one line beside the other banner controls; whenever that line has
// no room for all of them, the compact button takes their place and opens a
// listbox so touch and keyboard (including Escape) share one accessible
// pattern. The selected control is also the banner's project name.
export function ProjectSelect({
  source,
  onSelect,
}: {
  readonly source: PublishedSource;
  readonly onSelect: (next: PublishedSource) => void;
}) {
  const projects = useVisibleProjects();
  const { slot, tabs } = useTabsFit();
  return (
    <div className="project-slot" ref={slot}>
      <div className="project-tabs">
        <div
          className="project-select"
          role="radiogroup"
          aria-label="Project"
          ref={tabs}
        >
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
      </div>
      <ProjectCompactSelect source={source} onSelect={onSelect} />
    </div>
  );
}

// Marks the slot `data-compact` while the one-line tab list is wider than the
// banner leaves for it. The tabs keep their one-line width while hidden, so the
// mark follows the banner's room, the project names, and the font both ways.
// It is written in the observer's own callback, before the next paint, so a
// resize never shows tabs past the window for a frame.
function useTabsFit() {
  const slot = useRef<HTMLDivElement>(null);
  const tabs = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    const room = slot.current;
    const list = tabs.current;
    if (!room || !list) return;
    const measure = () => {
      room.toggleAttribute(
        "data-compact",
        list.getBoundingClientRect().width >
          room.getBoundingClientRect().width + 0.5,
      );
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(room);
    observer.observe(list);
    return () => {
      observer.disconnect();
    };
  }, []);
  return { slot, tabs };
}

// The project catalog offered through the shared compact select; the root
// and button classes and the project ID stay what banner styles and page-wide
// arrows read.
function ProjectCompactSelect({
  source,
  onSelect,
}: {
  readonly source: PublishedSource;
  readonly onSelect: (next: PublishedSource) => void;
}) {
  const projects = useVisibleProjects();
  return (
    <CompactSelect
      name="Project"
      options={projects}
      value={source.id}
      current={source.label}
      onCommit={onSelect}
      rootClassName={projectCompactSelectClass}
      buttonClassName="project-title-select-button"
      listClassName="project-title-select-list"
      buttonData={{ "data-project-id": source.id }}
    />
  );
}
