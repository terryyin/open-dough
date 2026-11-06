// The Intent reading place of the project the page shows: what is selected
// (`./intentWorkspaceSelection.ts`), the record entry to return to, the reveal
// round, Purpose/Proof choice (`./IntentFileReading.tsx`), the reading pane's
// scroll offset, and the tree's arrangement: the expanded location, each
// location's open folders (`./useLocationOpenFolders.ts`), the last reveal
// request, and **Selected story only** with the expansion it asked for
// (`./useIntentStoryTree.ts`). Disposable page state (ADR 0008), in memory
// only, kept by the page (`./PageFrame.tsx`) beside the chosen mode
// (`./pageIntentMode.tsx`) so it outlasts Intent's own mount: switching to
// Development and back restores it, and a project change starts that
// project's reading afresh. The arrangement belongs to the story selected
// while it was made: a story selected while Intent is hidden starts the tree
// afresh when Intent opens, while the selection and reading stay.
//
// Each piece is held by the component that uses it, seeded from the place
// when it mounts and written back once rendered (`useKeptReading`,
// `useKeptArrangement`), so the place changes no rendering of its own.

import {
  createContext,
  useContext,
  useEffect,
  useLayoutEffect,
  useState,
  type Dispatch,
  type ReactNode,
  type RefObject,
  type SetStateAction,
} from "react";

type Kept = Map<string, unknown>;

// One project's reading place on the page.
type Place = {
  readonly project: string;
  readonly reading: Kept;
  // The arrangement and the selected story it was made for.
  arrangement: Kept;
  arrangedFor: string | undefined;
  scrollTop: number;
};

const freshPlace = (project: string): Place => ({
  project,
  reading: new Map(),
  arrangement: new Map(),
  arrangedFor: undefined,
  scrollTop: 0,
});

const ReadingPlaceOnPage = createContext<Place | undefined>(undefined);

export function IntentReadingProvider({
  project,
  children,
}: {
  // The project the developer has chosen to show.
  readonly project: string;
  readonly children: ReactNode;
}) {
  const [place, setPlace] = useState(() => freshPlace(project));
  if (place.project !== project) setPlace(freshPlace(project));
  return <ReadingPlaceOnPage value={place}>{children}</ReadingPlaceOnPage>;
}

// The place as one mounted Intent reads it, its arrangement settled for the
// story selected when Intent opened.
type Mounted = {
  readonly place: Place;
  readonly arrangement: Kept;
};

const MountedPlace = createContext<Mounted | undefined>(undefined);

// Intent's mount of `project`'s reading place, with `story` the page's
// selected story. Mounted again for each project (`key`), so nothing one
// project kept is shown for another.
export function IntentReadingPlace({
  project,
  story,
  children,
}: {
  readonly project: string;
  readonly story: string | undefined;
  readonly children: ReactNode;
}) {
  const page = useContext(ReadingPlaceOnPage);
  if (page === undefined) {
    throw new Error("The Intent reading place is used outside the PageFrame.");
  }
  // A page still showing another project lends none of its place.
  const [mounted] = useState<Mounted>(() => {
    const place = page.project === project ? page : freshPlace(project);
    return {
      place,
      arrangement:
        place.arrangedFor === story
          ? place.arrangement
          : new Map<string, unknown>(),
    };
  });
  useEffect(() => {
    const { place, arrangement } = mounted;
    place.arrangement = arrangement;
    place.arrangedFor = story;
  }, [mounted, story]);
  return <MountedPlace value={mounted}>{children}</MountedPlace>;
}

function useMounted(): Mounted {
  const mounted = useContext(MountedPlace);
  if (mounted === undefined) {
    throw new Error("Intent reading state is used outside Intent's place.");
  }
  return mounted;
}

function useKept<T>(
  kept: Kept,
  key: string,
  initial: () => T,
): [T, Dispatch<SetStateAction<T>>] {
  const [value, setValue] = useState<T>(() =>
    kept.has(key) ? (kept.get(key) as T) : initial(),
  );
  useEffect(() => {
    kept.set(key, value);
  }, [kept, key, value]);
  return [value, setValue];
}

// State kept for the project's reading: restored whenever Intent opens again.
export function useKeptReading<T>(
  key: string,
  initial: () => T,
): [T, Dispatch<SetStateAction<T>>] {
  return useKept(useMounted().place.reading, key, initial);
}

// State kept for the tree's arrangement: restored when Intent opens again
// with the same story selected.
export function useKeptArrangement<T>(
  key: string,
  initial: () => T,
): [T, Dispatch<SetStateAction<T>>] {
  return useKept(useMounted().arrangement, key, initial);
}

// Keeps the reading pane's scroll offset while content still arrives or
// lengthens (for example Proof figures settling under the chosen tab).
// Restoring stops only when the developer scrolls, presses a key or uses a
// pointer in the pane; ending on the first successful match let later growth
// move the place through scroll anchoring.
export function useKeptReadingScroll(pane: RefObject<HTMLElement | null>) {
  const { place } = useMounted();
  useLayoutEffect(() => {
    const element = pane.current;
    if (element === null) return;
    let restoring = place.scrollTop;
    const restore = () => {
      if (restoring === 0) return;
      element.scrollTop = restoring;
    };
    const grown = new ResizeObserver(restore);
    function stop() {
      restoring = 0;
      grown.disconnect();
    }
    const record = () => {
      if (restoring === 0) place.scrollTop = element.scrollTop;
    };
    const interactions = ["wheel", "touchstart", "keydown", "pointerdown"];
    for (const each of interactions) element.addEventListener(each, stop);
    element.addEventListener("scroll", record);
    for (const child of element.children) grown.observe(child);
    restore();
    return () => {
      grown.disconnect();
      for (const each of interactions) element.removeEventListener(each, stop);
      element.removeEventListener("scroll", record);
    };
  }, [pane, place]);
}
