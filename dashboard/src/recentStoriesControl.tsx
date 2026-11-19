// The banner's Recent stories control (`./recentStories.ts` shapes the list):
// a bookmark that shows whether a story is selected, and a popover listing
// recent selections (ADR 0008). Choosing a row and reveal-on-click belong to
// later slices; this control only lists and dismisses.

import { useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import { Bookmark } from "lucide-react";
import { FrameTooltip, Icon } from "./Icon.tsx";
import { projectLabel, useVisibleProjects } from "./projectList.tsx";
import {
  sameSelectedStory,
  useRecentStories,
  useSelectedStory,
  type SelectedStory,
} from "./pageStorySelection.tsx";
import "./recent-stories.css";

function recentStoriesLabel(selected: SelectedStory | undefined): string {
  return selected === undefined
    ? "Recent stories, no story selected"
    : `Recent stories, ${selected.identity} selected`;
}

export function RecentStories() {
  const selected = useSelectedStory();
  const recent = useRecentStories();
  const projects = useVisibleProjects();
  const listId = useId();
  const root = useRef<HTMLDivElement>(null);
  const button = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);
  const label = recentStoriesLabel(selected);

  useLayoutEffect(() => {
    if (open) {
      root.current
        ?.querySelector<HTMLElement>(".recent-stories-popover")
        ?.focus();
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

  return (
    <div
      className="tooltip-control tooltip-center recent-stories-control"
      ref={root}
    >
      <button
        type="button"
        ref={button}
        className="icon-button"
        aria-label={label}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls={open ? listId : undefined}
        onClick={() => {
          setOpen((was) => !was);
        }}
      >
        {selected === undefined ? (
          <Icon icon={Bookmark} />
        ) : (
          <Bookmark
            className="icon"
            strokeWidth={2}
            fill="currentColor"
            aria-hidden="true"
            focusable="false"
          />
        )}
      </button>
      <FrameTooltip>{label}</FrameTooltip>
      {open ? (
        <div
          id={listId}
          className="recent-stories-popover"
          role="dialog"
          aria-label="Recent stories"
          tabIndex={-1}
        >
          {recent.length === 0 ? (
            <p className="recent-stories-empty">There are no recent stories.</p>
          ) : (
            <ul
              className="recent-stories-list"
              role="listbox"
              aria-label="Recent stories"
            >
              {recent.map((entry) => {
                const checked = sameSelectedStory(selected, entry);
                return (
                  <li
                    key={`${entry.project}:${entry.identity}`}
                    role="option"
                    aria-selected={checked}
                    className="recent-stories-row"
                    data-checked={checked ? "true" : undefined}
                  >
                    <span className="recent-stories-check" aria-hidden="true">
                      {checked ? "✓" : ""}
                    </span>
                    <span className="recent-stories-project">
                      {projectLabel(projects, entry.project)}
                    </span>
                    <span className="recent-stories-identity">
                      {entry.identity}
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      ) : null}
    </div>
  );
}
