// A card asks Intent to open one story's comparison at a file, scoped to the
// whole story or to one of its sessions.
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

// The story and, from a session's card, that session's scope key.
type OpeningRequest = SelectedStory & {
  readonly session?: string | undefined;
};
type Opening = OpeningRequest & {
  readonly sequence: number;
};
const OpeningControl = createContext<
  | {
      readonly open: (request: OpeningRequest) => void;
      readonly opening: Opening | undefined;
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
        open: (request) => {
          selection?.select({
            project: request.project,
            identity: request.identity,
          });
          setOpening({ ...request, sequence: ++next.current });
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
