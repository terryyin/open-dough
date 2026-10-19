// Semantic references navigate through the page's published observation. Source
// evidence links keep their own policy in RecordedLink and DependenciesCard.
import {
  createContext,
  useContext,
  useLayoutEffect,
  useMemo,
  useState,
} from "react";
import type { PublishedSource } from "./publishedSource.ts";
import type { PublishedWork } from "./publishedWork.ts";
import { untilOwnMove } from "./workFocus.ts";
import "./story-navigation.css";

type Reference = {
  readonly sourceId: string;
  readonly identity: string;
};
type Journey = {
  readonly reference: Reference;
  readonly project: PublishedSource | undefined;
};
export type StoryOpening = Reference;
type Navigation = {
  readonly follow: (reference: Reference) => void;
  readonly opening: StoryOpening | undefined;
};
export const StoryNavigationOnPage = createContext<Navigation | undefined>(
  undefined,
);

export function useStoryNavigation() {
  const navigation = useContext(StoryNavigationOnPage);
  if (navigation === undefined)
    throw new Error("Story references need the dashboard page.");
  return navigation;
}

export function useStoryReferenceJourney({
  projects,
  selected,
  work,
  reading,
  failure,
  show,
  retry,
  suspended,
}: {
  readonly projects: readonly PublishedSource[];
  readonly selected: string;
  readonly work: PublishedWork | undefined;
  readonly reading: boolean;
  readonly failure: string | undefined;
  readonly show: (project: PublishedSource) => void;
  readonly retry: () => void;
  readonly suspended: boolean;
}) {
  const [journey, setJourney] = useState<Journey>();
  const follows = journey?.project?.id === selected && !suspended;
  const current = follows && work?.source.id === selected ? work : undefined;
  const identity =
    current !== undefined &&
    journey !== undefined &&
    [...current.backlog, ...current.taken].some(
      (entry) => entry.identity === journey.reference.identity,
    )
      ? journey.reference.identity
      : undefined;
  const sourceId = current?.source.id;
  const opening = useMemo(
    () =>
      identity === undefined || sourceId === undefined
        ? undefined
        : { sourceId, identity },
    [journey, identity, sourceId],
  );
  const pending =
    journey !== undefined && follows && opening === undefined && reading;
  useLayoutEffect(() => {
    if (journey === undefined) return;
    if (journey.project !== undefined && !follows) {
      setJourney(undefined);
      return;
    }
    if (pending)
      return untilOwnMove(() => {
        setJourney(undefined);
      });
    return;
  }, [journey, follows, pending]);
  const name = journey?.reference.identity;
  const problem =
    journey === undefined || opening !== undefined
      ? undefined
      : pending
        ? `Reading ${journey.project.label} to find ${name}…`
        : follows && failure !== undefined
          ? `Could not read ${journey.project.label} to find ${name}. ${failure}`
          : `${name} is unavailable in ${journey.project?.label ?? "the configured projects"}'s dashboard.`;
  return {
    navigation: {
      opening,
      follow: (reference: Reference) => {
        const project = projects.find(
          (project) => project.id === reference.sourceId,
        );
        if (project !== undefined) show(project);
        setJourney({ reference, project });
      },
    },
    notice: (
      <div
        className="announcement story-reference-notice"
        role="status"
        aria-label="Story reference navigation"
      >
        {problem !== undefined && (
          <>
            <p>{problem}</p>
            <div className="story-reference-actions">
              {!pending && journey?.project !== undefined && (
                <button
                  type="button"
                  className="frame-button"
                  onClick={() => {
                    retry();
                    setJourney({ ...journey });
                  }}
                >
                  Retry story reference
                </button>
              )}
              <button
                type="button"
                className="frame-button"
                onClick={() => {
                  setJourney(undefined);
                }}
              >
                Dismiss story reference
              </button>
            </div>
          </>
        )}
      </div>
    ),
  };
}
