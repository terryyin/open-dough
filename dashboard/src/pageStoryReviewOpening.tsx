// A card asks the page to enter Intent for one story. Intent consumes that
// opening first shows Changes, then gives its comparison one file choice.
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  StorySelectionOnPage,
  useSelectedStory,
  type SelectedStory,
} from "./pageStorySelection.tsx";

type Opening = SelectedStory & {
  readonly sequence: number;
  readonly phase: "show" | "read";
};
const OpeningControl = createContext<
  | {
      readonly open: (story: SelectedStory) => void;
      readonly opening: Opening | undefined;
      readonly shown: (opening: Opening) => void;
      readonly finish: (opening: Opening) => void;
    }
  | undefined
>(undefined);

export function StoryReviewOpeningProvider({
  showIntent,
  intentProject,
  children,
}: {
  readonly showIntent?: (() => void) | undefined;
  readonly intentProject: string | undefined;
  readonly children: ReactNode;
}) {
  const selection = useContext(StorySelectionOnPage);
  const selected = useSelectedStory();
  const next = useRef(0);
  const [opening, setOpening] = useState<Opening>();
  const finish = useCallback((finished: Opening) => {
    setOpening((current) =>
      current?.sequence === finished.sequence ? undefined : current,
    );
  }, []);
  const shown = useCallback((displayed: Opening) => {
    setOpening((current) =>
      current === displayed ? { ...current, phase: "read" } : current,
    );
  }, []);
  const matched =
    opening !== undefined &&
    opening.project === intentProject &&
    opening.project === selected?.project &&
    opening.identity === selected.identity;
  useEffect(() => {
    if (opening !== undefined && !matched) finish(opening);
  }, [opening, matched, finish]);
  return (
    <OpeningControl
      value={{
        open: (story) => {
          selection?.select(story);
          setOpening({ ...story, sequence: ++next.current, phase: "show" });
          showIntent?.();
        },
        opening: matched ? opening : undefined,
        shown,
        finish,
      }}
    >
      {children}
    </OpeningControl>
  );
}

export function useOpenStoryChanges() {
  return useContext(OpeningControl)?.open;
}

export function useStoryReviewOpening(project: string | undefined) {
  const control = useContext(OpeningControl);
  const opening = control?.opening;
  return opening?.project === project ? opening : undefined;
}

export function useFinishStoryReviewOpening() {
  return useContext(OpeningControl)?.finish;
}

export function useShowStoryReviewOpening() {
  return useContext(OpeningControl)?.shown;
}
