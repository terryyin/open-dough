// The page's one selected story: disposable UI state (ADR 0008), not part of
// the URL. PageFrame (`./PageFrame.tsx`) owns it, so the Side panel's
// openings and closes set and clear it (`./pageSidePanel.ts`); Columns,
// Recently done, and Intent read it through this owner. Each card's Select
// story control and empty-area click toggle it, and the selected card is
// highlighted. Inspection is a separate per-card state
// (`./pageStoryInspection.tsx`) that never changes the selection.

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type MouseEvent,
  type ReactNode,
} from "react";

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

const same = (a: SelectedStory | undefined, b: SelectedStory) =>
  a?.project === b.project && a.identity === b.identity;

// The page's selected story and its mutators, owned by PageFrame.
export function usePageStorySelection() {
  const [selected, setSelected] = useState<SelectedStory | undefined>();
  const toggle = useCallback((story: SelectedStory) => {
    setSelected((current) => (same(current, story) ? undefined : story));
  }, []);
  const select = useCallback((story: SelectedStory) => {
    setSelected((current) => (same(current, story) ? current : story));
  }, []);
  const clear = useCallback(() => {
    setSelected(undefined);
  }, []);
  const api = useMemo(
    () => ({ toggle, select, clear }),
    [toggle, select, clear],
  );
  return { selected, api };
}

export function StorySelectionProvider({
  selection: { selected, api },
  children,
}: {
  readonly selection: ReturnType<typeof usePageStorySelection>;
  readonly children: ReactNode;
}) {
  return (
    <StorySelectionOnPage value={api}>
      <StorySelectionState value={selected}>{children}</StorySelectionState>
    </StorySelectionOnPage>
  );
}

// The selected story as one project reads it: none unless that project owns
// the page's selection. Toggling one of its stories moves the selection there.
export function useStorySelection(project: string) {
  const api = useContext(StorySelectionOnPage);
  const selected = useContext(StorySelectionState);
  if (api === undefined) {
    throw new Error("Story selection is used outside the page's PageFrame.");
  }
  const selectedIdentity =
    selected?.project === project ? selected.identity : undefined;
  const toggle = useCallback(
    (identity: string) => {
      api.toggle({ project, identity });
    },
    [api, project],
  );
  return useMemo(
    () => ({ selectedIdentity, toggle }),
    [selectedIdentity, toggle],
  );
}

// A card's Select story control, pressed while its story is selected. It
// toggles the selection as an empty-area click on the card does.
export function SelectStory({
  selected,
  onToggle,
}: {
  readonly selected: boolean;
  readonly onToggle: () => void;
}) {
  return (
    <button
      type="button"
      className="select-story frame-disclosure-button"
      aria-pressed={selected}
      onClick={onToggle}
    >
      Select story
    </button>
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
