// The banner's Recent stories control (`./recentStories.ts` shapes the list):
// a bookmark that shows whether a story is selected, and a popover listing
// recent selections (ADR 0008). Choosing a row, or clicking the button while
// the selected story's start is out of view, reveals it in the current
// perspective: Development via the story-reference journey and Intent at
// the story heading.

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
import { useReturnToVisitedStory } from "./intentStoryTabs.tsx";
import { storyShown } from "./pageEntries.ts";
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
import { intentStoryHeading } from "./storyCardFocus.ts";
import { StoryNavigationOnPage } from "./storyNavigation.tsx";
import { storyReferenceChoices } from "./StoryReferenceNotice.tsx";
import "./recent-stories.css";

function recentStoriesLabel(selected: SelectedStory | undefined): string {
  return selected === undefined
    ? "Recent stories, no story selected"
    : `Recent stories, ${selected.identity} selected`;
}

export function RecentStories({
  perspective,
  project,
  onSelectProject,
}: {
  readonly perspective: DashboardPerspective;
  readonly project: string;
  readonly onSelectProject: (next: PublishedSource) => void;
}) {
  const selected = useSelectedStory();
  const recent = useRecentStories();
  const selection = useContext(StorySelectionOnPage);
  const navigation = useContext(StoryNavigationOnPage);
  const returnToVisitedStory = useReturnToVisitedStory();
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
        ?.focus({ preventScroll: true });
    }
  }, [open]);

  const dismiss = () => {
    setOpen(false);
    button.current?.focus({ preventScroll: true });
  };

  const revealInIntent = (entry: SelectedStory, chosen = false) => {
    const sameProject = entry.project === project;
    if (!sameProject || chosen) {
      const destination = projects.find((shown) => shown.id === entry.project);
      if (destination === undefined && !sameProject) return false;
      if (destination !== undefined) onSelectProject(destination);
    }
    if (
      sameProject &&
      sameSelectedStory(selected, entry) &&
      intentStoryHeading(entry) === undefined &&
      !returnToVisitedStory()
    ) {
      return false;
    }
    requestAnimationFrame(() => {
      const heading = intentStoryHeading(entry);
      if (heading !== undefined) keepInView(heading);
    });
    return true;
  };

  const choose = (entry: SelectedStory) => {
    selection?.select(entry);
    if (perspective === "intent") {
      revealInIntent(entry, true);
    } else {
      navigation?.follow(entry);
    }
    dismiss();
  };

  const revealSelected = (entry: SelectedStory) => {
    if (perspective === "intent") {
      const heading = intentStoryHeading(entry);
      return (
        (heading === undefined || !startIsReadable(heading)) &&
        revealInIntent(entry)
      );
    }
    const card = entry.project === project ? storyShown(entry.identity) : null;
    if (
      navigation === undefined ||
      (card !== null && startIsReadable(card)) ||
      sameSelectedStory(navigation.unavailable, entry)
    ) {
      return false;
    }
    navigation.follow(entry);
    return true;
  };

  const onButtonClick = () => {
    if (open) {
      dismiss();
      return;
    }
    if (selected !== undefined && revealSelected(selected)) return;
    setOpen(true);
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
      {...storyReferenceChoices}
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
