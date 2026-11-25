// The banner's Recent stories control (`./recentStories.ts` shapes the list):
// a bookmark that shows whether a story is selected and offers the whole
// project or a recent story. A story is revealed in the current perspective:
// Development via the story-reference journey and Intent at the story heading.

import { useContext, useEffect, useId, useRef, useState } from "react";
import { Bookmark } from "lucide-react";
import { FrameTooltip, Icon } from "./Icon.tsx";
import type { DashboardPerspective } from "./dashboardRouteUrl.ts";
import { useClearProjectIntentSelection } from "./intentWorkspaceSelection.ts";
import { useChooseProjectCi } from "./pageIntentMode.tsx";
import { storyShown } from "./pageEntries.ts";
import { keepInView, startIsReadable } from "./pageMovement.ts";
import { useVisibleProjects } from "./projectList.tsx";
import { RecentStoriesChoices } from "./RecentStoriesChoices.tsx";
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
  const clearProjectPath = useClearProjectIntentSelection();
  const chooseProjectCi = useChooseProjectCi(project);
  const recent = useRecentStories();
  const selection = useContext(StorySelectionOnPage);
  const navigation = useContext(StoryNavigationOnPage);
  const projects = useVisibleProjects();
  const choicesId = useId();
  const root = useRef<HTMLDivElement>(null);
  const button = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);
  const label = recentStoriesLabel(selected);

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
        (entry.project !== project ||
          (heading !== undefined && !startIsReadable(heading))) &&
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
        aria-controls={open ? choicesId : undefined}
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
        <RecentStoriesChoices
          id={choicesId}
          selected={selected}
          recent={recent}
          projects={projects}
          chooseStory={choose}
          chooseProject={() => {
            if (perspective === "intent") {
              chooseProjectCi();
              clearProjectPath?.();
            }
            selection?.clear();
            dismiss();
          }}
        />
      ) : null}
    </div>
  );
}
