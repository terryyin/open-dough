import { useLayoutEffect, useRef } from "react";
import type { PublishedSource } from "./publishedSource.ts";
import { useVisibleProjects } from "./projectList.tsx";
import "./project-select.css";

// Tab-shaped radios show the visible projects when they fit on the banner.
// A compact select shows the same choices at narrower widths.
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
                name="project"
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
      <select
        className="project-title-select"
        aria-label="Project"
        value={source.id}
        onChange={(event) => {
          const option = projects.find(
            ({ id }) => id === event.currentTarget.value,
          );
          if (option !== undefined) onSelect(option);
        }}
      >
        {projects.map(({ id, label }) => (
          <option key={id} value={id}>
            {label}
          </option>
        ))}
      </select>
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
