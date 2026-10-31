// Routing for the dashboard route (./dashboardRouteUrl.ts): one history entry
// per navigation, and the route Back and Forward restore.

import { useEffect, useRef, useState } from "react";
import type { PublishedSource } from "./publishedSource.ts";
import { useProjects } from "./projectList.tsx";
import {
  buildRouteUrl,
  parseRoute,
  type DashboardPerspective,
  type DashboardRoute,
} from "./dashboardRouteUrl.ts";

export function isFromPortrait(state: unknown): boolean {
  return (
    typeof state === "object" &&
    state !== null &&
    "fromPortrait" in state &&
    state.fromPortrait === true
  );
}

export function useDashboardRoute({
  sourceId,
  suspended = false,
  selectSource,
  onReturnToStories,
  onForwardToRoster,
}: {
  sourceId: string;
  suspended?: boolean;
  selectSource: (next: PublishedSource) => void;
  onReturnToStories: () => void;
  onForwardToRoster: (targetSourceId: string) => void;
}) {
  const projects = useProjects();
  const initial = useRef(parseRoute(window.location, projects));
  if (!suspended && initial.current.normalizedUrl !== undefined) {
    window.history.replaceState(null, "", initial.current.normalizedUrl);
    initial.current = { ...initial.current, normalizedUrl: undefined };
  }
  const [route, setRoute] = useState<DashboardRoute>(initial.current.route);
  const settingsSelection = useRef<PublishedSource | undefined>(undefined);
  // Shows a route as one new history entry.
  const pushRoute = (
    next: Omit<DashboardRoute, "story">,
    state: unknown = null,
  ) => {
    window.history.pushState(state, "", buildRouteUrl(next, projects));
    setRoute(next);
  };

  const selectProject = (next: PublishedSource) => {
    if (next.id === sourceId && route.story === undefined) {
      return;
    }
    const nextRoute = {
      source: next,
      view: route.view,
      perspective: route.perspective,
    };
    if (!suspended) pushRoute(nextRoute);
    else {
      settingsSelection.current = next;
      const params = new URLSearchParams(window.location.search);
      params.set("project", next.id);
      params.delete("story");
      window.history.replaceState(window.history.state, "", `/?${params}`);
      setRoute(nextRoute);
    }
    selectSource(next);
  };

  // Shows the selected project in another perspective, as one history entry,
  // keeping Development's view to return to.
  const selectPerspective = (perspective: DashboardPerspective) => {
    if (perspective === route.perspective || suspended) {
      return;
    }
    pushRoute({ source: route.source, view: route.view, perspective });
  };

  const openRoster = (source: PublishedSource) => {
    pushRoute(
      { source, view: "roster", perspective: "development" },
      { fromPortrait: true },
    );
  };

  // Shows a project's Development stories, from either view or perspective
  // and whichever project is selected, as one history entry, as the roster's
  // Back does and a sidebar entry does; nothing when they are already shown.
  const showStories = (next: PublishedSource) => {
    if (
      next.id === sourceId &&
      route.view === "stories" &&
      route.perspective === "development" &&
      route.story === undefined
    ) {
      return;
    }
    pushRoute({ source: next, view: "stories", perspective: "development" });
    selectSource(next);
  };

  const onPopStateRef = useRef<() => void>(() => {});
  onPopStateRef.current = () => {
    if (new URLSearchParams(window.location.search).get("view") === "settings")
      return;
    const savedSelection = settingsSelection.current;
    if (
      savedSelection &&
      projects.some((project) => project.id === savedSelection.id)
    ) {
      window.history.replaceState(
        null,
        "",
        buildRouteUrl({ ...route, source: savedSelection }, projects),
      );
    }
    settingsSelection.current = undefined;
    const parsed = parseRoute(window.location, projects);
    if (parsed.normalizedUrl) {
      window.history.replaceState(null, "", parsed.normalizedUrl);
    }
    const nextRoute = parsed.route;
    const targetSource = nextRoute.source;
    const targetView = nextRoute.view;

    if (targetView !== route.view) {
      if (targetView === "stories" && route.view === "roster") {
        onReturnToStories();
      } else if (targetView === "roster" && route.view === "stories") {
        onForwardToRoster(targetSource.id);
      }
    }
    // The same project's history may carry a new story, or leave targeting.
    setRoute(nextRoute);

    if (targetSource.id !== sourceId) {
      selectSource(targetSource);
    }
  };

  useEffect(() => {
    // Keep one subscription while the app opens/closes its global view. A
    // synchronous render in another popstate listener must not remove ours
    // before this same event reaches it.
    const onPopState = () => {
      onPopStateRef.current();
    };
    window.addEventListener("popstate", onPopState);
    return () => {
      window.removeEventListener("popstate", onPopState);
    };
  }, []);

  return {
    route,
    selectProject,
    selectPerspective,
    openRoster,
    showStories,
  };
}
