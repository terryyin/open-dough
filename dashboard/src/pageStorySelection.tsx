// The page's one selected story: disposable UI state (ADR 0008), not part of
// the URL. PageFrame (`./PageFrame.tsx`) owns it, so the Side panel's
// openings set or clear it and its closes keep it (`./pageSidePanel.ts`);
// Columns, Recently done, and Intent read it through this owner. Clicking an
// empty area of a card toggles selection, and the selected card is highlighted.
// Inspection is a separate per-card state
// (`./pageStoryInspection.tsx`) that never changes the selection.

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type MouseEvent,
  type ReactNode,
} from "react";
import {
  readRecentStories,
  rememberKeptRecentStory,
  sameRecentStory,
} from "./recentStories.ts";

// The selected story names its project, since one page serves every project.
export type SelectedStory = {
  readonly project: string;
  readonly identity: string;
};

// Stable mutators; the selected story is read from StorySelectionState.
export type PageStorySelection = {
  // Selects the story, or clears when it is already selected.
  readonly toggle: (story: SelectedStory) => void;
  // Selects the story, keeping it when it is already selected.
  readonly select: (story: SelectedStory) => void;
  readonly clear: () => void;
};

export const StorySelectionOnPage = createContext<
  PageStorySelection | undefined
>(undefined);

// The selected story; changes force consumers to re-render.
const StorySelectionState = createContext<SelectedStory | undefined>(undefined);

// Most-recent-first history of selections (ADR 0008 Recent stories), kept in
// this browser's disposable storage so it survives a reload; clearing the
// selection leaves this list as it is. The Selected story itself stays page
// state.
const RecentStoriesState = createContext<readonly SelectedStory[]>([]);

// Whether a selection, if any, is this story of the same project.
export const sameSelectedStory = sameRecentStory;

function initialSelectedStory(): SelectedStory | undefined {
  const params = new URLSearchParams(window.location.search);
  const project = params.get("project"),
    identity = params.get("followUp");
  return project && identity && params.get("landing")
    ? { project, identity }
    : undefined;
}

// The page's selected story, its mutators, and Recent stories history, owned
// by PageFrame. Every selection goes through one state writer here.
export function usePageStorySelection() {
  const [selected, setSelected] = useState<SelectedStory | undefined>(
    initialSelectedStory,
  );
  const [recent, setRecent] = useState<readonly SelectedStory[]>(() => {
    const kept = readRecentStories();
    const initial = initialSelectedStory();
    return initial === undefined
      ? kept
      : rememberKeptRecentStory(kept, initial);
  });
  const selectedRef = useRef(selected);
  selectedRef.current = selected;
  const remember = useCallback((story: SelectedStory) => {
    setRecent((history) => rememberKeptRecentStory(history, story));
  }, []);
  const toggle = useCallback(
    (story: SelectedStory) => {
      if (sameSelectedStory(selectedRef.current, story)) {
        setSelected(undefined);
        return;
      }
      remember(story);
      setSelected(story);
    },
    [remember],
  );
  const select = useCallback(
    (story: SelectedStory) => {
      if (sameSelectedStory(selectedRef.current, story)) return;
      remember(story);
      setSelected(story);
    },
    [remember],
  );
  const clear = useCallback(() => {
    setSelected(undefined);
  }, []);
  const api = useMemo(
    () => ({ toggle, select, clear }),
    [toggle, select, clear],
  );
  return { selected, recent, api };
}

export function StorySelectionProvider({
  selection: { selected, recent, api },
  children,
}: {
  readonly selection: ReturnType<typeof usePageStorySelection>;
  readonly children: ReactNode;
}) {
  return (
    <StorySelectionOnPage value={api}>
      <StorySelectionState value={selected}>
        <RecentStoriesState value={recent}>{children}</RecentStoriesState>
      </StorySelectionState>
    </StorySelectionOnPage>
  );
}

// The page's Recent stories history, for the banner list.
export function useRecentStories() {
  return useContext(RecentStoriesState);
}

// The page's selected story, or none, for banner and other page-wide readers.
export function useSelectedStory() {
  return useContext(StorySelectionState);
}

// The selected story as one project reads it: none unless that project owns
// the page's selection. Toggling one of its stories moves the selection there.
// `selection` is the act of selecting: each new selection, even of a story
// selected before and cleared since, is a new value, so what a view chose
// for one selection is never kept for the next (`./pageIntentMode.tsx`,
// `./intentStoryTabs.tsx`).
export function useStorySelection(project: string) {
  const api = useContext(StorySelectionOnPage);
  const selected = useContext(StorySelectionState);
  if (api === undefined) {
    throw new Error("Story selection is used outside the page's PageFrame.");
  }
  const selection = selected?.project === project ? selected : undefined;
  const selectedIdentity = selection?.identity;
  const toggle = useCallback(
    (identity: string) => {
      api.toggle({ project, identity });
    },
    [api, project],
  );
  return useMemo(
    () => ({ selection, selectedIdentity, toggle }),
    [selection, selectedIdentity, toggle],
  );
}

// A card's click handler: an empty-area click toggles its story's selection.
export function toggleOnEmptyArea(onToggle: () => void) {
  return (event: MouseEvent<HTMLElement>) => {
    if (!isStoryCardControl(event.target, event.currentTarget, event)) {
      onToggle();
    }
  };
}

const storyCardControlSelector = [
  "a",
  "button",
  "input",
  "select",
  "textarea",
  "label",
  "details",
  "[role='button']",
  "[role='link']",
  "[role='menuitem']",
  ".session-entry",
].join(", ");

// Nested controls and the open detail are not empty area: buttons, links,
// inputs, session entries, disclosures (summary and opened content), and
// `.story-detail` content keep their own behavior and must not change
// selection. Disabled controls do not receive the event, so a point-in-bounds
// check covers them too.
const storyCardNonEmptyAreaSelector = [
  storyCardControlSelector,
  ".story-detail",
].join(", ");

function isStoryCardControl(
  target: EventTarget | null,
  card?: EventTarget | null,
  point?: { readonly clientX: number; readonly clientY: number },
): boolean {
  if (
    target instanceof Element &&
    target.closest(storyCardNonEmptyAreaSelector)
  ) {
    return true;
  }
  if (!(card instanceof Element) || point === undefined) return false;
  for (const control of card.querySelectorAll(storyCardNonEmptyAreaSelector)) {
    const rect = control.getBoundingClientRect();
    if (
      point.clientX >= rect.left &&
      point.clientX <= rect.right &&
      point.clientY >= rect.top &&
      point.clientY <= rect.bottom
    ) {
      return true;
    }
  }
  return false;
}
