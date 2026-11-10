// Retained comparison navigation shares the page's route and story selection.
import {
  createContext,
  useContext,
  useLayoutEffect,
  useRef,
  type ReactNode,
} from "react";
import type { FollowUpDestination } from "./ciFollowUpReading.ts";
import {
  StorySelectionOnPage,
  useStorySelection,
} from "./pageStorySelection.tsx";

export const FollowUpNavigationOnPage = createContext<
  ((destination: FollowUpDestination | undefined) => void) | undefined
>(undefined);

export function FollowUpLink({
  project,
  destination,
  children,
}: {
  readonly project: string;
  readonly destination: FollowUpDestination;
  readonly children: ReactNode;
}) {
  const navigate = useContext(FollowUpNavigationOnPage);
  const selection = useContext(StorySelectionOnPage);
  const params = new URLSearchParams({
    project,
    perspective: "intent",
    followUp: destination.identity,
    landing: destination.revision,
  });
  return (
    <a
      href={`/?${params}`}
      onClick={(event) => {
        if (
          navigate === undefined ||
          event.button !== 0 ||
          event.metaKey ||
          event.ctrlKey ||
          event.shiftKey ||
          event.altKey
        )
          return;
        event.preventDefault();
        selection?.clear();
        selection?.select({ project, identity: destination.identity });
        navigate(destination);
      }}
    >
      {children}
    </a>
  );
}

// The page keeps the route's selection across Intent mounts. A subsequent
// explicit story selection leaves retained reading, including in Development.
export function FollowUpSelection({
  project,
  destination,
  navigate,
}: {
  readonly project: string;
  readonly destination: FollowUpDestination | undefined;
  readonly navigate: (destination: FollowUpDestination | undefined) => void;
}) {
  const api = useContext(StorySelectionOnPage);
  const { selectedIdentity } = useStorySelection(project);
  const established = useRef<string | undefined>(undefined);
  useLayoutEffect(() => {
    if (destination === undefined) {
      established.current = undefined;
      return;
    }
    const key = `${project}/${destination.identity}/${destination.revision}`;
    if (established.current !== key) {
      established.current = key;
      api?.select({ project, identity: destination.identity });
    } else if (selectedIdentity !== destination.identity) navigate(undefined);
  }, [api, project, destination, selectedIdentity, navigate]);
  return null;
}
