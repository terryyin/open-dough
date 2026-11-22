// The banner's Recent stories control (`./recentStories.ts` shapes the list):
// a bookmark that shows whether a story is selected, and a popover listing
// recent selections (ADR 0008). Choosing a row, or clicking the button while
// the selected story's start is out of view, selects and reveals it in the
// current perspective: Development via the story-reference journey, Intent via
// chooseScope("story") and the Intent view start (`intentHomeMarks`).

import {
  useContext,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { Bookmark } from "lucide-react";
import { FrameTooltip, Icon } from "./Icon.tsx";
import type { DashboardPerspective } from "./dashboardRouteUrl.ts";
import { useIntentScopeChooser } from "./intentStoryTabs.tsx";
import { keepInView, startIsReadable } from "./pageMovement.ts";
import { projectLabel, useVisibleProjects } from "./projectList.tsx";
import {
  sameSelectedStory,
  StorySelectionOnPage,
  useRecentStories,
  useSelectedStory,
  type SelectedStory,
} from "./pageStorySelection.tsx";
import type { PublishedSource } from "./publishedSource.ts";
import { intentStoryViewStart, storyCard } from "./storyCardFocus.ts";
import { StoryNavigationOnPage } from "./storyNavigation.tsx";
import "./recent-stories.css";

function recentStoriesLabel(selected: SelectedStory | undefined): string {
  return selected === undefined
    ? "Recent stories, no story selected"
    : `Recent stories, ${selected.identity} selected`;
}

export function RecentStories({
  perspective,
  onSelectProject,
}: {
  readonly perspective: DashboardPerspective;
  readonly onSelectProject: (next: PublishedSource) => void;
}) {
  const selected = useSelectedStory();
  const recent = useRecentStories();
  const selection = useContext(StorySelectionOnPage);
  const navigation = useContext(StoryNavigationOnPage);
  const chooseIntentScope = useIntentScopeChooser();
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

  const bringIntentStartIntoView = () => {
    requestAnimationFrame(() => {
      const start = intentStoryViewStart();
      if (start !== undefined) keepInView(start);
    });
  };

  // Intent: select, keep the perspective, choose the story scope, and bring
  // the Intent view start into view. A new selection already opens on story.
  const revealInIntent = (entry: SelectedStory) => {
    const same = sameSelectedStory(selected, entry);
    selection?.select(entry);
    const project = projects.find((shown) => shown.id === entry.project);
    if (project !== undefined) onSelectProject(project);
    if (same) chooseIntentScope?.("story");
    bringIntentStartIntoView();
  };

  const choose = (entry: SelectedStory) => {
    if (perspective === "intent") {
      revealInIntent(entry);
    } else {
      selection?.select(entry);
      navigation?.follow(entry);
    }
    dismiss();
  };

  // When the selected story's start is not in the region's readingBounds
  // (same rule keepInView uses for readable), return via choose and leave the
  // popover closed; otherwise toggle the list.
  const selectedStartOutOfView = () => {
    if (selected === undefined) return false;
    if (perspective === "intent") {
      const start = intentStoryViewStart();
      return start === undefined || !startIsReadable(start);
    }
    const card = storyCard(selected.identity);
    return card === undefined || !startIsReadable(card);
  };

  const onButtonClick = () => {
    if (selected !== undefined && selectedStartOutOfView()) {
      choose(selected);
      return;
    }
    setOpen((was) => !was);
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
        onClick={onButtonClick}
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
                    onClick={() => {
                      choose(entry);
                    }}
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
