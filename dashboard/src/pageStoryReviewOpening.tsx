// A card asks the page to enter Intent for one story. Intent consumes that
// opening after its Changes tab is present, leaving the reading place intact.
import {
  createContext,
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

type Opening = SelectedStory & { readonly sequence: number };
const OpeningControl = createContext<
  | {
      readonly open: (story: SelectedStory) => void;
      readonly opening: Opening | undefined;
      readonly finish: (opening: Opening) => void;
    }
  | undefined
>(undefined);

export function StoryReviewOpeningProvider({
  showIntent,
  children,
}: {
  readonly showIntent?: (() => void) | undefined;
  readonly children: ReactNode;
}) {
  const selection = useContext(StorySelectionOnPage);
  const selected = useSelectedStory();
  const next = useRef(0);
  const [opening, setOpening] = useState<Opening>();
  const finish = (finished: Opening) => {
    setOpening((current) => (current === finished ? undefined : current));
  };
  const matched =
    opening?.project === selected?.project &&
    opening?.identity === selected?.identity;
  useEffect(() => {
    if (opening !== undefined && !matched) finish(opening);
  }, [opening, matched]);
  return (
    <OpeningControl
      value={{
        open: (story) => {
          selection?.select(story);
          setOpening({ ...story, sequence: ++next.current });
          showIntent?.();
        },
        opening: matched ? opening : undefined,
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
