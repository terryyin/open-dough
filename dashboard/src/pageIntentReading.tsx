// The Intent reading place of the project the page shows: what is selected
// (`./intentWorkspaceSelection.ts`), the record entry to return to, the reveal
// round, Purpose/Proof choice (`./IntentFileReading.tsx`), the reading pane's
// scroll offset, and the tree's arrangement: the open folders and the
// reader's folder choices, kept per story (`./useIntentOpenFolders.ts`), the
// last reveal request, and **Changes only** with the expansion it asked for
// (`./useIntentStoryTree.ts`). Disposable page state (ADR 0008), in memory
// only, kept by the page (`./PageFrame.tsx`) beside the chosen mode
// (`./pageIntentMode.tsx`) so it outlasts Intent's own mount: switching to
// Development and back restores it, and a project change starts that
// project's reading afresh. The arrangement belongs to the story selected
// while it was made, and outlasts a whole-project visit: another story starts
// the tree afresh when Intent opens, while the selection and reading stay.
//
// Intent mounted without the page keeps a place only for its own mount.
//
// Each piece is held by the component that uses it, seeded from the place
// when it mounts and written back once rendered (`useKeptReading`,
// `useKeptArrangement`), so the place changes no rendering of its own.
//
// The selected story's views and Project Intent each read within their own
// scope (`IntentReadingScope`), so browsing a project test never replaces the
// story's file, Proof or scroll, nor the reverse. Project Intent's
// arrangement belongs to no story: it is kept with the reading.

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
} from "react";

type Kept = Map<string, unknown>;

// One project's reading place on the page.
type Place = {
  readonly project: string;
  readonly reading: Kept;
  // The arrangement and the selected story it was made for, and the one
  // made with no story selected; neither replaces the other.
  arrangement: Kept;
  arrangedFor: string | undefined;
  projectArrangement: Kept;
  // The reading pane's scroll offset in each scope.
  readonly scrollTops: Map<string, number>;
};

const freshPlace = (project: string): Place => ({
  project,
  reading: new Map(),
  arrangement: new Map(),
  arrangedFor: undefined,
  projectArrangement: new Map(),
  scrollTops: new Map(),
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

type ReadingPlaceProps = {
  readonly project: string;
  readonly story: string | undefined;
  readonly children: ReactNode;
};

// Intent's mount of `project`'s reading place, with `story` the page's
// selected story. Mounted again for each project (`key`), so nothing one
// project kept is shown for another.
export function IntentReadingPlace({
  project,
  story,
  children,
}: ReadingPlaceProps) {
  const page = useContext(ReadingPlaceOnPage);
  // A page still showing another project, or no page, lends no place.
  const [mounted] = useState<Mounted>(() => {
    const place = page?.project === project ? page : freshPlace(project);
    return {
      place,
      arrangement:
        story === undefined
          ? place.projectArrangement
          : place.arrangedFor === story
            ? place.arrangement
            : new Map<string, unknown>(),
    };
  });
  useEffect(() => {
    const { place, arrangement } = mounted;
    if (story === undefined) {
      place.projectArrangement = arrangement;
      return;
    }
    place.arrangement = arrangement;
    place.arrangedFor = story;
  }, [mounted, story]);
  return <MountedPlace value={mounted}>{children}</MountedPlace>;
}

export function ProjectIntentReadingPlace({
  project,
  story,
  children,
}: ReadingPlaceProps) {
  return (
    <IntentReadingPlace key={project} project={project} story={story}>
      <IntentReadingScope name="project">{children}</IntentReadingScope>
    </IntentReadingPlace>
  );
}

// A reading mounted where no Intent perspective holds a place keeps one of
// its own under the project scope, borrowing the page's place when present.
export function IntentReadingPlaceOfItsOwn({
  project,
  children,
}: {
  readonly project: string;
  readonly children: ReactNode;
}) {
  if (useContext(MountedPlace) !== undefined) return children;
  return (
    <ProjectIntentReadingPlace project={project} story={undefined}>
      {children}
    </ProjectIntentReadingPlace>
  );
}

// The scope a piece of reading belongs to: the selected story's views or
// Project Intent; the page's own choices (which scope, which story view)
// belong to neither.
export type IntentReadingScopeName = "story" | "project";

const ReadingScope = createContext<IntentReadingScopeName | undefined>(
  undefined,
);

export function IntentReadingScope({
  name,
  children,
}: {
  readonly name: IntentReadingScopeName;
  readonly children: ReactNode;
}) {
  return <ReadingScope value={name}>{children}</ReadingScope>;
}

const scopedKey = (scope: IntentReadingScopeName | undefined, key: string) =>
  scope === undefined ? key : `${scope}:${key}`;

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
  const scope = useContext(ReadingScope);
  return useKept(useMounted().place.reading, scopedKey(scope, key), initial);
}

// State kept for the tree's arrangement: restored when Intent opens again
// with the same story selected.
export function useKeptArrangement<T>(
  key: string,
  initial: () => T,
): [T, Dispatch<SetStateAction<T>>] {
  const { place, arrangement } = useMounted();
  const scope = useContext(ReadingScope);
  return useKept(
    scope === "project" ? place.reading : arrangement,
    scopedKey(scope, key),
    initial,
  );
}

// The project's place and `key` within the current scope, for state kept
// beside the place's own (`./keptReadingScroll.ts`).
export function useScopedPlace(key: string) {
  const { place } = useMounted();
  return { place, key: scopedKey(useContext(ReadingScope), key) };
}
