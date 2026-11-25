// One Intent selection for a reading scope of the project's Intent workspace
// (`./pageIntentReading.tsx`), Project Intent's or the selected story's: a
// configured location, a folder under one, or a file (with an optional case
// target Purpose positions on). Kept with that scope's reading place, so it
// outlasts leaving Intent and a new revision, and starts empty for each
// project. Choosing Whole project clears its path to show project CI.
// The location tree and Purpose read and set it
// through this owner; Project Intent's candidate-record view shares it when
// opening a recorded file; directly activating Project Intent's CI status tab
// clears it to return home (`./IntentPage.tsx`). A missing `scope` with a
// non-empty path is a file, so candidate opens stay `{ path }` / `{ path,
// caseTarget }`.

import {
  createContext,
  createElement,
  useContext,
  useState,
  type ReactNode,
} from "react";
import { useKeptReading } from "./pageIntentReading.tsx";
import { useStoryReviewOpening } from "./pageStoryReviewOpening.tsx";
import type { SelectedStory } from "./pageStorySelection.tsx";

export type IntentSelectionScope = "location" | "folder" | "file";

export type IntentSelection = {
  readonly path: string;
  readonly scope?: IntentSelectionScope;
  readonly caseTarget?: string;
};

/** What the selection names; empty path is none. */
export function selectionScope(
  selection: IntentSelection,
): "none" | IntentSelectionScope {
  if (selection.path === "") return "none";
  return selection.scope ?? "file";
}

/** Open a configured Intent file from a candidate-record entry. */
export type OpenCandidateLocation = (
  selection: IntentSelection,
  entrySlug: string,
) => void;

export type IntentWorkspaceSelection = {
  readonly selection: IntentSelection;
  readonly setSelection: (next: IntentSelection) => void;
  // Back to nothing selected, Intent's CI status homepage; nothing changes
  // when nothing is selected.
  readonly clearSelection: () => void;
};

const emptySelection: IntentSelection = { path: "" };

const ProjectIntentSelection = createContext<
  IntentWorkspaceSelection | undefined
>(undefined);

export function ProjectIntentSelectionProvider({
  project,
  children,
}: {
  readonly project: string;
  readonly children: ReactNode;
}) {
  const [kept, keep] = useState({ project, selection: emptySelection });
  if (kept.project !== project) keep({ project, selection: emptySelection });
  return createElement(ProjectIntentSelection.Provider, {
    value: {
      selection: kept.project === project ? kept.selection : emptySelection,
      setSelection: (selection) => {
        keep({ project, selection });
      },
      clearSelection: () => {
        if (kept.selection.path !== "")
          keep({ project, selection: emptySelection });
      },
    },
    children,
  });
}

export function useClearProjectIntentSelection() {
  return useContext(ProjectIntentSelection)?.clearSelection;
}

const IntentSelectionContext = createContext<
  IntentWorkspaceSelection | undefined
>(undefined);

export function ProjectIntentWorkspaceSelectionProvider({
  children,
}: {
  readonly children: ReactNode;
}) {
  const project = useContext(ProjectIntentSelection);
  if (project === undefined)
    return createElement(IntentWorkspaceSelectionProvider, { children });
  return createElement(IntentSelectionContext.Provider, {
    value: project,
    children,
  });
}

export function IntentWorkspaceSelectionProvider({
  children,
  story,
}: {
  readonly children: ReactNode;
  readonly story?: SelectedStory | undefined;
}) {
  const [reading, keepReading] = useKeptReading("selection", () => ({
    story,
    selection: emptySelection,
  }));
  const [storySelections, keepStorySelections] = useKeptReading(
    "storySelections",
    () => new Map<string, IntentSelection>(),
  );
  const opening = useStoryReviewOpening(story?.project);
  const [opened, setOpened] = useState<number>();
  // Normal navigation still keeps the current reading. A card opening
  // restores only a file chosen while its own story was selected.
  const selection =
    reading.story === story ? reading.selection : emptySelection;
  const showSelection = (next: IntentSelection) => {
    keepReading({ story, selection: next });
  };
  if (
    opening !== undefined &&
    opening.identity === story?.identity &&
    opening.sequence !== opened
  ) {
    setOpened(opening.sequence);
    showSelection(storySelections.get(opening.identity) ?? emptySelection);
  } else if (reading.story !== story) {
    showSelection(emptySelection);
  }
  const setSelection = (next: IntentSelection) => {
    showSelection(next);
    if (story === undefined) return;
    keepStorySelections((current) => {
      const kept = new Map(current);
      if (selectionScope(next) === "file") kept.set(story.identity, next);
      else kept.delete(story.identity);
      return kept;
    });
  };
  return createElement(
    IntentSelectionContext.Provider,
    {
      value: {
        selection,
        setSelection,
        clearSelection: () => {
          if (selection.path !== "") showSelection(emptySelection);
        },
      },
    },
    children,
  );
}

export function useIntentWorkspaceSelection(): IntentWorkspaceSelection {
  const owned = useContext(IntentSelectionContext);
  if (owned === undefined) {
    throw new Error(
      "Intent selection is used outside the project's Intent workspace.",
    );
  }
  return owned;
}
