// The page's one selected story per project: disposable UI state
// (ADR 0008), not part of the URL. Columns, Recently done, and Intent share
// it through this owner (`./PageFrame.tsx`), in the style of page sessions
// and story navigation. Empty-area card clicks and Inspect (or a Recently
// done selection control) toggle it; reveal-and-select from story navigation
// sets it without toggling.

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

// Stable mutators; selection identity is read from StorySelectionState.
export type PageStorySelection = {
  // Selects `identity` for `project`, or clears when it is already selected.
  readonly toggle: (project: string, identity: string) => void;
  // Selects `identity` for `project` without toggling off.
  readonly select: (project: string, identity: string) => void;
};

export const StorySelectionOnPage = createContext<
  PageStorySelection | undefined
>(undefined);

// Per-project selected identities; changes force consumers to re-render.
const StorySelectionState = createContext<Readonly<Record<string, string>>>({});

export function StorySelectionProvider({
  children,
}: {
  readonly children: ReactNode;
}) {
  const [byProject, setByProject] = useState<Readonly<Record<string, string>>>(
    {},
  );
  const toggle = useCallback((project: string, identity: string) => {
    setByProject((current) => {
      if (current[project] === identity) {
        return Object.fromEntries(
          Object.entries(current).filter(([key]) => key !== project),
        );
      }
      return { ...current, [project]: identity };
    });
  }, []);
  const select = useCallback((project: string, identity: string) => {
    setByProject((current) =>
      current[project] === identity
        ? current
        : { ...current, [project]: identity },
    );
  }, []);
  const api = useMemo(() => ({ toggle, select }), [toggle, select]);
  return (
    <StorySelectionOnPage value={api}>
      <StorySelectionState value={byProject}>{children}</StorySelectionState>
    </StorySelectionOnPage>
  );
}

// The selected story for one project on the page.
export function useStorySelection(project: string) {
  const api = useContext(StorySelectionOnPage);
  const byProject = useContext(StorySelectionState);
  if (api === undefined) {
    throw new Error("Story selection is used outside the page's PageFrame.");
  }
  const selectedIdentity = byProject[project];
  const toggle = useCallback(
    (identity: string) => {
      api.toggle(project, identity);
    },
    [api, project],
  );
  const select = useCallback(
    (identity: string) => {
      api.select(project, identity);
    },
    [api, project],
  );
  return useMemo(
    () => ({ selectedIdentity, toggle, select }),
    [selectedIdentity, toggle, select],
  );
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

export function isStoryCardControl(
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
