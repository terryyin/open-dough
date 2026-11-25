import { useLayoutEffect, useRef, type ReactNode } from "react";
import {
  sameSelectedStory,
  type SelectedStory,
} from "./pageStorySelection.tsx";
import { projectLabel } from "./projectList.tsx";
import type { PublishedSource } from "./publishedSource.ts";

function ScopeChoice({
  current,
  choose,
  children,
}: {
  readonly current: boolean;
  readonly choose: () => void;
  readonly children: ReactNode;
}) {
  return (
    <button
      type="button"
      className="recent-stories-row"
      aria-current={current || undefined}
      onClick={choose}
    >
      <span className="recent-stories-check" aria-hidden="true">
        {current ? "✓" : ""}
      </span>
      {children}
    </button>
  );
}

export function RecentStoriesChoices({
  id,
  selected,
  recent,
  projects,
  chooseStory,
  chooseProject,
}: {
  readonly id: string;
  readonly selected: SelectedStory | undefined;
  readonly recent: readonly SelectedStory[];
  readonly projects: readonly PublishedSource[];
  readonly chooseStory: (story: SelectedStory) => void;
  readonly chooseProject: () => void;
}) {
  const dialog = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    dialog.current?.focus({ preventScroll: true });
  }, []);

  return (
    <div
      ref={dialog}
      id={id}
      className="recent-stories-popover"
      role="dialog"
      aria-label="Recent stories"
      tabIndex={-1}
    >
      <ScopeChoice current={selected === undefined} choose={chooseProject}>
        <span className="recent-stories-whole-project">Whole project</span>
      </ScopeChoice>
      {recent.length > 0 && (
        <ul className="recent-stories-list" aria-label="Recent stories">
          {recent.map((entry) => (
            <li key={`${entry.project}:${entry.identity}`}>
              <ScopeChoice
                current={sameSelectedStory(selected, entry)}
                choose={() => {
                  chooseStory(entry);
                }}
              >
                <span className="recent-stories-project">
                  {projectLabel(projects, entry.project)}
                </span>
                <span className="recent-stories-identity">
                  {entry.identity}
                </span>
              </ScopeChoice>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
