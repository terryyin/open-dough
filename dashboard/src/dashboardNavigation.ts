import { useCallback, useLayoutEffect, useRef, useState } from "react";
import type { OpenRoster } from "./AgentAssignmentFacts.tsx";
import { isFromPortrait, useDashboardRoute } from "./dashboardRoute.ts";
import { useStoryDestination } from "./StoryDestination.tsx";
import { useProjectKeyboardNavigation } from "./projectKeyboardNavigation.ts";
import type { useObservationAttempt } from "./observationAttempt.ts";
import type { PublishedSource } from "./publishedSource.ts";
import type { PublishedWork } from "./publishedWork.ts";
import {
  focusBoard,
  returnFocusTo,
  workHolding,
  type FocusedWork,
} from "./workFocus.ts";

// A portrait's opening of the roster: its agent, and the project it was opened
// in. Back returns the keyboard to that portrait, or, once it is gone, to its
// work's card in the same project.
type RosterOpening = {
  readonly agent: string;
  readonly element: HTMLElement;
  readonly sourceId: string;
  readonly work: FocusedWork | undefined;
};

// Coordinate page history with the mounted roster's opening and return focus.
// The route retains ownership of URL destinations and project selection.
export function useDashboardNavigation({
  source,
  work,
  attempt,
  suspended,
  selectSource,
}: {
  readonly source: PublishedSource;
  readonly work: PublishedWork | undefined;
  readonly attempt: ReturnType<typeof useObservationAttempt>["attempt"];
  readonly suspended: boolean;
  readonly selectSource: (source: PublishedSource) => void;
}) {
  const [opening, setOpening] = useState<RosterOpening | undefined>();
  const latestOpening = useRef<RosterOpening | undefined>(undefined);
  const closed = useRef<RosterOpening | undefined>(undefined);
  const returningFromRoster = useRef(false);

  const onReturnToStories = useCallback(() => {
    returningFromRoster.current = true;
    closed.current = opening ?? latestOpening.current;
    setOpening(undefined);
  }, [opening]);

  const onForwardToRoster = useCallback((targetSourceId: string) => {
    if (latestOpening.current?.sourceId === targetSourceId) {
      setOpening(latestOpening.current);
    }
  }, []);

  const {
    route,
    selectProject,
    openRoster: navigateToRoster,
    showStories,
  } = useDashboardRoute({
    sourceId: source.id,
    suspended,
    selectSource,
    onReturnToStories,
    onForwardToRoster,
  });

  const destination = useStoryDestination({
    route,
    work,
    attempt,
    enabled: !suspended,
  });
  useProjectKeyboardNavigation({
    source,
    selectProject,
    enabled: !suspended,
  });

  const openRoster: OpenRoster = (agent, element) => {
    const openingInfo: RosterOpening = {
      agent,
      element,
      sourceId: source.id,
      work: workHolding(element),
    };
    latestOpening.current = openingInfo;
    setOpening(openingInfo);
    navigateToRoster(source);
  };

  const onBack = () => {
    if (
      isFromPortrait(window.history.state) &&
      opening?.sourceId === source.id
    ) {
      window.history.back();
    } else {
      onReturnToStories();
      showStories(source);
    }
  };

  useLayoutEffect(() => {
    if (route.view === "roster") {
      return;
    }
    if (!returningFromRoster.current) {
      return;
    }
    if (work === undefined && closed.current === undefined) {
      return;
    }
    returningFromRoster.current = false;
    const opener = closed.current;
    closed.current = undefined;
    // Work identities never carry focus into another project.
    if (opener === undefined || opener.sourceId !== source.id) {
      focusBoard();
    } else if (opener.element.isConnected) {
      opener.element.focus();
    } else if (opener.work !== undefined) {
      returnFocusTo({ ...opener.work, link: undefined });
    } else {
      focusBoard();
    }
  }, [route.view, source.id, work]);

  return {
    route,
    selectProject,
    showStories,
    openRoster,
    onBack,
    opening,
    destination,
  } as const;
}
