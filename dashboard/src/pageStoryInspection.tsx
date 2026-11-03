// Which story cards are inspected: disposable UI state (ADR 0008), not part
// of the URL. Each card's Inspect story opens and closes its own inline
// detail, several can be open at once, and story navigation's reveal in
// `./Columns.tsx` opens a target's detail from outside its card. Inspection
// never changes the page's selected story (`./pageStorySelection.tsx`).

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

type PageStoryInspection = {
  // Opens `identity`'s detail for `project`, or closes it when it is open.
  readonly toggle: (project: string, identity: string) => void;
  // Opens `identity`'s detail for `project` without closing it.
  readonly open: (project: string, identity: string) => void;
};

const StoryInspectionOnPage = createContext<PageStoryInspection | undefined>(
  undefined,
);

// Per-project inspected identities; changes force consumers to re-render.
const StoryInspectionState = createContext<
  Readonly<Record<string, readonly string[]>>
>({});

export function StoryInspectionProvider({
  children,
}: {
  readonly children: ReactNode;
}) {
  const [byProject, setByProject] = useState<
    Readonly<Record<string, readonly string[]>>
  >({});
  const toggle = useCallback((project: string, identity: string) => {
    setByProject((current) => {
      const inspected = current[project] ?? [];
      return {
        ...current,
        [project]: inspected.includes(identity)
          ? inspected.filter((each) => each !== identity)
          : [...inspected, identity],
      };
    });
  }, []);
  const open = useCallback((project: string, identity: string) => {
    setByProject((current) => {
      const inspected = current[project] ?? [];
      return inspected.includes(identity)
        ? current
        : { ...current, [project]: [...inspected, identity] };
    });
  }, []);
  const api = useMemo(() => ({ toggle, open }), [toggle, open]);
  return (
    <StoryInspectionOnPage value={api}>
      <StoryInspectionState value={byProject}>{children}</StoryInspectionState>
    </StoryInspectionOnPage>
  );
}

const nothingInspected: readonly string[] = [];

// The inspected stories of one project on the page.
export function useStoryInspection(project: string) {
  const api = useContext(StoryInspectionOnPage);
  const byProject = useContext(StoryInspectionState);
  if (api === undefined) {
    throw new Error("Story inspection is used outside the page's PageFrame.");
  }
  const inspected = byProject[project] ?? nothingInspected;
  const toggle = useCallback(
    (identity: string) => {
      api.toggle(project, identity);
    },
    [api, project],
  );
  const open = useCallback(
    (identity: string) => {
      api.open(project, identity);
    },
    [api, project],
  );
  return useMemo(
    () => ({ inspected, toggle, open }),
    [inspected, toggle, open],
  );
}
