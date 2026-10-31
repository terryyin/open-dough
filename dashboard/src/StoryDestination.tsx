// A URL asks for one project's published identity. Resolution and reveal are
// transient navigation; they never open a session or change membership.
import { useLayoutEffect, useRef } from "react";
import type { DashboardRoute } from "./dashboardRouteUrl.ts";
import type { PublishedWork } from "./publishedWork.ts";
import type { useObservationAttempt } from "./observationAttempt.ts";
import { activeStoryAt } from "./dashboardDestination.ts";
import { revealStory } from "./pageEntries.ts";

export function useStoryDestination({
  route,
  work,
  attempt,
  enabled,
}: {
  readonly route: DashboardRoute;
  readonly work: PublishedWork | undefined;
  readonly attempt: ReturnType<typeof useObservationAttempt>["attempt"];
  readonly enabled: boolean;
}) {
  const target = route.story;
  const knownProject = target?.project === route.source.id;
  const failed = attempt.status === "failed" && !attempt.afterMembership;
  const membership = knownProject && work?.source.id === target.project;
  const listed = knownProject && activeStoryAt(target, work) !== undefined;
  const revealed = useRef<typeof target>(undefined);
  useLayoutEffect(() => {
    if (
      !enabled ||
      target === undefined ||
      !listed ||
      failed ||
      revealed.current === target
    )
      return;
    revealed.current = target;
    const stop = revealStory(target.identity);
    if (stop === undefined) revealed.current = undefined;
    return stop;
  }, [target, listed, failed, enabled]);

  return target === undefined || !enabled || (listed && !failed)
    ? undefined
    : !knownProject
      ? "unknown"
      : failed
        ? "failed"
        : membership
          ? "absent"
          : "loading";
}

export function StoryDestination({
  route,
  status,
  retry,
  showStories,
}: {
  readonly route: DashboardRoute;
  readonly status: ReturnType<typeof useStoryDestination>;
  readonly retry: () => void;
  readonly showStories: () => void;
}) {
  const target = route.story;
  if (target === undefined || status === undefined) return null;
  return (
    <section aria-label="Story destination" className="read-problem">
      <p role="status">
        {status === "unknown" ? (
          <>
            Project {target.project || "(unspecified)"} is not configured. Story{" "}
            {target.identity} cannot be opened here. Choose a configured project
            above.
          </>
        ) : status === "failed" ? (
          <>
            Story {target.identity} could not be resolved because{" "}
            {route.source.label}'s published work could not be read.
          </>
        ) : status === "absent" ? (
          <>
            Story {target.identity} is not listed in {route.source.label}'s
            published work.
          </>
        ) : (
          <>
            Waiting to read {route.source.label}'s published work for story{" "}
            {target.identity}.
          </>
        )}
      </p>
      {status === "failed" && (
        <button type="button" onClick={retry}>
          Retry story destination
        </button>
      )}
      <button type="button" onClick={showStories}>
        Show project stories
      </button>
    </section>
  );
}
