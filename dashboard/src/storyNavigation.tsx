// Semantic references navigate through the page's published observation. Source
// evidence links keep their own policy in RecordedLink and StoryCardDependencies.
import {
  createContext,
  useContext,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type { PublishedSource } from "./publishedSource.ts";
import type { PublishedWork } from "./publishedWork.ts";
import {
  activeStoryAt,
  type StoryDestination,
} from "./dashboardDestination.ts";
import { untilOwnMove } from "./storyCardFocus.ts";
import { usePageRange } from "./recentlyDoneRange.ts";
import { revealStory } from "./pageEntries.ts";
import {
  isStoryReferenceAction,
  StoryReferenceNotice,
} from "./StoryReferenceNotice.tsx";
import "./story-navigation.css";

type Journey = {
  readonly reference: StoryDestination;
  readonly project: PublishedSource | undefined;
  readonly demand?: number;
  readonly catalog?: PublishedWork["done"];
  readonly cancelled?: { readonly problem: string; readonly pending: boolean };
};
type Navigation = {
  readonly follow: (reference: StoryDestination) => void;
  readonly opening: StoryDestination | undefined;
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
  const range = usePageRange();
  const [journey, setJourney] = useState<Journey>();
  const revealed = useRef<Journey | undefined>(undefined);
  const follows = journey?.project?.id === selected && !suspended;
  const current =
    follows && !journey.cancelled && work?.source.id === selected
      ? work
      : undefined;
  const identity = activeStoryAt(journey?.reference, current)?.identity;
  const sourceId = current?.source.id;
  const opening = useMemo(
    () =>
      identity === undefined || sourceId === undefined
        ? undefined
        : { project: sourceId, identity },
    [journey, identity, sourceId],
  );
  const answer =
    journey?.demand === undefined ? undefined : range.answerOf(journey.demand);
  const reached =
    !journey?.cancelled && (opening !== undefined || answer === "reached");
  const pending =
    journey !== undefined &&
    follows &&
    !reached &&
    (journey.cancelled?.pending ??
      (reading ||
        (current !== undefined &&
          (answer === undefined || answer === "pending"))));
  const name = journey?.reference.identity;
  const readProblem =
    failure ??
    (current?.done?.status === "unavailable"
      ? current.done.problem
      : undefined);
  const problem =
    journey?.cancelled?.problem ??
    (journey === undefined || reached
      ? undefined
      : pending
        ? `Reading ${journey.project.label} to find ${name}…`
        : follows && readProblem !== undefined
          ? `Could not read ${journey.project.label} to find ${name}. ${readProblem}`
          : `${name} is unavailable in ${journey.project?.label ?? "the configured projects"}'s dashboard.`);
  useLayoutEffect(() => {
    if (journey === undefined || current === undefined || opening !== undefined)
      return;
    if (
      journey.demand === undefined ||
      (answer === "absent" && journey.catalog !== current.done)
    ) {
      // An explicit retry must place the destination against the observation
      // it asked for, rather than settling absence from the carried catalog.
      if (reading) return;
      setJourney({
        ...journey,
        catalog: current.done,
        demand: range.demandStory(
          current.source.id,
          journey.reference.identity,
        ),
      });
      return;
    }
    if (answer === "superseded") {
      setJourney(undefined);
      return;
    }
    if (answer !== "reached" || revealed.current === journey) return;
    revealed.current = journey;
    const stop = revealStory(journey.reference.identity);
    if (stop === undefined) revealed.current = undefined;
    return stop;
  }, [journey, sourceId, current?.done, opening, reading, answer]);
  useLayoutEffect(() => {
    if (journey === undefined) return;
    if (journey.project !== undefined && !follows) {
      setJourney(undefined);
      return;
    }
    if (!reached && !journey.cancelled) {
      const giveUp = (event: Event) => {
        if (event.type !== "pointerdown") {
          setJourney(undefined);
          return;
        }
        // Stop the journey now, but let the pointer's chosen action complete
        // before removing its notice: collapsing that space between down and
        // click would move the action out from under the pointer.
        const cancelled = {
          ...journey,
          cancelled: { problem: problem ?? "", pending },
        };
        setJourney(cancelled);
        const clear = () => {
          window.removeEventListener("click", clear);
          window.removeEventListener("pointerup", released);
          window.removeEventListener("pointercancel", clear);
          setJourney((current) =>
            current === cancelled ? undefined : current,
          );
        };
        const released = () => {
          setTimeout(clear);
        };
        window.addEventListener("click", clear, { once: true });
        window.addEventListener("pointerup", released, { once: true });
        window.addEventListener("pointercancel", clear, { once: true });
      };
      return journey.demand === undefined
        ? untilOwnMove(giveUp, isStoryReferenceAction)
        : range.givenUpOnOwnMove(
            journey.demand,
            giveUp,
            isStoryReferenceAction,
          );
    }
    return;
  }, [journey, follows, pending, reached, problem]);
  return {
    navigation: {
      opening,
      follow: (reference: StoryDestination) => {
        const project = projects.find(
          (project) => project.id === reference.project,
        );
        if (project !== undefined) show(project);
        setJourney({ reference, project });
      },
    },
    notice: (
      <StoryReferenceNotice
        problem={problem}
        pending={pending}
        retry={
          journey?.project === undefined
            ? undefined
            : () => {
                retry();
                setJourney({
                  reference: journey.reference,
                  project: journey.project,
                });
              }
        }
        dismiss={() => {
          setJourney(undefined);
        }}
      />
    ),
  };
}

// Runs inside PageFrame so semantic references and session journeys share its
// one Recently done range. The caller places the persistent notice by read status.
export function StoryReferenceNavigation({
  children,
  ...props
}: Parameters<typeof useStoryReferenceJourney>[0] & {
  readonly children: (notice: ReactNode) => ReactNode;
}) {
  const journey = useStoryReferenceJourney(props);
  return (
    <StoryNavigationOnPage value={journey.navigation}>
      {children(journey.notice)}
    </StoryNavigationOnPage>
  );
}
